package middleware

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"yemo-api/pkg/response"
)

// RateLimiterConfig holds configuration for the rate limiter
type RateLimiterConfig struct {
	MaxRequests int
	Window      time.Duration
	BanDuration time.Duration
	DataDir     string
	LogDir      string
}

type banInfo struct {
	BannedAt string `json:"bannedAt"`
	Reason   string `json:"reason"`
	By       string `json:"by"`
}

type clientRate struct {
	mu         sync.Mutex
	timestamps []int64
}

type RateLimiter struct {
	config       RateLimiterConfig
	clients      sync.Map // map[string]*clientRate
	banned       map[string]banInfo
	bannedMutex  sync.RWMutex
	bannedFile   string
	requestLog   string
}

var GlobalRateLimiter *RateLimiter

func NewRateLimiter(config RateLimiterConfig) *RateLimiter {
	rl := &RateLimiter{
		config:     config,
		banned:     make(map[string]banInfo),
		bannedFile: filepath.Join(config.DataDir, "banned-ips.json"),
		requestLog: filepath.Join(config.LogDir, "request-logs.log"),
	}
	rl.ensureFiles()
	rl.loadBanned()
	go rl.cleanupLoop()
	GlobalRateLimiter = rl
	return rl
}

func (rl *RateLimiter) ensureFiles() {
	if _, err := os.Stat(rl.config.DataDir); os.IsNotExist(err) {
		os.MkdirAll(rl.config.DataDir, 0755)
	}
	if _, err := os.Stat(rl.config.LogDir); os.IsNotExist(err) {
		os.MkdirAll(rl.config.LogDir, 0755)
	}
	if _, err := os.Stat(rl.bannedFile); os.IsNotExist(err) {
		os.WriteFile(rl.bannedFile, []byte("{}"), 0644)
	}
	if _, err := os.Stat(rl.requestLog); os.IsNotExist(err) {
		os.WriteFile(rl.requestLog, []byte(""), 0644)
	}
}

func (rl *RateLimiter) loadBanned() {
	rl.bannedMutex.Lock()
	defer rl.bannedMutex.Unlock()

	data, err := os.ReadFile(rl.bannedFile)
	if err == nil {
		json.Unmarshal(data, &rl.banned)
	}
}

func (rl *RateLimiter) saveBanned() {
	rl.bannedMutex.RLock()
	data, _ := json.MarshalIndent(rl.banned, "", "  ")
	rl.bannedMutex.RUnlock()
	os.WriteFile(rl.bannedFile, data, 0644)
}

func (rl *RateLimiter) appendLog(line string) {
	f, err := os.OpenFile(rl.requestLog, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err == nil {
		defer f.Close()
		f.WriteString(line + "\n")
	}
}

func (rl *RateLimiter) BanIP(ip, reason string) {
	rl.bannedMutex.Lock()
	now := time.Now().UTC().Format(time.RFC3339)
	rl.banned[ip] = banInfo{
		BannedAt: now,
		Reason:   reason,
		By:       "rateLimiter",
	}
	rl.bannedMutex.Unlock()
	rl.saveBanned()
	rl.appendLog("[BAN] " + now + " " + ip + " reason=" + reason)
}

func (rl *RateLimiter) UnbanIP(ip string) bool {
	rl.bannedMutex.Lock()
	defer rl.bannedMutex.Unlock()
	if _, exists := rl.banned[ip]; exists {
		delete(rl.banned, ip)

		data, _ := json.MarshalIndent(rl.banned, "", "  ")
		os.WriteFile(rl.bannedFile, data, 0644)

		now := time.Now().UTC().Format(time.RFC3339)
		go rl.appendLog("[UNBAN] " + now + " " + ip)
		return true
	}
	return false
}

func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(60 * time.Second)
	for range ticker.C {
		now := time.Now().UnixMilli()
		windowMs := rl.config.Window.Milliseconds()

		rl.clients.Range(func(key, value interface{}) bool {
			client := value.(*clientRate)
			client.mu.Lock()

			var recent []int64
			for _, t := range client.timestamps {
				if now-t <= windowMs {
					recent = append(recent, t)
				}
			}
			client.timestamps = recent
			isEmpty := len(recent) == 0

			client.mu.Unlock()

			if isEmpty {
				rl.clients.Delete(key)
			}
			return true
		})
	}
}

func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := getIP(r)

		rl.bannedMutex.RLock()
		info, banned := rl.banned[ip]
		rl.bannedMutex.RUnlock()

		if banned {
			response.JSON(w, 403, map[string]string{
				"success":  "false",
				"error":    "Your IP has been blocked due to abuse or rate limit violations.",
				"note":     "Contact the owner to request unblocking.",
				"bannedAt": info.BannedAt,
				"reason":   info.Reason,
			})
			go rl.appendLog("[BLOCKED_REQ] " + time.Now().UTC().Format(time.RFC3339) + " " + ip + " path=" + r.URL.Path + " method=" + r.Method + " - blocked")
			return
		}

		now := time.Now().UnixMilli()
		windowMs := rl.config.Window.Milliseconds()

		val, _ := rl.clients.LoadOrStore(ip, &clientRate{})
		client := val.(*clientRate)

		client.mu.Lock()

		client.timestamps = append(client.timestamps, now)

		// Filter old
		var recent []int64
		for _, t := range client.timestamps {
			if now-t <= windowMs {
				recent = append(recent, t)
			}
		}
		client.timestamps = recent
		count := len(recent)

		client.mu.Unlock()

		go func() {
			// Async log
			strCount := fmt.Sprintf("%d", count)
			rl.appendLog("[REQ] " + time.Now().UTC().Format(time.RFC3339) + " " + ip + " " + r.Method + " " + r.URL.Path + " count=" + strCount)
		}()

		if count > rl.config.MaxRequests {
			rl.BanIP(ip, fmt.Sprintf("exceeded_%d_per_%s", rl.config.MaxRequests, rl.config.Window))
			response.JSON(w, 429, map[string]string{
				"success": "false",
				"error":   "Rate limit exceeded - your IP has been blocked.",
				"note":    "Contact the owner to request unblocking.",
			})
			return
		}

		next.ServeHTTP(w, r)
	})
}

func getIP(r *http.Request) string {
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		return forwarded
	}
	// RemoteAddr contains port, strip it
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}

package server

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"yemo-api/pkg/loader"
	"yemo-api/pkg/middleware"
	"yemo-api/pkg/response"
	"yemo-api/pkg/utils"

	"github.com/gorilla/mux"
)

type Server struct {
	router *mux.Router
	http   *http.Server
	docs   []map[string]interface{}
}

func New() *Server {
	return &Server{
		router: mux.NewRouter(),
	}
}

func (s *Server) Init() {
	utils.Logger.Info("Starting server initialization...")

	// Middleware Order: Logger -> Recovery -> RateLimiter
	// Logger wraps everything to time it.
	// Recovery wraps logic to catch panics.
	s.router.Use(middleware.LoggerMiddleware)
	s.router.Use(middleware.RecoveryMiddleware)

	// Rate Limiter
	rlConfig := middleware.RateLimiterConfig{
		MaxRequests: 25,
		Window:      10 * time.Second,
		DataDir:     "data",
		LogDir:      "logs",
	}
	rl := middleware.NewRateLimiter(rlConfig)
	s.router.Use(rl.Middleware)

	// Admin unban endpoint
	s.router.HandleFunc("/admin/unban", s.handleAdminUnban).Methods("POST")

	utils.Logger.Info("Loading API endpoints...")
	s.docs = loader.LoadRoutes(s.router)

	// Files endpoint (serving uploaded files)
	// JS: `GET /files/:filename`
	fileHandler := http.StripPrefix("/files/", http.FileServer(http.Dir("files")))
	s.router.PathPrefix("/files/").Handler(fileHandler).Methods("GET")

	// Static files
	s.router.HandleFunc("/", s.serveIndex)
	s.router.HandleFunc("/docs", s.serveDocs)
	s.router.HandleFunc("/openapi.json", s.serveOpenAPI)

	// Legal
	s.router.PathPrefix("/legal/").Handler(http.StripPrefix("/legal/", http.FileServer(http.Dir("public/legal"))))

	// Catch all for 404
	s.router.NotFoundHandler = http.HandlerFunc(s.handleNotFound)
}

func (s *Server) Start() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	addr := ":" + port
	s.http = &http.Server{
		Addr:    addr,
		Handler: s.router,
	}

	// Logs
	utils.Logger.Ready("Local: http://localhost:" + port)
	s.logNetwork(port)
	utils.Logger.Ready("Ready for connections")

	// Start server in goroutine
	go func() {
		if err := s.http.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			utils.Logger.Error(fmt.Sprintf("Listen: %s", err))
			os.Exit(1)
		}
	}()

	// Graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	utils.Logger.Info("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := s.http.Shutdown(ctx); err != nil {
		utils.Logger.Error(fmt.Sprintf("Server Shutdown Failed:%+v", err))
	}
	utils.Logger.Info("Server exited")
}

func (s *Server) logNetwork(port string) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return
	}
	for _, i := range ifaces {
		addrs, err := i.Addrs()
		if err != nil {
			continue
		}
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip != nil && ip.To4() != nil && !ip.IsLoopback() {
				utils.Logger.Ready(fmt.Sprintf("Network: http://%s:%s", ip.String(), port))
			}
		}
	}
}

func (s *Server) serveIndex(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "public/index.html")
}

func (s *Server) serveDocs(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "public/docs.html")
}

func (s *Server) serveOpenAPI(w http.ResponseWriter, r *http.Request) {
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	baseURL := fmt.Sprintf("%s://%s", scheme, r.Host)

	// Inject baseURL into docs?
	// The prompt format:
	// { "baseURL": ..., "endpoints": [...] }

	resp := map[string]interface{}{
		"title":       "YeMo API's.",
		"description": "Welcome to the API documentation...",
		"baseURL":     baseURL,
		"endpoints":   s.docs,
	}

	// Add url with base to each endpoint if needed
	finalDocs := make([]map[string]interface{}, len(s.docs))
	for i, doc := range s.docs {
		// Clone map
		newDoc := make(map[string]interface{})
		for k, v := range doc {
			newDoc[k] = v
		}

		route := newDoc["route"].(string)
		params := newDoc["params"].([]string)

		query := ""
		if len(params) > 0 {
			query = "?param=YOUR_" + strings.ToUpper(params[0]) // Simplistic example
		}

		newDoc["url"] = fmt.Sprintf("%s%s%s", baseURL, route, query)
		finalDocs[i] = newDoc
	}

	resp["endpoints"] = finalDocs

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (s *Server) handleNotFound(w http.ResponseWriter, r *http.Request) {
	// Check Accept header
	accept := r.Header.Get("Accept")
	if strings.Contains(accept, "text/html") {
		w.WriteHeader(404)
		http.ServeFile(w, r, "public/404.html")
		return
	}
	response.Error(w, 404, "Endpoint not found")
}

func (s *Server) handleAdminUnban(w http.ResponseWriter, r *http.Request) {
	adminKey := os.Getenv("ADMIN_KEY")
	if adminKey == "" {
		response.Error(w, 500, "ADMIN_KEY not configured on server.")
		return
	}

	provided := r.Header.Get("X-Admin-Key")
	if provided == "" {
		provided = r.URL.Query().Get("adminKey")
	}

	if provided != adminKey {
		response.Error(w, 401, "Unauthorized. Provide valid admin key in X-Admin-Key header.")
		return
	}

	// Parse body for IP
	var req struct {
		IP string `json:"ip"`
		AdminKey string `json:"adminKey"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, 400, "Invalid JSON body")
		return
	}

	if req.IP == "" {
		response.Error(w, 400, "Provide ip in request body to unban.")
		return
	}

	ok := middleware.GlobalRateLimiter.UnbanIP(req.IP)
	if ok {
		response.JSON(w, 200, map[string]interface{}{
			"success": true,
			"message": fmt.Sprintf("IP %s unbanned.", req.IP),
		})
	} else {
		response.JSON(w, 404, map[string]interface{}{
			"success": false,
			"error":   fmt.Sprintf("IP %s not found in ban list.", req.IP),
		})
	}
}

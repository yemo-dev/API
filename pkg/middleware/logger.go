package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/fatih/color"
)

type responseWriterWrapper struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriterWrapper) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func LoggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		wrapper := &responseWriterWrapper{ResponseWriter: w, statusCode: 200}

		defer func() {
			duration := time.Since(start)

			// If panic happens, status might not be set or might be default 200 if WriteHeader wasn't called.
			// However, if Recovery middleware runs *after* Logger (wrapped inside Logger), Recovery will handle the response.
			// But wrapper won't capture the status written by Recovery unless Recovery writes to *this* wrapper.
			// If Recovery middleware is inside this one, it will write to wrapper.

			// Log format: GET /api/users [200] (45ms)
			methodColor := color.New(color.FgCyan).SprintFunc()
			statusColor := color.New(color.FgGreen).SprintFunc()
			if wrapper.statusCode >= 400 {
				statusColor = color.New(color.FgRed).SprintFunc()
			} else if wrapper.statusCode >= 300 {
				statusColor = color.New(color.FgYellow).SprintFunc()
			}

			fmt.Printf("%s %s [%s] (%dms)\n", methodColor(r.Method), r.URL.Path, statusColor(fmt.Sprint(wrapper.statusCode)), duration.Milliseconds())
		}()

		next.ServeHTTP(wrapper, r)
	})
}

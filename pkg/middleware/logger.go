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

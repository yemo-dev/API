package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"
	"strings"

	"yemo-api/pkg/response"
	"yemo-api/pkg/utils"
)

func RecoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				utils.Logger.Error(fmt.Sprintf("Panic recovered: %v\n%s", err, debug.Stack()))

				accept := r.Header.Get("Accept")
				if strings.Contains(accept, "text/html") {
					w.WriteHeader(500)
					http.ServeFile(w, r, "public/500.html")
					return
				}

				response.Error(w, 500, "Internal Server Error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

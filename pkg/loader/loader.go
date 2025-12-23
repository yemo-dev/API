package loader

import (
	"fmt"
	"net/http"
	"path/filepath"
	"runtime"
	"strings"

	"yemo-api/pkg/utils"

	"github.com/gorilla/mux"
)

// Endpoint interface defines the structure for API endpoints
type Endpoint interface {
	Name() string
	Description() string
	Category() string
	Methods() []string
	Params() []string
	ParamsSchema() map[string]interface{}
	Run(w http.ResponseWriter, r *http.Request)
}

// Registry stores registered endpoints
var Registry = make(map[string]Endpoint)

// Register adds an endpoint to the registry.
func Register(e Endpoint) {
	_, file, _, ok := runtime.Caller(1)
	if !ok {
		utils.Logger.Error("Failed to get caller information for endpoint registration")
		return
	}

	file = filepath.ToSlash(file)
	idx := strings.Index(file, "/api/")
	if idx == -1 {
		utils.Logger.Warn(fmt.Sprintf("Endpoint registered from outside api/ folder: %s", file))
		return
	}

	routePath := file[idx:] // /api/...
	routePath = strings.TrimSuffix(routePath, ".go")

	Registry[routePath] = e
}

// LoadRoutes configures the router with registered endpoints
func LoadRoutes(r *mux.Router) []map[string]interface{} {
	var docs []map[string]interface{}

	for route, endpoint := range Registry {
		methods := endpoint.Methods()
		if len(methods) == 0 {
			methods = []string{"GET"}
		}

		r.HandleFunc(route, endpoint.Run).Methods(methods...)

		utils.Logger.Info(fmt.Sprintf("endpoint loaded: %s %v", route, methods))

		docs = append(docs, map[string]interface{}{
			"name":         endpoint.Name(),
			"description":  endpoint.Description(),
			"category":     endpoint.Category(),
			"route":        route,
			"url":          route,
			"methods":      methods,
			"params":       endpoint.Params(),
			"paramsSchema": endpoint.ParamsSchema(),
		})
	}

	utils.Logger.Ready(fmt.Sprintf("Loaded %d endpoints", len(Registry)))
	return docs
}

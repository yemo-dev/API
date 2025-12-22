package response

import (
	"encoding/json"
	"net/http"
	"time"
)

// APIResponse matches the YeMo API response format
type APIResponse struct {
	StatusCode  int         `json:"statusCode"`
	Timestamp   string      `json:"timestamp,omitempty"`
	Attribution string      `json:"attribution,omitempty"`
	Data        interface{} `json:"data,omitempty"` // For embedding raw data, but actually the prompt says wrap the *json data*
	// Wait, the prompt says:
	// {
	//   "statusCode": 200,
	//   "timestamp": "...",
	//   "attribution": "@YeMo",
	//   ...data asli
	// }
	// This implies flattening "data asli" into the root object.
	// We can do this by using a map[string]interface{}.
}

// JSON writes a JSON response with the YeMo wrapper
func JSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	response := make(map[string]interface{})

	// Copy data fields if it's a map or struct
	// If it's a map, we merge it.
	if dataMap, ok := data.(map[string]interface{}); ok {
		for k, v := range dataMap {
			response[k] = v
		}
	} else if data != nil {
		// If data is not a map (e.g. struct or slice), we might need to marshal it first to a map
		// Or just put it under "result" or "data" if it can't be merged?
		// The prompt example implies "data asli" is merged at root level.
		// "Return JSON dengan url, filename, mimetype, size" -> { "statusCode": 200, ..., "url": "...", "filename": "..." }

		b, err := json.Marshal(data)
		if err == nil {
			var tempMap map[string]interface{}
			if err := json.Unmarshal(b, &tempMap); err == nil {
				for k, v := range tempMap {
					response[k] = v
				}
			} else {
				// If it is not an object (e.g. array), we wrap it in "data" or "result"?
				// The prompt is slightly ambiguous for arrays, but typically REST APIs return objects.
				// If it's an array, let's put it in "data".
				response["data"] = data
			}
		}
	}

	response["statusCode"] = statusCode

	if statusCode >= 200 && statusCode < 300 {
		response["timestamp"] = time.Now().UTC().Format(time.RFC3339)
		response["attribution"] = "@YeMo"
	}

	json.NewEncoder(w).Encode(response)
}

// Error sends an error response
func Error(w http.ResponseWriter, statusCode int, message string) {
	JSON(w, statusCode, map[string]interface{}{
		"success": false,
		"error":   message,
	})
}

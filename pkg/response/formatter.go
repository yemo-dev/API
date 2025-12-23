package response

import (
	"encoding/json"
	"net/http"
	"time"
)

// JSON writes a JSON response with the YeMo wrapper
func JSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	response := make(map[string]interface{})

	if dataMap, ok := data.(map[string]interface{}); ok {
		for k, v := range dataMap {
			response[k] = v
		}
	} else if data != nil {
		b, err := json.Marshal(data)
		if err == nil {
			var tempMap map[string]interface{}
			if err := json.Unmarshal(b, &tempMap); err == nil {
				for k, v := range tempMap {
					response[k] = v
				}
			} else {
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

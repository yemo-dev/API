# YeMo API - Go Version

A lightweight REST API with auto-loading endpoints, converted from Express.js to Go.

## Features

- **Auto-loading Endpoints**: Endpoints in `api/` are automatically loaded.
- **Rate Limiting**: IP-based rate limiting with banning and persistent storage.
- **File Upload**: Temporary file uploads with auto-deletion.
- **Documentation**: Auto-generated OpenAPI JSON and HTML documentation.
- **Logging**: Colored console logging and file-based request logging.

## Setup

1. **Install Go**: Ensure you have Go 1.18+ installed.
2. **Install Dependencies**:
   ```bash
   go mod download
   ```
3. **Environment Variables**:
   Create a `.env` file:
   ```
   PORT=3000
   ADMIN_KEY=secret_admin_key
   ```

## Running

```bash
go run main.go
```

## Adding Endpoints

To add a new endpoint, create a Go file in `api/<category>/<name>.go`.

Example `api/users/get.go`:

```go
package users

import (
    "net/http"
    "yemo-api/pkg/loader"
    "yemo-api/pkg/response"
)

type GetUser struct{}

func (e *GetUser) Name() string { return "Get User" }
// ... implement other methods of Endpoint interface ...
func (e *GetUser) Run(w http.ResponseWriter, r *http.Request) {
    response.JSON(w, 200, map[string]string{"user": "yemo"})
}

func init() {
    loader.Register(&GetUser{})
}
```

**Important**: You must import the new package in `main.go` for it to be registered:

```go
import (
    _ "yemo-api/api/users"
)
```

## API Documentation

- **Home**: `http://localhost:3000/`
- **Docs**: `http://localhost:3000/docs`
- **OpenAPI**: `http://localhost:3000/openapi.json`

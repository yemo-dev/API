package tools

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"yemo-api/pkg/loader"
	"yemo-api/pkg/response"
)

type UploadEndpoint struct{}

func (e *UploadEndpoint) Name() string { return "File Upload" }
func (e *UploadEndpoint) Description() string { return "Endpoint for uploading files (auto delete after 5 minutes)" }
func (e *UploadEndpoint) Category() string { return "Tools" }
func (e *UploadEndpoint) Methods() []string { return []string{"POST"} }
func (e *UploadEndpoint) Params() []string { return []string{"file"} }
func (e *UploadEndpoint) ParamsSchema() map[string]interface{} {
	return map[string]interface{}{
		"file": map[string]interface{}{"type": "file", "required": true},
	}
}

func (e *UploadEndpoint) Run(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(50 << 20)

	file, header, err := r.FormFile("file")
	if err != nil {
		response.Error(w, 400, "No file uploaded")
		return
	}
	defer file.Close()

	bytes := make([]byte, 16)
	rand.Read(bytes)
	randomName := hex.EncodeToString(bytes) + filepath.Ext(header.Filename)

	cwd, _ := os.Getwd()
	uploadDir := filepath.Join(cwd, "files")
	if _, err := os.Stat(uploadDir); os.IsNotExist(err) {
		os.MkdirAll(uploadDir, 0755)
	}

	filePath := filepath.Join(uploadDir, randomName)
	dst, err := os.Create(filePath)
	if err != nil {
		response.Error(w, 500, "Failed to save file")
		return
	}

	if _, err := io.Copy(dst, file); err != nil {
		dst.Close()
		response.Error(w, 500, "Failed to write file")
		return
	}
	dst.Close()

	go func() {
		time.Sleep(5 * time.Minute)
		os.Remove(filePath)
	}()

	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	host := r.Host
	fileUrl := fmt.Sprintf("%s://%s/files/%s", scheme, host, randomName)

	response.JSON(w, 200, map[string]interface{}{
		"url":      fileUrl,
		"filename": randomName,
		"mimetype": header.Header.Get("Content-Type"),
		"size":     header.Size,
	})
}

func init() {
	loader.Register(&UploadEndpoint{})
}

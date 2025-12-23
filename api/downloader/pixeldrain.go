package downloader

import (
	"net/http"
	"net/url"
	"yemo-api/pkg/loader"
	"yemo-api/pkg/response"

	"github.com/PuerkitoBio/goquery"
)

type PixelDrainEndpoint struct{}

func (e *PixelDrainEndpoint) Name() string { return "PixelDrain Downloader" }
func (e *PixelDrainEndpoint) Description() string { return "Download file info from PixelDrain" }
func (e *PixelDrainEndpoint) Category() string { return "Downloader" }
func (e *PixelDrainEndpoint) Methods() []string { return []string{"GET"} }
func (e *PixelDrainEndpoint) Params() []string { return []string{"url"} }
func (e *PixelDrainEndpoint) ParamsSchema() map[string]interface{} {
	return map[string]interface{}{
		"url": map[string]interface{}{"type": "string", "required": true},
	}
}

func (e *PixelDrainEndpoint) Run(w http.ResponseWriter, r *http.Request) {
	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		response.Error(w, 400, "Missing url parameter")
		return
	}

	if _, err := url.ParseRequestURI(targetURL); err != nil {
		response.Error(w, 400, "Invalid URL")
		return
	}

	resp, err := http.Get(targetURL)
	if err != nil {
		response.Error(w, 500, "Failed to fetch URL: " + err.Error())
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		response.Error(w, resp.StatusCode, "Remote server returned error")
		return
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		response.Error(w, 500, "Failed to parse HTML")
		return
	}

	title := doc.Find("title").Text()

	data := map[string]interface{}{
		"title": title,
		"originalUrl": targetURL,
	}

	response.JSON(w, 200, data)
}

func init() {
	loader.Register(&PixelDrainEndpoint{})
}

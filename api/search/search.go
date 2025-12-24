package search

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"yemo-api/pkg/loader"
	"yemo-api/pkg/response"

	"github.com/PuerkitoBio/goquery"
)

// -- Google Image Search --

type GoogleImageEndpoint struct{}

func (e *GoogleImageEndpoint) Name() string { return "Google Image Search" }
func (e *GoogleImageEndpoint) Description() string { return "Searches for images on Google using a query." }
func (e *GoogleImageEndpoint) Category() string { return "Search" }
func (e *GoogleImageEndpoint) Methods() []string { return []string{"GET"} }
func (e *GoogleImageEndpoint) Params() []string { return []string{"query"} }
func (e *GoogleImageEndpoint) ParamsSchema() map[string]interface{} {
	return map[string]interface{}{"query": map[string]interface{}{"type": "string", "required": true}}
}

func (e *GoogleImageEndpoint) Run(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	if query == "" {
		response.Error(w, 400, "Parameter 'query' is required.")
		return
	}

	results, err := scrapeGoogleImages(query)
	if err != nil {
		response.Error(w, 500, err.Error())
		return
	}
	if len(results) == 0 {
		response.Error(w, 404, "No images found for the given query.")
		return
	}

	response.JSON(w, 200, map[string]interface{}{
		"success":     true,
		"creator":     "GIMI❤️",
		"data":        results,
		"attribution": "@Zenzxz",
	})
}

func scrapeGoogleImages(query string) ([]map[string]interface{}, error) {
	reqURL := "https://www.google.com/search?q=" + url.QueryEscape(query) + "&tbm=isch"
	client := &http.Client{}
	req, _ := http.NewRequest("GET", reqURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	content := string(body)

	var refs []map[string]interface{}

	patterns := []*regexp.Regexp{
		regexp.MustCompile(`\[1,\[0,"(?P<url>[\d\w\-\.,]+)",(?P<height>\d+),(?P<width>\d+)\]`),
		regexp.MustCompile(`\[1,\[0,"(?P<url>[\d\w\-\.,]+)",\[\]`),
	}

	for _, pattern := range patterns {
		matches := pattern.FindAllStringSubmatch(content, -1)
		for _, match := range matches {
			urlIdx := pattern.SubexpIndex("url")
			if urlIdx == -1 { continue }

			refURL := match[urlIdx]

			width := 0
			height := 0

			if wIdx := pattern.SubexpIndex("width"); wIdx != -1 {
				width, _ = strconv.Atoi(match[wIdx])
			}
			if hIdx := pattern.SubexpIndex("height"); hIdx != -1 {
				height, _ = strconv.Atoi(match[hIdx])
			}

			refURL = strings.ReplaceAll(refURL, "\\u003d", "=")
			refURL = strings.ReplaceAll(refURL, "\\u0026", "&")
			refURL = strings.ReplaceAll(refURL, "\\u003c", "<")
			refURL = strings.ReplaceAll(refURL, "\\u003e", ">")

			if strings.HasPrefix(refURL, "http") && !strings.Contains(refURL, "undefined") {
				refs = append(refs, map[string]interface{}{
					"url":    refURL,
					"width":  width,
					"height": height,
				})
			}
		}
	}

	return refs, nil
}

// -- Wikipedia Search --

type WikipediaEndpoint struct{}

func (e *WikipediaEndpoint) Name() string { return "Wikipedia Search" }
func (e *WikipediaEndpoint) Description() string { return "Searches for an article on Indonesian Wikipedia." }
func (e *WikipediaEndpoint) Category() string { return "Search" }
func (e *WikipediaEndpoint) Methods() []string { return []string{"GET"} }
func (e *WikipediaEndpoint) Params() []string { return []string{"query"} }
func (e *WikipediaEndpoint) ParamsSchema() map[string]interface{} {
	return map[string]interface{}{"query": map[string]interface{}{"type": "string", "required": true}}
}

func (e *WikipediaEndpoint) Run(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	if query == "" {
		response.Error(w, 400, "Parameter 'query' is required.")
		return
	}

	result, err := wikipediaScraper(query)
	if err != nil {
		if strings.Contains(err.Error(), "tidak ditemukan") {
			response.Error(w, 404, err.Error())
		} else {
			response.Error(w, 500, err.Error())
		}
		return
	}

	response.JSON(w, 200, map[string]interface{}{
		"success": true,
		"creator": "GIMI❤️",
		"data":    result,
	})
}

func wikipediaScraper(query string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://id.m.wikipedia.org/wiki/%s", url.QueryEscape(query))
	client := &http.Client{Timeout: 30 * time.Second}
	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Linux; Android 10; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		return nil, fmt.Errorf("Artikel \"%s\" tidak ditemukan di Wikipedia.", query)
	}

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	title := doc.Find("title").Text()
	title = strings.Replace(title, " - Wikipedia bahasa Indonesia, ensiklopedia bebas", "", 1)

	wiki := strings.TrimSpace(doc.Find("#mf-section-0").Find("p").Text())
	thumb, _ := doc.Find("meta[property='og:image']").Attr("content")

	if wiki == "" {
		return nil, errors.New("Artikel tidak ditemukan atau tidak memiliki paragraf ringkasan.")
	}

	return map[string]interface{}{
		"title": title,
		"wiki":  wiki,
		"thumb": thumb,
	}, nil
}

// -- Pinterest Search --

type PinterestEndpoint struct{}

func (e *PinterestEndpoint) Name() string { return "Pinterest Search" }
func (e *PinterestEndpoint) Description() string { return "Searches for images on Pinterest and returns direct image links." }
func (e *PinterestEndpoint) Category() string { return "Search" }
func (e *PinterestEndpoint) Methods() []string { return []string{"GET"} }
func (e *PinterestEndpoint) Params() []string { return []string{"query"} }
func (e *PinterestEndpoint) ParamsSchema() map[string]interface{} {
	return map[string]interface{}{"query": map[string]interface{}{"type": "string", "required": true}}
}

func (e *PinterestEndpoint) Run(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	if query == "" {
		response.Error(w, 400, "Parameter 'query' is required.")
		return
	}

	result, err := pinterestScrape(query)
	if err != nil {
		response.Error(w, 500, err.Error())
		return
	}
	if len(result) == 0 {
		response.Error(w, 404, "No images found for the given query.")
		return
	}

	response.JSON(w, 200, map[string]interface{}{
		"success": true,
		"creator": "GIMI❤️",
		"data":    result,
	})
}

func pinterestScrape(query string) ([]map[string]string, error) {
	client := &http.Client{}

	req1, _ := http.NewRequest("GET", "https://www.pinterest.com/", nil)
	req1.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")
	req1.Header.Set("Accept", "text/html,application/xhtml+xml")

	resp1, err := client.Do(req1)
	if err != nil {
		return nil, err
	}
	defer resp1.Body.Close()

	var csrf string
	var cookieStr string

	cookies := resp1.Cookies()
	var cookieParts []string
	for _, c := range cookies {
		cookieParts = append(cookieParts, c.Name+"="+c.Value)
		if c.Name == "csrftoken" {
			csrf = c.Value
		}
	}
	cookieStr = strings.Join(cookieParts, "; ")

	if csrf == "" {
		return nil, errors.New("Failed to retrieve session cookies or CSRF token from Pinterest.")
	}

	sourceURL := fmt.Sprintf("/search/pins/?q=%s", url.QueryEscape(query))
	dataMap := map[string]interface{}{
		"options": map[string]interface{}{
			"query":         query,
			"field_set_key": "react_grid_pin",
			"is_prefetch":   false,
			"page_size":     25,
		},
		"context": map[string]interface{}{},
	}
	dataJSON, _ := json.Marshal(dataMap)

	form := url.Values{}
	form.Set("source_url", sourceURL)
	form.Set("data", string(dataJSON))

	req2, _ := http.NewRequest("POST", "https://www.pinterest.com/resource/BaseSearchResource/get/", strings.NewReader(form.Encode()))
	req2.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")
	req2.Header.Set("Accept", "application/json, text/javascript, */*; q=0.01")
	req2.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	req2.Header.Set("X-CSRFToken", csrf)
	req2.Header.Set("X-Requested-With", "XMLHttpRequest")
	req2.Header.Set("Origin", "https://www.pinterest.com")
	req2.Header.Set("Referer", fmt.Sprintf("https://www.pinterest.com/search/pins/?q=%s", url.QueryEscape(query)))
	req2.Header.Set("Cookie", cookieStr)

	resp2, err := client.Do(req2)
	if err != nil {
		return nil, err
	}
	defer resp2.Body.Close()

	var resJSON struct {
		ResourceResponse struct {
			Data struct {
				Results []struct {
					ID     string `json:"id"`
					Images struct {
						Orig struct {
							URL string `json:"url"`
						} `json:"orig"`
						Small struct {
							URL string `json:"url"`
						} `json:"236x"`
					} `json:"images"`
				} `json:"results"`
			} `json:"data"`
		} `json:"resource_response"`
	}

	if err := json.NewDecoder(resp2.Body).Decode(&resJSON); err != nil {
		return nil, err
	}

	var pins []map[string]string
	for _, p := range resJSON.ResourceResponse.Data.Results {
		imgURL := p.Images.Orig.URL
		if imgURL == "" {
			imgURL = p.Images.Small.URL
		}
		if imgURL != "" {
			pins = append(pins, map[string]string{
				"link":       fmt.Sprintf("https://www.pinterest.com/pin/%s/", p.ID),
				"directLink": imgURL,
			})
		}
	}

	return pins, nil
}

func init() {
	loader.Register(&GoogleImageEndpoint{})
	loader.Register(&WikipediaEndpoint{})
	loader.Register(&PinterestEndpoint{})
}

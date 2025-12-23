package ai

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"

	"yemo-api/pkg/loader"
	"yemo-api/pkg/response"
)

type ChatAIEndpoint struct{}

func (e *ChatAIEndpoint) Name() string { return "AI Chat Completion" }
func (e *ChatAIEndpoint) Description() string {
	return "Chat with various powerful AI models. Select a model and provide a query to get a response."
}
func (e *ChatAIEndpoint) Category() string { return "AI" }
func (e *ChatAIEndpoint) Methods() []string { return []string{"GET"} }
func (e *ChatAIEndpoint) Params() []string { return []string{"query", "model"} }

var supportedModels = []string{
	"deepseek-v3",
	"deepseek-r1",
	"gpt-oss-120b",
	"gpt-oss-20b",
	"kimi-k2-instruct",
	"llama4-maverick-instruct-basic",
	"llama-v3p1-405b-instruct",
	"llama-v3p1-8b-instruct",
	"gemma-3-27b-it",
	"codegemma-7b",
	"mistral-small-24b-instruct-2501",
	"mistral-nemo-instruct-2407",
	"mixtral-8x22b-instruct",
	"phi-3-vision-128k-instruct",
	"phi-3-mini-128k-instruct",
	"qwen3-235b-a22b-thinking-2507",
	"qwen3-coder-480b-a35b-instruct",
	"qwen3-235b-a22b-instruct-2507",
}

func (e *ChatAIEndpoint) ParamsSchema() map[string]interface{} {
	return map[string]interface{}{
		"query": map[string]interface{}{"type": "string", "required": true},
		"model": map[string]interface{}{
			"type": "string", "required": true, "enum": supportedModels, "default": "deepseek-v3",
		},
	}
}

func (e *ChatAIEndpoint) Run(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	model := r.URL.Query().Get("model")

	if query == "" || model == "" {
		response.Error(w, 400, "Parameters 'query' and 'model' are required.")
		return
	}

	valid := false
	for _, m := range supportedModels {
		if m == model {
			valid = true
			break
		}
	}
	if !valid {
		response.Error(w, 400, fmt.Sprintf("Invalid model. Choose: %s", strings.Join(supportedModels, ", ")))
		return
	}

	result, err := scrapeDeepSeek(query, model)
	if err != nil {
		response.Error(w, 500, err.Error())
		return
	}

	response.JSON(w, 200, map[string]interface{}{
		"creator": "GIMI❤️",
		"data": map[string]string{
			"model":    model,
			"question": query,
			"answer":   result,
		},
	})
}

func scrapeDeepSeek(query, model string) (string, error) {
	origin := "https://deep-seek.chat"
	client := &http.Client{}

	// 1. Get Config
	req, _ := http.NewRequest("GET", origin, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0")
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	re := regexp.MustCompile(`window\.DeepSeekConfig = ({[\s\S]*?});`)
	match := re.FindSubmatch(body)
	if len(match) < 2 {
		return "", errors.New("could not find configuration")
	}

	var config struct {
		Nonce   string `json:"nonce"`
		AjaxURL string `json:"ajax_url"`
	}
	if err := json.Unmarshal(match[1], &config); err != nil {
		return "", err
	}

	// 2. Post Chat
	form := url.Values{}
	form.Set("action", "deepseek_chat")
	form.Set("nonce", config.Nonce)
	form.Set("message", query)
	form.Set("model", model)
	form.Set("save_conversation", "0")
	form.Set("session_only", "1")

	req, _ = http.NewRequest("POST", config.AjaxURL, strings.NewReader(form.Encode()))
	req.Header.Set("User-Agent", "Mozilla/5.0 (Android 15; Mobile; SM-F958; rv:130.0) Gecko/130.0 Firefox/130.0")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Origin", origin)
	req.Header.Set("Referer", origin)

	resp, err = client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var apiRes struct {
		Success bool `json:"success"`
		Data    struct {
			Response string `json:"response"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&apiRes); err != nil {
		return "", err
	}

	if !apiRes.Success || apiRes.Data.Response == "" {
		return "", errors.New("unsuccessful response from AI service")
	}

	return apiRes.Data.Response, nil
}

func init() {
	loader.Register(&ChatAIEndpoint{})
}

package handlers

import (
	"encoding/json"
	"net/http"

	"k6clone/internal/core/generator"
	"k6clone/internal/core/model"
	"k6clone/internal/service"
)

type ScriptHandler struct {
	service *service.ScriptService
	k6JSGen *generator.K6JSGenerator
}

func NewScriptHandler(
	s *service.ScriptService,
	gen *generator.K6JSGenerator,
) *ScriptHandler {
	return &ScriptHandler{
		service: s,
		k6JSGen: gen,
	}
}

/*
POST /scripts
Body: { "url": "https://example.com" }
*/
func (h *ScriptHandler) CreateScript(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		URL string `json:"url"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}

	if req.URL == "" {
		http.Error(w, "url is required", http.StatusBadRequest)
		return
	}

	script, err := h.service.CreateFromURL(req.URL)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(script)
}

/*
GET /scripts
*/
func (h *ScriptHandler) GetAllScripts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	scripts, err := h.service.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Never return null arrays
	if scripts == nil {
		scripts = []*model.Script{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scripts)
}

/*
GET /scripts/:id
*/
func (h *ScriptHandler) GetScriptByID(w http.ResponseWriter, r *http.Request, id string) {
	if id == "" {
		http.Error(w, "script id required", http.StatusBadRequest)
		return
	}

	script, err := h.service.GetByID(id)
	if err != nil {
		http.Error(w, "script not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(script)
}

/*
GET /scripts/k6?id=<scriptId>
Returns plain text k6 script
*/
func (h *ScriptHandler) GetK6Script(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "script id required", http.StatusBadRequest)
		return
	}

	script, err := h.service.GetByID(id)
	if err != nil {
		http.Error(w, "script not found", http.StatusNotFound)
		return
	}

	// Generate k6 script
	input := &generator.K6JSInput{
		Script: script,
		Config: model.TestConfig{
			VUs:      10,
			Duration: 30,
		},
	}

	code, err := h.k6JSGen.Generate(input)
	if err != nil {
		http.Error(w, "failed to generate k6 script", http.StatusInternalServerError)
		return
	}

	// Return as plain text
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte(code))
}
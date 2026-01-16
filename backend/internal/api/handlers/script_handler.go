package handlers

import (
	"encoding/json"
	"net/http"
	"k6clone/internal/core/generator"
	"k6clone/internal/service"
)

type ScriptHandler struct {
	service *service.ScriptService
}

func NewScriptHandler(s *service.ScriptService) *ScriptHandler {
	return &ScriptHandler{service: s}
}

// CreateScript handles POST /scripts
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

// GetAllScripts handles GET /scripts
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scripts)
}

func (h *ScriptHandler) GetK6Script(w http.ResponseWriter, r *http.Request) {
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

	jsGen := generator.NewK6JSGenerator()
	code, err := jsGen.Generate(script)
	if err != nil {
		http.Error(w, "failed to generate script", 500)
		return
	}

	w.Header().Set("Content-Type", "application/javascript")
	w.Header().Set("Content-Disposition", "attachment; filename=test.js")
	w.Write([]byte(code))
}

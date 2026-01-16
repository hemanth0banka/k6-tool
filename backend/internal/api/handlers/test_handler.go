package handlers

import (
	"encoding/json"
	"net/http"

	"k6clone/internal/core/model"
	"k6clone/internal/service"
)

type TestHandler struct {
	service *service.TestService
}

func NewTestHandler(s *service.TestService) *TestHandler {
	return &TestHandler{service: s}
}

func (h *TestHandler) RunTest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var config model.TestConfig
	if err := json.NewDecoder(r.Body).Decode(&config); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	result, err := h.service.RunTest(config)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

package handlers

import (
	"encoding/json"
	"net/http"

	"k6clone/internal/repository"
)

type HistoryHandler struct {
	repo repository.TestResultRepository
}

func NewHistoryHandler(r repository.TestResultRepository) *HistoryHandler {
	return &HistoryHandler{repo: r}
}

func (h *HistoryHandler) GetHistory(w http.ResponseWriter, r *http.Request) {
	results := h.repo.FindAll()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

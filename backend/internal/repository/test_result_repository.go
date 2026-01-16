package repository

import (
	"sync"

	"k6clone/internal/core/model"
)

type TestResultRepository interface {
	Save(result model.TestResult)
	FindAll() []model.TestResult
}

type MemoryTestResultRepository struct {
	mu      sync.Mutex
	results []model.TestResult
}

func NewMemoryTestResultRepository() *MemoryTestResultRepository {
	return &MemoryTestResultRepository{
		results: []model.TestResult{},
	}
}

func (r *MemoryTestResultRepository) Save(result model.TestResult) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.results = append(r.results, result)
}

func (r *MemoryTestResultRepository) FindAll() []model.TestResult {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.results
}

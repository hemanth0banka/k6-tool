package repository

import (
	"errors"
	"sync"

	"k6clone/internal/core/model"
)

type MemoryScriptRepository struct {
	data map[string]*model.Script
	mu   sync.RWMutex
}

func NewMemoryScriptRepository() *MemoryScriptRepository {
	return &MemoryScriptRepository{
		data: make(map[string]*model.Script),
	}
}

func (r *MemoryScriptRepository) Save(script *model.Script) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.data[script.ID] = script
	return nil
}

func (r *MemoryScriptRepository) FindByID(id string) (*model.Script, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	script, ok := r.data[id]
	if !ok {
		return nil, errors.New("script not found")
	}
	return script, nil
}

func (r *MemoryScriptRepository) FindAll() ([]*model.Script, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var scripts []*model.Script
	for _, s := range r.data {
		scripts = append(scripts, s)
	}
	return scripts, nil
}

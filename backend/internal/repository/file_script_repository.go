package repository

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sync"

	"k6clone/internal/core/model"
)

type FileScriptRepository struct {
	data       map[string]*model.Script
	scriptsDir string
	mu         sync.RWMutex
}

func NewFileScriptRepository(dir string) *FileScriptRepository {
	// Ensure directory exists
	os.MkdirAll(dir, 0755)

	repo := &FileScriptRepository{
		data:       make(map[string]*model.Script),
		scriptsDir: dir,
	}

	// Load existing scripts from disk
	repo.loadFromDisk()

	return repo
}

func (r *FileScriptRepository) Save(script *model.Script) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Save to memory
	r.data[script.ID] = script

	// Save to disk
	return r.saveToDisk(script)
}

func (r *FileScriptRepository) FindByID(id string) (*model.Script, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	script, ok := r.data[id]
	if !ok {
		return nil, errors.New("script not found")
	}
	return script, nil
}

func (r *FileScriptRepository) FindAll() ([]*model.Script, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var scripts []*model.Script
	for _, s := range r.data {
		scripts = append(scripts, s)
	}
	return scripts, nil
}

func (r *FileScriptRepository) saveToDisk(script *model.Script) error {
	path := filepath.Join(r.scriptsDir, script.ID+".json")

	data, err := json.MarshalIndent(script, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(path, data, 0644)
}

func (r *FileScriptRepository) loadFromDisk() error {
	files, err := os.ReadDir(r.scriptsDir)
	if err != nil {
		return err
	}

	for _, file := range files {
		if file.IsDir() || filepath.Ext(file.Name()) != ".json" {
			continue
		}

		path := filepath.Join(r.scriptsDir, file.Name())
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}

		var script model.Script
		if err := json.Unmarshal(data, &script); err != nil {
			continue
		}

		r.data[script.ID] = &script
	}

	return nil
}
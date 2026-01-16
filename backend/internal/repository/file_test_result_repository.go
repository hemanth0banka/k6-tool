package repository

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"k6clone/internal/core/model"
)

type FileTestResultRepository struct {
	resultsDir string
	mu         sync.Mutex
}

func NewFileTestResultRepository(dir string) *FileTestResultRepository {
	// Ensure directory exists
	os.MkdirAll(dir, 0755)

	return &FileTestResultRepository{
		resultsDir: dir,
	}
}

func (r *FileTestResultRepository) Save(result model.TestResult) {
	r.mu.Lock()
	defer r.mu.Unlock()

	filename := r.generateFilename(result)
	path := filepath.Join(r.resultsDir, filename)

	data, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		return
	}

	os.WriteFile(path, data, 0644)
}

func (r *FileTestResultRepository) FindAll() []model.TestResult {
	r.mu.Lock()
	defer r.mu.Unlock()

	files, err := os.ReadDir(r.resultsDir)
	if err != nil {
		return []model.TestResult{}
	}

	var results []model.TestResult

	for _, file := range files {
		if file.IsDir() || !strings.HasPrefix(file.Name(), "result-") {
			continue
		}

		path := filepath.Join(r.resultsDir, file.Name())
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}

		var result model.TestResult
		if err := json.Unmarshal(data, &result); err != nil {
			continue
		}

		results = append(results, result)
	}

	// Sort by date (newest first)
	sort.Slice(results, func(i, j int) bool {
		return results[i].StartedAt.After(results[j].StartedAt)
	})

	return results
}

func (r *FileTestResultRepository) FindByScriptID(scriptID string) []model.TestResult {
	all := r.FindAll()
	var filtered []model.TestResult

	for _, result := range all {
		if result.ScriptID == scriptID {
			filtered = append(filtered, result)
		}
	}

	return filtered
}

func (r *FileTestResultRepository) generateFilename(result model.TestResult) string {
	timestamp := result.StartedAt.Format("20060102-150405")
	return "result-" + result.ScriptID + "-" + timestamp + ".json"
}

// Cleanup removes results older than the specified duration
func (r *FileTestResultRepository) Cleanup(olderThan time.Duration) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	files, err := os.ReadDir(r.resultsDir)
	if err != nil {
		return err
	}

	cutoff := time.Now().Add(-olderThan)

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		info, err := file.Info()
		if err != nil {
			continue
		}

		if info.ModTime().Before(cutoff) {
			path := filepath.Join(r.resultsDir, file.Name())
			os.Remove(path)
		}
	}

	return nil
}
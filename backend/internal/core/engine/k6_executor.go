package engine

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"k6clone/internal/core/model"
)

type K6Executor struct {
	ScriptsDir string
	ResultsDir string
}

func NewK6Executor() *K6Executor {
	executor := &K6Executor{
		ScriptsDir: "./scripts",
		ResultsDir: "./scripts/results",
	}
	
	// Ensure directories exist
	os.MkdirAll(executor.ScriptsDir, 0755)
	os.MkdirAll(executor.ResultsDir, 0755)
	
	return executor
}

// K6Point represents a single metric point from k6 JSON output
type K6Point struct {
	Type   string `json:"type"`
	Metric string `json:"metric"`
	Data   struct {
		Time  string                 `json:"time"`
		Value float64                `json:"value"`
		Tags  map[string]interface{} `json:"tags"`
	} `json:"data"`
}

// K6Metrics aggregates metrics from k6 execution
type K6Metrics struct {
	HTTPReqs        int
	HTTPReqFailed   int
	HTTPReqDuration float64
	VUs             int
	Iterations      int
}

func (e *K6Executor) Run(
	script *model.Script,
	config model.TestConfig,
) (model.TestResult, error) {
	
	// Generate unique filenames
	timestamp := time.Now().Format("20060102-150405")
	scriptPath := filepath.Join(e.ScriptsDir, fmt.Sprintf("%s.js", script.ID))
	resultPath := filepath.Join(e.ResultsDir, fmt.Sprintf("%s-%s.json", script.ID, timestamp))

	// Generate and write k6 script
	k6Script := e.generateK6Script(script, config)
	if err := os.WriteFile(scriptPath, []byte(k6Script), 0644); err != nil {
		return model.TestResult{}, fmt.Errorf("failed to write k6 script: %v", err)
	}

	// Execute k6
	startedAt := time.Now()
	if err := e.executeK6(scriptPath, resultPath, config); err != nil {
		return model.TestResult{}, err
	}

	// Parse results
	metrics, err := e.parseK6Results(resultPath)
	if err != nil {
		return model.TestResult{}, err
	}

	// Convert to TestResult
	result := model.TestResult{
		TestID:        timestamp,
		ScriptID:      config.ScriptID,
		TotalRequests: metrics.HTTPReqs,
		Success:       metrics.HTTPReqs - metrics.HTTPReqFailed,
		Failure:       metrics.HTTPReqFailed,
		AvgLatencyMs:  int64(metrics.HTTPReqDuration),
		StartedAt:     startedAt,
	}

	return result, nil
}

func (e *K6Executor) generateK6Script(script *model.Script, config model.TestConfig) string {
	// Generate step code
	stepCode := ""
	for i, step := range script.Steps {
		varName := fmt.Sprintf("res_%d", i)
		stepCode += fmt.Sprintf(`
  // Step %d: %s %s
  const %s = http.%s('%s');
  check(%s, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
  });
`,
			i+1,
			step.Method,
			step.URL,
			varName,
			strings.ToLower(step.Method),
			step.URL,
			varName,
		)
	}

	// Build complete k6 script
	return fmt.Sprintf(`import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: %d,
  duration: '%ds',
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function() {
%s
  sleep(1);
}
`,
		config.VUs,
		config.Duration,
		stepCode,
	)
}

func (e *K6Executor) executeK6(scriptPath, resultPath string, config model.TestConfig) error {
	// Check if k6 is installed
	if _, err := exec.LookPath("k6"); err != nil {
		return fmt.Errorf("k6 is not installed. Please install k6 CLI: https://k6.io/docs/getting-started/installation/")
	}

	// Build k6 command
	cmd := exec.Command(
		"k6",
		"run",
		"--out", fmt.Sprintf("json=%s", resultPath),
		"--vus", fmt.Sprintf("%d", config.VUs),
		"--duration", fmt.Sprintf("%ds", config.Duration),
		scriptPath,
	)

	// Capture output
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("k6 execution failed: %s\nError: %v", string(output), err)
	}

	fmt.Println("K6 Output:", string(output))
	return nil
}

func (e *K6Executor) parseK6Results(path string) (*K6Metrics, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, fmt.Errorf("failed to open results file: %v", err)
	}
	defer file.Close()

	metrics := &K6Metrics{}
	scanner := bufio.NewScanner(file)

	var totalDuration float64
	var durationCount int

	// Process each JSON line
	for scanner.Scan() {
		var point K6Point
		if err := json.Unmarshal(scanner.Bytes(), &point); err != nil {
			continue // Skip invalid lines
		}

		// Only process Point type metrics
		if point.Type != "Point" {
			continue
		}

		switch point.Metric {
		case "http_reqs":
			metrics.HTTPReqs++
			
		case "http_req_failed":
			if point.Data.Value > 0 {
				metrics.HTTPReqFailed++
			}
			
		case "http_req_duration":
			totalDuration += point.Data.Value
			durationCount++
			
		case "vus":
			if int(point.Data.Value) > metrics.VUs {
				metrics.VUs = int(point.Data.Value)
			}
			
		case "iterations":
			metrics.Iterations++
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading results file: %v", err)
	}

	// Calculate average duration
	if durationCount > 0 {
		metrics.HTTPReqDuration = totalDuration / float64(durationCount)
	}

	return metrics, nil
}

// GetScriptContent returns the generated k6 script content
func (e *K6Executor) GetScriptContent(scriptID string) (string, error) {
	path := filepath.Join(e.ScriptsDir, scriptID+".js")
	data, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("script file not found: %v", err)
	}
	return string(data), nil
}

// CleanupOldResults removes result files older than specified days
func (e *K6Executor) CleanupOldResults(daysOld int) error {
	files, err := os.ReadDir(e.ResultsDir)
	if err != nil {
		return err
	}

	cutoff := time.Now().AddDate(0, 0, -daysOld)

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		info, err := file.Info()
		if err != nil {
			continue
		}

		if info.ModTime().Before(cutoff) {
			path := filepath.Join(e.ResultsDir, file.Name())
			os.Remove(path)
		}
	}

	return nil
}
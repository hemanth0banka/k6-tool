package engine

import (
	"net/http"
	"sync"
	"time"

	"k6clone/internal/core/model"
)

type LoadEngine struct {}

func NewLoadEngine() *LoadEngine {
	return &LoadEngine{}
}

func (e *LoadEngine) Run(
	script *model.Script,
	config model.TestConfig,
) model.TestResult {

	var mu sync.Mutex
	var total, success, failure int
	var totalLatency int64

	client := &http.Client{}
	end := time.Now().Add(time.Duration(config.Duration) * time.Second)

	wg := sync.WaitGroup{}
	startedAt := time.Now()

	for i := 0; i < config.VUs; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			for time.Now().Before(end) {
				for _, step := range script.Steps {
					start := time.Now()

					req, _ := http.NewRequest(step.Method, step.URL, nil)
					resp, err := client.Do(req)
					latency := time.Since(start).Milliseconds()

					mu.Lock()
					total++
					totalLatency += latency

					if err == nil && resp.StatusCode < 400 {
						success++
					} else {
						failure++
					}
					mu.Unlock()

					if resp != nil {
						resp.Body.Close()
					}
				}
			}
		}()
	}

	wg.Wait()

	avgLatency := int64(0)
	if total > 0 {
		avgLatency = totalLatency / int64(total)
	}

	return model.TestResult{
		TestID:        time.Now().Format("20060102150405"),
		ScriptID:      config.ScriptID,
		TotalRequests: total,
		Success:       success,
		Failure:       failure,
		AvgLatencyMs:  avgLatency,
		StartedAt:     startedAt,
	}
}

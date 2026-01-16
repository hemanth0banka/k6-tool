package engine

import (
	"net/http"
	"sort"
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
	var latencies []int64
	var iterations int

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	startedAt := time.Now()
	endAt := startedAt.Add(time.Duration(config.Duration) * time.Second)

	wg := sync.WaitGroup{}

	for vu := 0; vu < config.VUs; vu++ {
		wg.Add(1)

		go func() {
			defer wg.Done()

			for time.Now().Before(endAt) {
				iterations++

				for _, step := range script.Steps {
					start := time.Now()

					req, _ := http.NewRequest(step.Method, step.URL, nil)
					resp, err := client.Do(req)
					latency := time.Since(start).Milliseconds()

					mu.Lock()
					total++
					latencies = append(latencies, latency)

					if err == nil && resp != nil && resp.StatusCode < 400 {
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

	// ---- METRICS CALCULATION ----

	sort.Slice(latencies, func(i, j int) bool {
		return latencies[i] < latencies[j]
	})

	avgLatency := int64(0)
	if total > 0 {
		sum := int64(0)
		for _, l := range latencies {
			sum += l
		}
		avgLatency = sum / int64(total)
	}

	p90 := percentile(latencies, 90)
	p95 := percentile(latencies, 95)
	p99 := percentile(latencies, 99)

	durationSec := time.Since(startedAt).Seconds()
	rps := float64(total) / durationSec

	return model.TestResult{
		TestID:        time.Now().Format("20060102150405"),
		ScriptID:      config.ScriptID,
		TotalRequests: total,
		Success:       success,
		Failure:       failure,
		AvgLatencyMs:  avgLatency,
		P90LatencyMs:  p90,
		P95LatencyMs:  p95,
		P99LatencyMs:  p99,
		RPS:           rps,
		Iterations:    iterations,
		StartedAt:     startedAt,
	}
}

// ---------- helpers ----------

func percentile(values []int64, p int) int64 {
	if len(values) == 0 {
		return 0
	}

	index := (p * len(values)) / 100
	if index >= len(values) {
		index = len(values) - 1
	}
	return values[index]
}


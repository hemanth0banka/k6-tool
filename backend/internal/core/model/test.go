package model

import "time"

type TestType string

const (
	Smoke  TestType = "smoke"
	Load   TestType = "load"
	Stress TestType = "stress"
	Spike  TestType = "spike"
)

type TestConfig struct {
	ScriptID string   `json:"scriptId"`
	Type     TestType `json:"type"`
	VUs      int      `json:"vus"`
	Duration int      `json:"duration"` // seconds
}

type TestResult struct {
	TestID        string    `json:"testId"`
	ScriptID      string    `json:"scriptId"`
	TotalRequests int       `json:"totalRequests"`
	Success       int       `json:"success"`
	Failure       int       `json:"failure"`
	AvgLatencyMs  int64     `json:"avgLatencyMs"`
	P90LatencyMs  int64     `json:"p90LatencyMs"`
	P95LatencyMs  int64     `json:"p95LatencyMs"`
	P99LatencyMs  int64     `json:"p99LatencyMs"`
	RPS           float64   `json:"rps"`
	Iterations    int       `json:"iterations"`
	StartedAt     time.Time `json:"startedAt"`
}


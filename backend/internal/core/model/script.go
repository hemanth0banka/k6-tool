package model

type StepType string

const (
	HTTP StepType = "HTTP"
)

type Step struct {
	Type   StepType          `json:"type"`
	Method string            `json:"method"`
	URL    string            `json:"url"`
	Header map[string]string `json:"header,omitempty"`
	Body   string            `json:"body,omitempty"`
}

type Script struct {
	ID    string `json:"id"`
	Steps []Step `json:"steps"`
}

package generator

import (
	"bytes"
	"strings"
	"text/template"

	"k6clone/internal/core/model"
)

type K6JSGenerator struct {}

func NewK6JSGenerator() *K6JSGenerator {
	return &K6JSGenerator{}
}

type K6JSInput struct {
	Script *model.Script
	Config model.TestConfig
}

func (g *K6JSGenerator) Generate(input *K6JSInput) (string, error) {
	const tpl = `import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: {{.VUs}},
  duration: "{{.Duration}}s",
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
{{range $i, $step := .Steps}}
  // Step {{add $i 1}}: {{$step.Method}} {{$step.URL}}
  const res{{$i}} = http.{{lower $step.Method}}("{{$step.URL}}"{{if $step.Body}}, {{$step.Body}}{{end}});
  check(res{{$i}}, {
    "status is 2xx": (r) => r.status >= 200 && r.status < 300,
  });
{{end}}
  sleep(1);
}
`
	type view struct {
		VUs      int
		Duration int
		Steps    []model.Step
	}

	funcMap := template.FuncMap{
		"lower": func(s string) string {
			return strings.ToLower(s)
		},
		"add": func(a, b int) int {
			return a + b
		},
	}

	t, err := template.New("k6").Funcs(funcMap).Parse(tpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	err = t.Execute(&buf, view{
		VUs:      input.Config.VUs,
		Duration: input.Config.Duration,
		Steps:    input.Script.Steps,
	})

	return buf.String(), err
}
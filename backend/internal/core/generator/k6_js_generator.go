package generator

import (
	"bytes"
	"text/template"

	"k6clone/internal/core/model"
)

type K6JSGenerator struct {}

func NewK6JSGenerator() *K6JSGenerator {
	return &K6JSGenerator{}
}

func (g *K6JSGenerator) Generate(script *model.Script) (string, error) {
	const tpl = `
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: {{.VUs}},
  duration: "{{.Duration}}s",
};

export default function () {
{{range .Steps}}
  const res = http.{{.Method | lower}}("{{.URL}}");
  check(res, {
    "status is 200": (r) => r.status === 200,
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
			if s == "GET" {
				return "get"
			}
			if s == "POST" {
				return "post"
			}
			return "get"
		},
	}

	t, err := template.New("k6").Funcs(funcMap).Parse(tpl)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	err = t.Execute(&buf, view{
		VUs:      10,
		Duration: 10,
		Steps:    script.Steps,
	})

	return buf.String(), err
}


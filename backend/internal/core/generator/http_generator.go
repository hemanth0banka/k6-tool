package generator

import (
	"errors"
	"net/url"

	"github.com/google/uuid"
	"k6clone/internal/core/model"
)

type HttpGenerator struct {}

func NewHttpGenerator() *HttpGenerator {
	return &HttpGenerator{}
}

func (g *HttpGenerator) Generate(rawURL string) (*model.Script, error) {
	_, err := url.ParseRequestURI(rawURL)
	if err != nil {
		return nil, errors.New("invalid URL")
	}

	script := &model.Script{
		ID: uuid.NewString(),
		Steps: []model.Step{
			{
				Type:   model.HTTP,
				Method: "GET",
				URL:    rawURL,
			},
		},
	}

	return script, nil
}

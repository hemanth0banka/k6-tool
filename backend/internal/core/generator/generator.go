package generator

import "k6clone/internal/core/model"

type Generator interface {
	Generate(url string) (*model.Script, error)
}

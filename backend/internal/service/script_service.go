package service

import (
	"k6clone/internal/core/generator"
	"k6clone/internal/core/model"
	"k6clone/internal/repository"
)

type ScriptService struct {
	generator generator.Generator
	repo      repository.ScriptRepository
}

func NewScriptService(g generator.Generator, r repository.ScriptRepository) *ScriptService {
	return &ScriptService{
		generator: g,
		repo:      r,
	}
}

func (s *ScriptService) CreateFromURL(url string) (*model.Script, error) {
	script, err := s.generator.Generate(url)
	if err != nil {
		return nil, err
	}

	err = s.repo.Save(script)
	if err != nil {
		return nil, err
	}

	return script, nil
}

func (s *ScriptService) GetByID(id string) (*model.Script, error) {
	return s.repo.FindByID(id)
}

func (s *ScriptService) GetAll() ([]*model.Script, error) {
	return s.repo.FindAll()
}

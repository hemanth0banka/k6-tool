package service

import (
	"k6clone/internal/core/engine"
	"k6clone/internal/core/model"
	"k6clone/internal/repository"
)

type TestService struct {
	scriptRepo repository.ScriptRepository
	resultRepo repository.TestResultRepository
	engine     *engine.LoadEngine
}

// ✅ FIXED CONSTRUCTOR (3 args)
func NewTestService(
	scriptRepo repository.ScriptRepository,
	resultRepo repository.TestResultRepository,
	engine *engine.LoadEngine,
) *TestService {
	return &TestService{
		scriptRepo: scriptRepo,
		resultRepo: resultRepo,
		engine:     engine,
	}
}

func (s *TestService) RunTest(config model.TestConfig) (model.TestResult, error) {
	script, err := s.scriptRepo.FindByID(config.ScriptID)
	if err != nil {
		return model.TestResult{}, err
	}

	if err := ValidateScript(script); err != nil {
		return model.TestResult{}, err
	}

	result := s.engine.Run(script, config)

	// ✅ history persistence
	s.resultRepo.Save(result)

	return result, nil
}

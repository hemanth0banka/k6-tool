package service

import (
	"k6clone/internal/core/engine"
	"k6clone/internal/core/generator"
	"k6clone/internal/core/model"
	"k6clone/internal/repository"
)

type TestService struct {
	scriptRepo repository.ScriptRepository
	resultRepo repository.TestResultRepository
	executor   *engine.K6Executor
	k6JSGen    *generator.K6JSGenerator
}

func NewTestService(
	scriptRepo repository.ScriptRepository,
	resultRepo repository.TestResultRepository,
	executor *engine.K6Executor,
	k6JSGen *generator.K6JSGenerator,
) *TestService {
	return &TestService{
		scriptRepo: scriptRepo,
		resultRepo: resultRepo,
		executor:   executor,
		k6JSGen:    k6JSGen,
	}
}

func (s *TestService) RunTest(config model.TestConfig) (model.TestResult, error) {
	// 1. Retrieve the script
	script, err := s.scriptRepo.FindByID(config.ScriptID)
	if err != nil {
		return model.TestResult{}, err
	}

	// 2. Validate the script
	if err := ValidateScript(script); err != nil {
		return model.TestResult{}, err
	}

	// 3. Execute the test using K6
	result, err := s.executor.Run(script, config)
	if err != nil {
		return model.TestResult{}, err
	}

	// 4. Save the result
	s.resultRepo.Save(result)

	return result, nil
}

// GetTestHistory retrieves all test results
func (s *TestService) GetTestHistory() []model.TestResult {
	return s.resultRepo.FindAll()
}

// GetScriptHistory retrieves test results for a specific script
func (s *TestService) GetScriptHistory(scriptID string) []model.TestResult {
	return s.resultRepo.FindByScriptID(scriptID)
}
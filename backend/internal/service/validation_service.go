package service

import (
	"errors"

	"k6clone/internal/core/model"
)

func ValidateScript(script *model.Script) error {
	if script == nil {
		return errors.New("script not found")
	}

	if len(script.Steps) == 0 {
		return errors.New("script has no steps")
	}

	for _, step := range script.Steps {
		if step.URL == "" {
			return errors.New("step url is empty")
		}
		if step.Method == "" {
			return errors.New("step method is empty")
		}
	}

	return nil
}

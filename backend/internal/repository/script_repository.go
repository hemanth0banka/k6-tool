package repository

import "k6clone/internal/core/model"

type ScriptRepository interface {
	Save(script *model.Script) error
	FindByID(id string) (*model.Script, error)
	FindAll() ([]*model.Script, error)
}

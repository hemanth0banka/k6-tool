package engine

import "k6clone/internal/core/model"

var TestProfiles = map[string]model.TestProfile{
	"smoke": {
		Name:     "Smoke Test",
		VUs:      1,
		Duration: 10,
	},
	"load": {
		Name:     "Load Test",
		VUs:      50,
		Duration: 60,
	},
	"stress": {
		Name:     "Stress Test",
		VUs:      200,
		Duration: 60,
	},
	"spike": {
		Name:     "Spike Test",
		VUs:      300,
		Duration: 20,
	},
	"soak": {
		Name:     "Soak Test",
		VUs:      30,
		Duration: 3600,
	},
	"ramp-up": {
		Name:     "Ramp Up Test",
		VUs:      100,
		Duration: 120,
		RampUp:   true,
	},
}

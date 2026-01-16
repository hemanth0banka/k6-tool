package model

type TestProfile struct {
	Name     string
	VUs      int
	Duration int // seconds
	RampUp   bool
	RampDown bool
}

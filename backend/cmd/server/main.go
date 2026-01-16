package main

import (
	"net/http"

	"k6clone/internal/api/handlers"
	"k6clone/internal/api/middleware"
	"k6clone/internal/core/engine"
	"k6clone/internal/core/generator"
	"k6clone/internal/repository"
	"k6clone/internal/service"
)

func main() {
	gen := generator.NewHttpGenerator()
	scriptRepo := repository.NewMemoryScriptRepository()
	scriptService := service.NewScriptService(gen, scriptRepo)
	scriptHandler := handlers.NewScriptHandler(scriptService)

	loadEngine := engine.NewLoadEngine()
	historyRepo := repository.NewMemoryTestResultRepository() 
	testService := service.NewTestService(
		scriptRepo,
		historyRepo,
		loadEngine,
	)
	testHandler := handlers.NewTestHandler(testService)
	historyHandler := handlers.NewHistoryHandler(historyRepo) 

	mux := http.NewServeMux()

	mux.HandleFunc("/scripts", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			scriptHandler.CreateScript(w, r)
		case http.MethodGet:
			scriptHandler.GetAllScripts(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/tests/run", testHandler.RunTest)

	mux.HandleFunc("/scripts/k6", scriptHandler.GetK6Script)

	mux.HandleFunc("/history", historyHandler.GetHistory)

	http.ListenAndServe(
		":8080",
		middleware.CORSMiddleware(mux),
	)
}


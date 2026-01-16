package main

import (
	"fmt"
	"net/http"

	"k6clone/internal/api/handlers"
	"k6clone/internal/api/middleware"
	"k6clone/internal/core/engine"
	"k6clone/internal/core/generator"
	"k6clone/internal/repository"
	"k6clone/internal/service"
)

func main() {
	fmt.Println("🚀 Starting K6 Load Testing Platform...")

	// Initialize generator
	gen := generator.NewHttpGenerator()

	// Initialize file-based repositories
	scriptRepo := repository.NewFileScriptRepository("./scripts")
	historyRepo := repository.NewFileTestResultRepository("./scripts/results")

	// Initialize services
	scriptService := service.NewScriptService(gen, scriptRepo)

	// Initialize K6 executor
	k6Executor := engine.NewK6Executor()

	// Initialize test service with K6 executor
	testService := service.NewTestService(
		scriptRepo,
		historyRepo,
		k6Executor,
	)

	// Initialize handlers
	scriptHandler := handlers.NewScriptHandler(scriptService)
	testHandler := handlers.NewTestHandler(testService)
	historyHandler := handlers.NewHistoryHandler(historyRepo)

	// Setup routes
	mux := http.NewServeMux()

	// Script management
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

	// Get generated k6 script
	mux.HandleFunc("/scripts/k6", scriptHandler.GetK6Script)

	// Run test
	mux.HandleFunc("/tests/run", testHandler.RunTest)

	// Test history
	mux.HandleFunc("/history", historyHandler.GetHistory)

	// Health check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"healthy","message":"K6 Load Testing Platform is running"}`))
	})

	// Start server
	fmt.Println("✅ Server started on http://localhost:8080")
	fmt.Println("📁 Scripts directory: ./scripts")
	fmt.Println("📊 Results directory: ./scripts/results")
	fmt.Println("\n📖 API Endpoints:")
	fmt.Println("   POST   /scripts       - Create new test script")
	fmt.Println("   GET    /scripts       - List all scripts")
	fmt.Println("   GET    /scripts/k6    - Get k6 JavaScript for script")
	fmt.Println("   POST   /tests/run     - Execute load test")
	fmt.Println("   GET    /history       - View test history")
	fmt.Println("   GET    /health        - Health check")

	if err := http.ListenAndServe(":8080", middleware.CORSMiddleware(mux)); err != nil {
		panic(err)
	}
}
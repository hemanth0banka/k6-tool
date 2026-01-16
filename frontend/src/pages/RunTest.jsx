import { useEffect, useState } from "react";
import { runTest } from "../api/testApi";
import { getScripts } from "../api/scriptApi";
import { Play, Settings, CheckCircle } from "lucide-react";
import ResultCharts from "../components/ResultCharts";

export default function RunTest() {
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState("");
  
  // Basic Config
  const [testType, setTestType] = useState("load");
  const [vus, setVus] = useState(10);
  const [duration, setDuration] = useState(30);
  
  // Advanced Config
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [thresholds, setThresholds] = useState([
    "http_req_duration: ['p(95)<500']",
    "http_req_failed: ['rate<0.1']",
  ]);
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      const res = await getScripts();
      setScripts(res.data || []);
    } catch (err) {
      console.error("Failed to load scripts:", err);
    }
  };

  const startTest = async () => {
    if (!selectedScript) {
      alert("Please select a script");
      return;
    }

    setLoading(true);
    setProgress(0);
    setResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 95));
    }, 500);

    try {
      const config = {
        scriptId: selectedScript,
        type: testType,
        vus: Number(vus),
        duration: Number(duration),
      };

      const res = await runTest(config);
      setResult(res.data);
      setProgress(100);
    } catch (err) {
      alert("Test failed: " + (err.response?.data || err.message));
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Run Load Test</h1>

      {/* Test Configuration */}
      <div className="card">
        <h2 className="card-title">
          <Settings size={20} />
          Test Configuration
        </h2>

        {/* Script Selection */}
        <div className="form-group">
          <label>Select Script</label>
          <select
            value={selectedScript}
            onChange={(e) => setSelectedScript(e.target.value)}
            className="input-primary"
          >
            <option value="">Choose a script...</option>
            {scripts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id.slice(0, 8)}... ({s.steps.length} steps)
              </option>
            ))}
          </select>
        </div>

        {/* Test Type */}
        <div className="form-group">
          <label>Test Type</label>
          <div className="test-type-grid">
            {["smoke", "load", "stress", "spike", "soak"].map((type) => (
              <button
                key={type}
                onClick={() => setTestType(type)}
                className={`test-type-btn ${testType === type ? "active" : ""}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Settings */}
        <div className="form-row">
          <div className="form-group">
            <label>Virtual Users (VUs)</label>
            <input
              type="number"
              value={vus}
              onChange={(e) => setVus(e.target.value)}
              min="1"
              max="1000"
              className="input-primary"
            />
          </div>

          <div className="form-group">
            <label>Duration (seconds)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              max="3600"
              className="input-primary"
            />
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn-link"
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Options
        </button>

        {showAdvanced && (
          <div className="advanced-options">
            <h3>Thresholds</h3>
            {thresholds.map((threshold, i) => (
              <div key={i} className="threshold-item">
                <input
                  type="text"
                  value={threshold}
                  onChange={(e) => {
                    const newThresholds = [...thresholds];
                    newThresholds[i] = e.target.value;
                    setThresholds(newThresholds);
                  }}
                  className="input-primary"
                />
              </div>
            ))}
          </div>
        )}

        {/* Run Button */}
        <button
          onClick={startTest}
          disabled={loading || !selectedScript}
          className="btn-primary btn-lg"
        >
          {loading ? (
            <>Running Test... {progress}%</>
          ) : (
            <>
              <Play size={16} />
              Run Test
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="card">
          <h3>Test in Progress</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-muted">
            Running {vus} VUs for {duration}s...
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="card">
          <h2 className="card-title">
            <CheckCircle size={20} className="text-success" />
            Test Results
          </h2>

          <ResultCharts result={result} />
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { createScript } from "../api/scriptApi";
import { Code, Plus, Trash2 } from "lucide-react";

export default function CreateScript() {
  const [mode, setMode] = useState("simple"); // simple or advanced
  const [url, setUrl] = useState("");
  const [steps, setSteps] = useState([
    { method: "GET", url: "", headers: {}, body: "" }
  ]);
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!url && mode === "simple") {
      alert("Please enter a URL");
      return;
    }

    setLoading(true);
    try {
      const res = await createScript(url);
      setScript(res.data);
    } catch (err) {
      alert("Failed to create script: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setSteps([...steps, { method: "GET", url: "", headers: {}, body: "" }]);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  return (
    <div className="page">
      <h1 className="page-title">Create Test Script</h1>

      {/* Mode Selector */}
      <div className="mode-selector">
        <button
          className={`mode-btn ${mode === "simple" ? "active" : ""}`}
          onClick={() => setMode("simple")}
        >
          Simple Mode
        </button>
        <button
          className={`mode-btn ${mode === "advanced" ? "active" : ""}`}
          onClick={() => setMode("advanced")}
        >
          Advanced Mode
        </button>
      </div>

      {mode === "simple" ? (
        <div className="card">
          <h2 className="card-title">Quick Script Generation</h2>
          
          <div className="form-group">
            <label>Target URL</label>
            <input
              type="text"
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input-primary"
            />
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Generating..." : "Generate Script"}
          </button>
        </div>
      ) : (
        <div className="card">
          <h2 className="card-title">Multi-Step Script</h2>

          {steps.map((step, i) => (
            <div key={i} className="step-editor">
              <div className="step-header">
                <h3>Step {i + 1}</h3>
                {steps.length > 1 && (
                  <button
                    onClick={() => removeStep(i)}
                    className="btn-icon btn-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Method</label>
                  <select
                    value={step.method}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[i].method = e.target.value;
                      setSteps(newSteps);
                    }}
                    className="input-primary"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                    <option>PATCH</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>URL</label>
                  <input
                    type="text"
                    placeholder="https://api.example.com/endpoint"
                    value={step.url}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[i].url = e.target.value;
                      setSteps(newSteps);
                    }}
                    className="input-primary"
                  />
                </div>
              </div>

              {(step.method === "POST" || step.method === "PUT") && (
                <div className="form-group">
                  <label>Request Body (JSON)</label>
                  <textarea
                    placeholder='{"key": "value"}'
                    value={step.body}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[i].body = e.target.value;
                      setSteps(newSteps);
                    }}
                    className="input-primary"
                    rows="3"
                  />
                </div>
              )}
            </div>
          ))}

          <button onClick={addStep} className="btn-secondary">
            <Plus size={16} />
            Add Step
          </button>

          <button onClick={submit} disabled={loading} className="btn-primary mt-4">
            {loading ? "Creating..." : "Create Multi-Step Script"}
          </button>
        </div>
      )}

      {/* Generated Script Preview */}
      {script && (
        <div className="card mt-4">
          <h2 className="card-title">
            <Code size={20} />
            Generated Script
          </h2>
          
          <div className="script-preview">
            <pre>{JSON.stringify(script, null, 2)}</pre>
          </div>

          <div className="alert alert-success">
            ✅ Script created successfully! ID: <strong>{script.id}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
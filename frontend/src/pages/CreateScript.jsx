import { useState } from "react";
import { Code, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { createScript } from "../api/scriptApi";
import { useNavigate } from "react-router-dom";

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

const AUTH_TYPES = ['none', 'basic', 'bearer', 'oauth2'];

export default function CreateScript() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("simple");
  const [url, setUrl] = useState("");
  
  // Advanced mode - multiple steps
  const [steps, setSteps] = useState([
    { 
      method: "GET", 
      url: "", 
      headers: [{ key: "Content-Type", value: "application/json" }], 
      body: "",
      auth: { type: 'none', username: '', password: '', token: '' },
      checks: [],
      thinkTime: 1,
      extract: []
    }
  ]);
  
  const [script, setScript] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedStep, setExpandedStep] = useState(0);

  const submit = async () => {
    if (!url && mode === "simple") {
      alert("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const scriptData = await createScript(url); // Returns script directly
      console.log('Created script:', scriptData);
      setScript(scriptData);
      
      // Show success message and redirect after a moment
      setTimeout(() => {
        navigate('/scripts');
      }, 2000);
    } catch (err) {
      console.error('Failed to create script:', err);
      setError(err.message);
      alert("Failed to create script: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    setSteps([...steps, { 
      method: "GET", 
      url: "", 
      headers: [{ key: "Content-Type", value: "application/json" }], 
      body: "",
      auth: { type: 'none', username: '', password: '', token: '' },
      checks: [],
      thinkTime: 1,
      extract: []
    }]);
    setExpandedStep(steps.length);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addHeader = (stepIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].headers.push({ key: '', value: '' });
    setSteps(newSteps);
  };

  const updateHeader = (stepIndex, headerIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].headers[headerIndex][field] = value;
    setSteps(newSteps);
  };

  const removeHeader = (stepIndex, headerIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].headers = newSteps[stepIndex].headers.filter((_, i) => i !== headerIndex);
    setSteps(newSteps);
  };

  const addCheck = (stepIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].checks.push({ description: 'status is 200', expression: 'r.status === 200' });
    setSteps(newSteps);
  };

  const updateCheck = (stepIndex, checkIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].checks[checkIndex][field] = value;
    setSteps(newSteps);
  };

  const removeCheck = (stepIndex, checkIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].checks = newSteps[stepIndex].checks.filter((_, i) => i !== checkIndex);
    setSteps(newSteps);
  };

  const addExtractor = (stepIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].extract.push({ name: '', jsonPath: '', regex: '' });
    setSteps(newSteps);
  };

  const updateExtractor = (stepIndex, extractIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].extract[extractIndex][field] = value;
    setSteps(newSteps);
  };

  const removeExtractor = (stepIndex, extractIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].extract = newSteps[stepIndex].extract.filter((_, i) => i !== extractIndex);
    setSteps(newSteps);
  };

  return (
    <div className="page">
      <h1 className="page-title">Create Test Script</h1>

      {error && (
        <div className="card" style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', marginBottom: '16px' }}>
          <p style={{ color: '#dc2626' }}>{error}</p>
        </div>
      )}

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
            disabled={loading || !url}
            className="btn-primary"
          >
            {loading ? "Generating..." : "Generate Script"}
          </button>
        </div>
      ) : (
        <div>
          {steps.map((step, stepIndex) => (
            <div key={stepIndex} className="card" style={{ marginBottom: '16px' }}>
              <div className="step-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <h3>Step {stepIndex + 1}</h3>
                  <button
                    onClick={() => setExpandedStep(expandedStep === stepIndex ? -1 : stepIndex)}
                    className="btn-icon"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    {expandedStep === stepIndex ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
                {steps.length > 1 && (
                  <button
                    onClick={() => removeStep(stepIndex)}
                    className="btn-icon btn-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Basic Request Info */}
              <div className="form-row">
                <div className="form-group" style={{ width: '150px' }}>
                  <label>Method</label>
                  <select
                    value={step.method}
                    onChange={(e) => updateStep(stepIndex, 'method', e.target.value)}
                    className="input-primary"
                  >
                    {HTTP_METHODS.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>URL</label>
                  <input
                    type="text"
                    placeholder="https://api.example.com/endpoint"
                    value={step.url}
                    onChange={(e) => updateStep(stepIndex, 'url', e.target.value)}
                    className="input-primary"
                  />
                </div>
              </div>

              {expandedStep === stepIndex && (
                <>
                  {/* Authentication */}
                  <div className="form-section" style={{ marginTop: '16px' }}>
                    <h4>Authentication</h4>
                    <div className="form-group">
                      <label>Auth Type</label>
                      <select
                        value={step.auth.type}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[stepIndex].auth.type = e.target.value;
                          setSteps(newSteps);
                        }}
                        className="input-primary"
                      >
                        {AUTH_TYPES.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {step.auth.type === 'basic' && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            value={step.auth.username}
                            onChange={(e) => {
                              const newSteps = [...steps];
                              newSteps[stepIndex].auth.username = e.target.value;
                              setSteps(newSteps);
                            }}
                            className="input-primary"
                          />
                        </div>
                        <div className="form-group">
                          <label>Password</label>
                          <input
                            type="password"
                            value={step.auth.password}
                            onChange={(e) => {
                              const newSteps = [...steps];
                              newSteps[stepIndex].auth.password = e.target.value;
                              setSteps(newSteps);
                            }}
                            className="input-primary"
                          />
                        </div>
                      </div>
                    )}

                    {step.auth.type === 'bearer' && (
                      <div className="form-group">
                        <label>Token</label>
                        <input
                          type="text"
                          value={step.auth.token}
                          onChange={(e) => {
                            const newSteps = [...steps];
                            newSteps[stepIndex].auth.token = e.target.value;
                            setSteps(newSteps);
                          }}
                          className="input-primary"
                          placeholder="your-token-here"
                        />
                      </div>
                    )}
                  </div>

                  {/* Headers */}
                  <div className="form-section" style={{ marginTop: '16px' }}>
                    <h4>Headers</h4>
                    {step.headers.map((header, headerIndex) => (
                      <div key={headerIndex} className="form-row">
                        <input
                          type="text"
                          placeholder="Header Name"
                          value={header.key}
                          onChange={(e) => updateHeader(stepIndex, headerIndex, 'key', e.target.value)}
                          className="input-primary"
                        />
                        <input
                          type="text"
                          placeholder="Header Value"
                          value={header.value}
                          onChange={(e) => updateHeader(stepIndex, headerIndex, 'value', e.target.value)}
                          className="input-primary"
                        />
                        <button
                          onClick={() => removeHeader(stepIndex, headerIndex)}
                          className="btn-icon btn-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addHeader(stepIndex)} className="btn-secondary">
                      Add Header
                    </button>
                  </div>

                  {/* Request Body */}
                  {(step.method === "POST" || step.method === "PUT" || step.method === "PATCH") && (
                    <div className="form-section" style={{ marginTop: '16px' }}>
                      <h4>Request Body</h4>
                      <div className="form-group">
                        <label>Body (JSON)</label>
                        <textarea
                          placeholder='{"key": "value"}'
                          value={step.body}
                          onChange={(e) => updateStep(stepIndex, 'body', e.target.value)}
                          className="input-primary"
                          rows="5"
                        />
                      </div>
                    </div>
                  )}

                  {/* Think Time */}
                  <div className="form-section" style={{ marginTop: '16px' }}>
                    <h4>Think Time</h4>
                    <div className="form-group">
                      <label>Sleep Duration (seconds)</label>
                      <input
                        type="number"
                        value={step.thinkTime}
                        onChange={(e) => updateStep(stepIndex, 'thinkTime', e.target.value)}
                        className="input-primary"
                        min="0"
                        max="60"
                        step="0.1"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}

          <button onClick={addStep} className="btn-secondary" style={{ marginBottom: '16px' }}>
            <Plus size={16} />
            Add Step
          </button>

          <button onClick={submit} disabled={loading} className="btn-primary btn-lg">
            {loading ? "Creating..." : "Create Multi-Step Script"}
          </button>
        </div>
      )}

      {/* Generated Script Preview */}
      {script && (
        <div className="card" style={{ marginTop: '16px' }}>
          <h2 className="card-title">
            <CheckCircle size={20} style={{ color: '#22c55e' }} />
            Script Created Successfully!
          </h2>
          
          <div className="script-preview">
            <pre>{JSON.stringify(script, null, 2)}</pre>
          </div>

          <div className="alert alert-success">
            ✅ Script created successfully! ID: <strong>{script.id}</strong>
          </div>

          <p className="text-muted" style={{ marginTop: '16px' }}>
            Redirecting to scripts page...
          </p>
        </div>
      )}
    </div>
  );
}
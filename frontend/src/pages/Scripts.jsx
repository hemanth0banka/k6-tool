import { useEffect, useState } from "react";
import { getScripts, getK6Script } from "../api/scriptApi";
import { downloadJS } from "../utils/download";
import { Code, Download, Eye, Trash2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Scripts() {
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [k6Code, setK6Code] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      setLoading(true);
      setError(null);
      const scriptsData = await getScripts(); // Returns array directly
      console.log('Loaded scripts:', scriptsData);
      setScripts(scriptsData || []);
    } catch (err) {
      console.error("Failed to load scripts:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (script) => {
    try {
      setSelectedScript(script);
      const code = await getK6Script(script.id); // Returns text directly
      setK6Code(code);
    } catch (err) {
      alert("Failed to load K6 script: " + err.message);
    }
  };

  const handleDownload = () => {
    if (!k6Code) return;
    downloadJS(k6Code, `test-${selectedScript.id.slice(0, 8)}.js`);
  };

  const handleRunTest = (scriptId) => {
    navigate('/run', { state: { scriptId } });
  };

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Scripts</h1>
        <div className="card">
          <p className="text-muted">Loading scripts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1 className="page-title">Scripts</h1>
        <div className="card">
          <p style={{ color: '#dc2626' }}>Error: {error}</p>
          <button onClick={loadScripts} className="btn-primary" style={{ marginTop: '16px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Test Scripts</h1>
        <button onClick={() => navigate('/create')} className="btn-primary">
          <Code size={16} />
          Create New Script
        </button>
      </div>

      {scripts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Code size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
          <h3 style={{ marginBottom: '8px' }}>No Scripts Yet</h3>
          <p className="text-muted" style={{ marginBottom: '16px' }}>
            Create your first test script to get started
          </p>
          <button onClick={() => navigate('/create')} className="btn-primary">
            <Code size={16} />
            Create Script
          </button>
        </div>
      ) : (
        <div className="card-list">
          {scripts.map((script) => (
            <div key={script.id} className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: '16px', marginBottom: '4px' }}>
                    Script {script.id.slice(0, 12)}...
                  </h3>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    {script.steps.length} step{script.steps.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Script Steps Preview */}
              <div style={{ margin: '16px 0', padding: '12px', background: '#0f172a', borderRadius: '6px' }}>
                {script.steps.slice(0, 3).map((step, i) => (
                  <div key={i} style={{ 
                    fontSize: '13px', 
                    color: '#94a3b8',
                    marginBottom: i < Math.min(script.steps.length, 3) - 1 ? '8px' : '0'
                  }}>
                    <span style={{ 
                      color: '#2563eb', 
                      fontWeight: '600',
                      marginRight: '8px'
                    }}>
                      {step.method}
                    </span>
                    <span style={{ color: '#e5e7eb' }}>
                      {step.url.length > 50 ? step.url.slice(0, 50) + '...' : step.url}
                    </span>
                  </div>
                ))}
                {script.steps.length > 3 && (
                  <p className="text-muted" style={{ fontSize: '12px', marginTop: '8px' }}>
                    +{script.steps.length - 3} more steps
                  </p>
                )}
              </div>

              <div className="card-actions">
                <button 
                  onClick={() => handleView(script)} 
                  className="btn-secondary"
                >
                  <Eye size={16} />
                  View K6 Script
                </button>
                <button 
                  onClick={() => handleRunTest(script.id)} 
                  className="btn-primary"
                >
                  <Play size={16} />
                  Run Test
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* K6 Script Modal */}
      {selectedScript && k6Code && (
        <div className="modal-overlay" onClick={() => setSelectedScript(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px' }}>
                Generated K6 Script
              </h2>
              <button onClick={handleDownload} className="btn-primary">
                <Download size={16} />
                Download
              </button>
            </div>

            <div className="script-preview" style={{ maxHeight: '500px', overflow: 'auto' }}>
              <pre style={{ margin: 0 }}>{k6Code}</pre>
            </div>

            <div className="modal-actions">
              <button onClick={() => setSelectedScript(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
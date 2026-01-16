import { useEffect, useState } from "react";
import { getHistory } from "../api/testApi";
import { Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, success, failure
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const historyData = await getHistory(); // Returns array directly
      console.log('Loaded history:', historyData);
      setHistory(historyData || []);
    } catch (err) {
      console.error("Failed to load history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((test) => {
    if (filter === "success") {
      return test.failure === 0;
    } else if (filter === "failure") {
      return test.failure > 0;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Test History</h1>
        <div className="card">
          <p className="text-muted">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1 className="page-title">Test History</h1>
        <div className="card">
          <p style={{ color: '#dc2626' }}>Error: {error}</p>
          <button onClick={loadHistory} className="btn-primary" style={{ marginTop: '16px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Test History</h1>
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Clock size={48} style={{ margin: '0 auto 16px', color: '#64748b' }} />
          <h3 style={{ marginBottom: '8px' }}>No Tests Run Yet</h3>
          <p className="text-muted">
            Execute your first load test to see results here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Test History</h1>
        <button onClick={loadHistory} className="btn-secondary">
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "btn-primary" : "btn-secondary"}
          >
            All ({history.length})
          </button>
          <button
            onClick={() => setFilter("success")}
            className={filter === "success" ? "btn-primary" : "btn-secondary"}
          >
            <CheckCircle size={16} />
            Success ({history.filter(t => t.failure === 0).length})
          </button>
          <button
            onClick={() => setFilter("failure")}
            className={filter === "failure" ? "btn-primary" : "btn-secondary"}
          >
            <XCircle size={16} />
            With Failures ({history.filter(t => t.failure > 0).length})
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="test-list">
        {filteredHistory.map((test, index) => {
          const successRate = test.totalRequests > 0 
            ? ((test.success / test.totalRequests) * 100).toFixed(1)
            : 0;
          
          // Handle both camelCase and PascalCase from backend
          const testId = test.testId || test.testID || 'unknown';
          const scriptId = test.scriptId || test.scriptID || 'unknown';
          
          return (
            <div key={index} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {test.failure === 0 ? (
                      <CheckCircle size={20} style={{ color: '#22c55e' }} />
                    ) : (
                      <XCircle size={20} style={{ color: '#dc2626' }} />
                    )}
                    <h3 style={{ fontSize: '16px', color: '#f9fafb' }}>
                      Test {testId}
                    </h3>
                  </div>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    Script: {scriptId.slice(0, 12)}...
                  </p>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    {new Date(test.startedAt).toLocaleString()}
                  </p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: '700',
                    color: successRate > 90 ? '#22c55e' : successRate > 70 ? '#f59e0b' : '#dc2626'
                  }}>
                    {successRate}%
                  </div>
                  <p className="text-muted" style={{ fontSize: '12px' }}>Success Rate</p>
                </div>
              </div>

              <div className="stats">
                <div className="stat-box">
                  <h4>Total Requests</h4>
                  <p>{test.totalRequests}</p>
                </div>
                <div className="stat-box">
                  <h4>Success</h4>
                  <p style={{ color: '#22c55e' }}>{test.success}</p>
                </div>
                <div className="stat-box">
                  <h4>Failures</h4>
                  <p style={{ color: test.failure > 0 ? '#dc2626' : '#94a3b8' }}>
                    {test.failure}
                  </p>
                </div>
                <div className="stat-box">
                  <h4>Avg Latency</h4>
                  <p>{test.avgLatencyMs}ms</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredHistory.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p className="text-muted">No tests match the selected filter</p>
        </div>
      )}
    </div>
  );
}
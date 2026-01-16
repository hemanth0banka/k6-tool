import { useEffect, useState } from "react";
import { TrendingUp, Activity, CheckCircle, Clock, Play, Code } from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:8080";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTests: 0,
    totalScripts: 0,
    successRate: 0,
    avgLatency: 0,
  });
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [historyRes, scriptsRes] = await Promise.all([
        fetch(`${API_BASE}/history`).then(r => r.json()),
        fetch(`${API_BASE}/scripts`).then(r => r.json())
      ]);

      // Both endpoints return data directly
      const history = historyRes || [];
      const scripts = scriptsRes || [];

      console.log('Dashboard data:', { history, scripts });

      const totalTests = history.length;
      const totalRequests = history.reduce((sum, t) => sum + (t.totalRequests || 0), 0);
      const totalSuccess = history.reduce((sum, t) => sum + (t.success || 0), 0);
      const avgLatency = history.length > 0
        ? history.reduce((sum, t) => sum + (t.avgLatencyMs || 0), 0) / history.length
        : 0;

      setStats({
        totalTests,
        totalScripts: scripts.length,
        successRate: totalRequests > 0 ? ((totalSuccess / totalRequests) * 100).toFixed(1) : 0,
        avgLatency: avgLatency.toFixed(0),
      });

      setRecentTests(history.slice(0, 5));
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Dashboard</h1>
        <div className="card">
          <p className="text-muted">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1 className="page-title">Dashboard</h1>
        <div className="card">
          <p style={{ color: '#dc2626' }}>Error: {error}</p>
          <button onClick={loadDashboardData} className="btn-primary" style={{ marginTop: '16px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
        <Link to="/run">
          <button className="btn-primary">
            <Play size={16} />
            Run New Test
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard
          icon={Activity}
          label="Total Tests"
          value={stats.totalTests}
          trend="+12%"
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Success Rate"
          value={`${stats.successRate}%`}
          trend="+2.3%"
          color="green"
        />
        <StatCard
          icon={Clock}
          label="Avg Latency"
          value={`${stats.avgLatency}ms`}
          trend="-15ms"
          color="purple"
        />
        <StatCard
          icon={Code}
          label="Active Scripts"
          value={stats.totalScripts}
          trend="+3"
          color="orange"
        />
      </div>

      {/* Recent Tests */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="card-title" style={{ marginBottom: 0 }}>Recent Test Runs</h2>
          <Link to="/history">
            <button className="btn-secondary" style={{ fontSize: '14px', padding: '8px 16px' }}>
              View All
            </button>
          </Link>
        </div>
        
        {recentTests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Activity size={48} className="text-muted" style={{ margin: '0 auto 16px' }} />
            <p className="text-muted">No tests run yet. Start by creating a script!</p>
            <Link to="/create">
              <button className="btn-primary" style={{ marginTop: '16px' }}>
                <Code size={16} />
                Create Script
              </button>
            </Link>
          </div>
        ) : (
          <div className="test-list">
            {recentTests.map((test, i) => {
              const scriptId = test.scriptId || test.scriptID || 'unknown';
              return (
                <div key={i} className="test-item" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: '#0f172a',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid #334155'
                }}>
                  <div className="test-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="test-status success" style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: test.failure === 0 ? '#22c55e' : '#ef4444'
                    }}></div>
                    <div>
                      <h3 style={{ fontSize: '14px', marginBottom: '4px' }}>
                        Script: {scriptId.slice(0, 8)}...
                      </h3>
                      <p className="text-muted" style={{ fontSize: '12px' }}>
                        {new Date(test.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="test-metrics" style={{ display: 'flex', gap: '24px' }}>
                    <span className="metric" style={{ fontSize: '14px' }}>
                      <strong>{test.totalRequests}</strong> requests
                    </span>
                    <span className="metric" style={{ fontSize: '14px', color: '#22c55e' }}>
                      <strong>{test.success}</strong> success
                    </span>
                    <span className="metric" style={{ fontSize: '14px' }}>
                      <strong>{test.avgLatencyMs}ms</strong> avg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions" style={{ marginTop: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Quick Start</h2>
        <div className="action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <ActionCard
            emoji="💨"
            title="Smoke Test"
            description="Minimal load verification"
            vus={1}
            duration="10s"
          />
          <ActionCard
            emoji="📊"
            title="Load Test"
            description="Average load testing"
            vus={50}
            duration="1m"
          />
          <ActionCard
            emoji="⚡"
            title="Stress Test"
            description="Beyond capacity testing"
            vus={200}
            duration="5m"
          />
          <ActionCard
            emoji="📈"
            title="Spike Test"
            description="Sudden surge testing"
            vus={300}
            duration="30s"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color }) {
  const colorMap = {
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#8b5cf6',
    orange: '#f97316'
  };

  return (
    <div className="stat-card" style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: colorMap[color],
        opacity: 0.1
      }}></div>
      <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span className="stat-label" style={{ color: '#94a3b8', fontSize: '14px' }}>{label}</span>
        <div className="stat-icon" style={{ color: colorMap[color] }}>
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-value" style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>{value}</div>
      <div className="stat-trend" style={{ fontSize: '12px', color: '#22c55e' }}>{trend}</div>
    </div>
  );
}

function ActionCard({ emoji, title, description, vus, duration }) {
  return (
    <Link to="/run" style={{ textDecoration: 'none' }}>
      <div className="action-card" style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ':hover': {
          borderColor: '#2563eb',
          transform: 'translateY(-2px)'
        }
      }}>
        <div className="action-emoji" style={{ fontSize: '32px', marginBottom: '12px' }}>{emoji}</div>
        <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#f9fafb' }}>{title}</h3>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>{description}</p>
        <div className="action-params" style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b' }}>
          <span>{vus} VUs</span>
          <span>•</span>
          <span>{duration}</span>
        </div>
      </div>
    </Link>
  );
}
import { useEffect, useState } from "react";
import { getHistory } from "../api/testApi";
import { getScripts } from "../api/scriptApi";
import { TrendingUp, Activity, CheckCircle, Clock } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTests: 0,
    totalScripts: 0,
    successRate: 0,
    avgLatency: 0,
  });
  const [recentTests, setRecentTests] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [historyRes, scriptsRes] = await Promise.all([
        getHistory(),
        getScripts(),
      ]);

      const history = historyRes.data || [];
      const scripts = scriptsRes.data || [];

      // Calculate stats
      const totalTests = history.length;
      const totalRequests = history.reduce((sum, t) => sum + t.totalRequests, 0);
      const totalSuccess = history.reduce((sum, t) => sum + t.success, 0);
      const avgLatency = history.length > 0
        ? history.reduce((sum, t) => sum + t.avgLatencyMs, 0) / history.length
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
    }
  };

  return (
    <div className="page dashboard-page">
      <h1 className="page-title">Dashboard</h1>

      {/* Stats Grid */}
      <div className="stats-grid">
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
          icon={TrendingUp}
          label="Active Scripts"
          value={stats.totalScripts}
          trend="+3"
          color="orange"
        />
      </div>

      {/* Recent Tests */}
      <div className="card">
        <h2 className="card-title">Recent Test Runs</h2>
        
        {recentTests.length === 0 ? (
          <p className="text-muted">No tests run yet. Start by creating a script!</p>
        ) : (
          <div className="test-list">
            {recentTests.map((test, i) => (
              <div key={i} className="test-item">
                <div className="test-info">
                  <div className="test-status success"></div>
                  <div>
                    <h3>Script: {test.scriptId.slice(0, 8)}...</h3>
                    <p className="text-muted">
                      {new Date(test.startedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="test-metrics">
                  <span className="metric">
                    <strong>{test.totalRequests}</strong> requests
                  </span>
                  <span className="metric">
                    <strong>{test.success}</strong> success
                  </span>
                  <span className="metric">
                    <strong>{test.avgLatencyMs}ms</strong> avg
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Start</h2>
        <div className="action-grid">
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
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className="stat-icon">
          <Icon size={20} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-trend">{trend}</div>
    </div>
  );
}

function ActionCard({ emoji, title, description, vus, duration }) {
  return (
    <div className="action-card">
      <div className="action-emoji">{emoji}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="action-params">
        <span>{vus} VUs</span>
        <span>{duration}</span>
      </div>
      <button className="btn-secondary">Start Test</button>
    </div>
  );
}
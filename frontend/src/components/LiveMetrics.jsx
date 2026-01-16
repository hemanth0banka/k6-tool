
import { useState, useEffect, useRef } from "react";
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function LiveMetrics({ testId, isRunning }) {
  const [metrics, setMetrics] = useState({
    currentVUs: 0,
    totalRequests: 0,
    requestRate: 0,
    errorRate: 0,
    avgLatency: 0,
    p95Latency: 0,
  });

  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isRunning || !testId) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Simulate real-time metrics updates
    // In production, this would connect to WebSocket
    intervalRef.current = setInterval(() => {
      const newMetrics = {
        currentVUs: Math.floor(Math.random() * 100) + 10,
        totalRequests: metrics.totalRequests + Math.floor(Math.random() * 50) + 10,
        requestRate: Math.floor(Math.random() * 100) + 20,
        errorRate: Math.random() * 5,
        avgLatency: Math.floor(Math.random() * 200) + 100,
        p95Latency: Math.floor(Math.random() * 400) + 200,
      };

      setMetrics(newMetrics);

      // Add to history
      const timestamp = new Date().toLocaleTimeString();
      setHistory(prev => {
        const newHistory = [...prev, {
          time: timestamp,
          latency: newMetrics.avgLatency,
          requests: newMetrics.requestRate,
          errors: newMetrics.errorRate
        }];
        return newHistory.slice(-20); // Keep last 20 data points
      });

      // Check for alerts
      if (newMetrics.errorRate > 3) {
        setAlerts(prev => [{
          id: Date.now(),
          type: 'error',
          message: `High error rate: ${newMetrics.errorRate.toFixed(2)}%`
        }, ...prev].slice(0, 5));
      }

      if (newMetrics.p95Latency > 500) {
        setAlerts(prev => [{
          id: Date.now(),
          type: 'warning',
          message: `High p95 latency: ${newMetrics.p95Latency}ms`
        }, ...prev].slice(0, 5));
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, testId, metrics.totalRequests]);

  const getMetricTrend = (current, previous) => {
    if (!previous) return null;
    return current > previous ? 'up' : 'down';
  };

  return (
    <div className="live-metrics">
      {/* Status Header */}
      <div className="live-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={`status-indicator ${isRunning ? 'running' : 'stopped'}`}>
            <Activity size={20} />
          </div>
          <div>
            <h2 className="card-title" style={{ marginBottom: '4px' }}>Live Metrics</h2>
            <span className="text-muted" style={{ fontSize: '14px' }}>
              {isRunning ? 'Test in progress...' : 'Test completed'}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stats" style={{ marginTop: '24px' }}>
        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4>Active VUs</h4>
            <Activity size={16} className="text-muted" />
          </div>
          <p className="stat-value">{metrics.currentVUs}</p>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4>Request Rate</h4>
            <TrendingUp size={16} className="text-success" />
          </div>
          <p className="stat-value">{metrics.requestRate}</p>
          <span className="stat-detail">req/s</span>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4>Error Rate</h4>
            {metrics.errorRate > 3 ? (
              <AlertCircle size={16} className="text-danger" />
            ) : (
              <CheckCircle size={16} className="text-success" />
            )}
          </div>
          <p className="stat-value" style={{ color: metrics.errorRate > 3 ? '#ef4444' : '#22c55e' }}>
            {metrics.errorRate.toFixed(2)}%
          </p>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4>Avg Latency</h4>
            <TrendingDown size={16} className="text-success" />
          </div>
          <p className="stat-value">{metrics.avgLatency}ms</p>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4>p95 Latency</h4>
          </div>
          <p className="stat-value">{metrics.p95Latency}ms</p>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4>Total Requests</h4>
          </div>
          <p className="stat-value">{metrics.totalRequests}</p>
        </div>
      </div>

      {/* Real-time Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Latency Chart */}
        <div className="chart-box">
          <h3>Response Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" hide />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Request Rate Chart */}
        <div className="chart-box">
          <h3>Request Rate</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" hide />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3>Alerts</h3>
          <div style={{ marginTop: '12px' }}>
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`alert alert-${alert.type === 'error' ? 'danger' : 'warning'}`}
                style={{ marginBottom: '8px' }}
              >
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
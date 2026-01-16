import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ['#22c55e', '#dc2626'];

export default function ResultCharts({ result }) {
  if (!result) return null;

  const statusData = [
    { name: "Success", value: result.success || 0 },
    { name: "Failure", value: result.failure || 0 },
  ];

  const successRate = result.totalRequests > 0 
    ? ((result.success / result.totalRequests) * 100).toFixed(1)
    : 0;

  return (
    <div>
      {/* Summary Stats */}
      <div className="stats">
        <div className="stat-box">
          <h4>Total Requests</h4>
          <p>{result.totalRequests}</p>
        </div>
        <div className="stat-box">
          <h4>Success</h4>
          <p style={{ color: '#22c55e' }}>{result.success}</p>
        </div>
        <div className="stat-box">
          <h4>Failures</h4>
          <p style={{ color: '#dc2626' }}>{result.failure}</p>
        </div>
        <div className="stat-box">
          <h4>Avg Latency (ms)</h4>
          <p>{result.avgLatencyMs}</p>
        </div>
        <div className="stat-box">
          <h4>Success Rate</h4>
          <p style={{ color: successRate > 90 ? '#22c55e' : '#f59e0b' }}>
            {successRate}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '24px' }}>
        {/* Bar Chart */}
        <div className="chart-box">
          <h3>Request Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  background: '#020617', 
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  color: '#e5e7eb'
                }} 
              />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="chart-box">
          <h3>Success vs Failure</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#020617', 
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  color: '#e5e7eb'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Test Info */}
      <div className="card" style={{ marginTop: '24px', background: '#0f172a' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Test Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
          <div>
            <span style={{ color: '#94a3b8' }}>Test ID:</span>{' '}
            <span style={{ color: '#f9fafb' }}>{result.testId || result.testID}</span>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Script ID:</span>{' '}
            <span style={{ color: '#f9fafb' }}>{result.scriptId || result.scriptID}</span>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Started At:</span>{' '}
            <span style={{ color: '#f9fafb' }}>
              {new Date(result.startedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
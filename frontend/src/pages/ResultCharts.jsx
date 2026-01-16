import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ResultCharts({ result }) {
  if (!result) return null;

  const statusData = [
    { name: "Success", value: result.success || 0 },
    { name: "Failure", value: result.failure || 0 },
  ];

  return (
    <div>
      {/* Summary */}
      <div className="stats">
        <div className="stat-box">
          <h4>Total Requests</h4>
          <p>{result.totalRequests}</p>
        </div>
        <div className="stat-box">
          <h4>Success</h4>
          <p>{result.success}</p>
        </div>
        <div className="stat-box">
          <h4>Failures</h4>
          <p>{result.failure}</p>
        </div>
        <div className="stat-box">
          <h4>Avg Latency (ms)</h4>
          <p>{result.avgLatencyMs}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-box" style={{ height: 300 }}>
        <h3>Request Status</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


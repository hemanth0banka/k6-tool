import { useEffect, useState } from "react";
import { getHistory } from "../api/testApi";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getHistory().then(res => setHistory(res.data || []));
  }, []);

  if (history.length === 0) {
    return <p>Each executed test will appear here.</p>;
  }

  return (
    <div className="page">
      <h2>Test History</h2>

      {history.map((h, i) => (
        <div className="card" key={i}>
          <p><b>Script:</b> {h.scriptId}</p>
          <p><b>Total:</b> {h.totalRequests}</p>
          <p><b>Success:</b> {h.success}</p>
          <p><b>Failure:</b> {h.failure}</p>
          <p><b>Avg Latency:</b> {h.avgLatencyMs} ms</p>
        </div>
      ))}
    </div>
  );
}

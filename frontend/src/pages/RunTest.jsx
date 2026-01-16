import { useEffect, useState } from "react";
import { runTest } from "../api/testApi";
import { getScripts } from "../api/scriptApi";
import ResultCharts from "./ResultCharts";"./ResultCharts"

export default function RunTest() {
  const [scripts, setScripts] = useState([]);
  const [scriptId, setScriptId] = useState("");
  const [type, setType] = useState("load");
  const [vus, setVus] = useState(10);
  const [duration, setDuration] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Load scripts for dropdown
  useEffect(() => {
    getScripts().then(res => setScripts(res.data || []));
  }, []);

  const run = async () => {
    if (!scriptId) {
      alert("Please select a script");
      return;
    }

    setLoading(true);
    try {
      const res = await runTest({
        scriptId,
        type,
        vus: Number(vus),
        duration: Number(duration),
      });
      setResult(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Run Test</h2>

      {/* ✅ SCRIPT DROPDOWN */}
      <select
        value={scriptId}
        onChange={e => setScriptId(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      >
        <option value="">Select Script</option>
        {scripts.map(s => (
          <option key={s.id} value={s.id}>
            {s.id.slice(0, 8)}... ({s.steps.length} steps)
          </option>
        ))}
      </select>

      {/* Test type */}
      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="smoke">Smoke</option>
        <option value="load">Load</option>
        <option value="stress">Stress</option>
        <option value="spike">Spike</option>
      </select>

      <input
        type="number"
        value={vus}
        onChange={e => setVus(e.target.value)}
        placeholder="VUs"
      />

      <input
        type="number"
        value={duration}
        onChange={e => setDuration(e.target.value)}
        placeholder="Duration (sec)"
      />

      <button onClick={run} disabled={loading}>
        {loading ? "Running..." : "Run Test"}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Test Result</h3>
          <p>Total Requests: {result.totalRequests}</p>
          <p>Success: {result.success}</p>
          <p>Failure: {result.failure}</p>
          <p>Avg Latency: {result.avgLatencyMs} ms</p>
        </div>
      )}
      {result && <ResultCharts result={result} />}
    </div>
  );
}
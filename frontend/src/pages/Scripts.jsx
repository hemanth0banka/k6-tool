import { useEffect, useState } from "react";
import { getScripts, getK6Script } from "../api/scriptApi";
import { downloadJS } from "../utils/download";

export default function Scripts() {
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);

  useEffect(() => {
    getScripts().then(res => setScripts(res.data || []));
  }, []);

  const handleView = async (id) => {
    const res = await getK6Script(id);
    setSelectedScript(res.data);
  };

  const handleDownload = () => {
    if (!selectedScript) return;
    downloadJS(selectedScript);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Saved Scripts</h2>

      {scripts.map(s => (
        <div
          key={s.id}
          style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
        >
          <p><b>ID:</b> {s.id}</p>
          <p><b>Steps:</b> {s.steps.length}</p>

          <button onClick={() => handleView(s.id)}>
            View k6 Script
          </button>
        </div>
      ))}

      {selectedScript && (
        <div style={{ marginTop: 20 }}>
          <h3>Generated k6 Script</h3>

          <button onClick={handleDownload}>
            ⬇ Download k6 Script
          </button>

          <pre
            style={{
              background: "#111",
              color: "#0f0",
              padding: 15,
              marginTop: 10,
              overflowX: "auto",
            }}
          >
            {selectedScript}
          </pre>
        </div>
      )}
    </div>
  );
}

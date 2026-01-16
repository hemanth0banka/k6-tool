import { useState } from "react";
import { createScript } from "../api/scriptApi";

export default function CreateScript() {
  const [url, setUrl] = useState("");
  const [script, setScript] = useState(null);

  const submit = async () => {
    const res = await createScript(url);
    setScript(res.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Test Script</h2>

      <input
        placeholder="Enter URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
        style={{ width: 400 }}
      />

      <button onClick={submit}>Generate Script</button>

      {script && (
        <>
          <h3>Generated Script</h3>
          <pre>{JSON.stringify(script, null, 2)}</pre>
        </>
      )}
    </div>
  );
}

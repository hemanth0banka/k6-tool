const API_BASE = "http://localhost:8080";

export const createScript = async (url) => {
  const response = await fetch(`${API_BASE}/scripts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!response.ok) throw new Error('Failed to create script');
  return response.json();
};

export const getScripts = async () => {
  const response = await fetch(`${API_BASE}/scripts`);
  if (!response.ok) throw new Error('Failed to fetch scripts');
  return response.json();
};

export const getScript = async (scriptId) => {
  const response = await fetch(`${API_BASE}/scripts/${scriptId}`);
  if (!response.ok) throw new Error('Script not found');
  return response.json();
};

export const updateScript = async (scriptId, script) => {
  const response = await fetch(`${API_BASE}/scripts/${scriptId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(script)
  });
  if (!response.ok) throw new Error('Failed to update script');
  return response.json();
};

export const deleteScript = async (scriptId) => {
  const response = await fetch(`${API_BASE}/scripts/${scriptId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete script');
  return response.json();
};

export const getK6Script = async (scriptId) => {
  const response = await fetch(`${API_BASE}/scripts/k6?id=${scriptId}`, {
    headers: {
      'Accept': 'text/plain'
    }
  });
  if (!response.ok) throw new Error('Failed to fetch k6 script');
  return response.text();
};

export const validateScript = async (script) => {
  const response = await fetch(`${API_BASE}/scripts/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(script)
  });
  if (!response.ok) throw new Error('Failed to validate script');
  return response.json();
};


const API_BASE = "http://localhost:8080";

export const runTest = async (config) => {
  const response = await fetch(`${API_BASE}/tests/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Test failed');
  }
  return response.json(); // Returns result directly
};

export const getHistory = async () => {
  const response = await fetch(`${API_BASE}/history`);
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json(); // Returns array directly
};

export const getTestResult = async (testId) => {
  const response = await fetch(`${API_BASE}/tests/${testId}`);
  if (!response.ok) throw new Error('Failed to fetch test result');
  return response.json();
};

export const stopTest = async (testId) => {
  const response = await fetch(`${API_BASE}/tests/${testId}/stop`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to stop test');
  return response.json();
};

export const deleteTestResult = async (testId) => {
  const response = await fetch(`${API_BASE}/tests/${testId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete test');
  return response.json();
};

export const compareTests = async (testIds) => {
  const response = await fetch(`${API_BASE}/tests/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testIds })
  });
  if (!response.ok) throw new Error('Failed to compare tests');
  return response.json();
};

export const exportTestResults = async (testId, format = 'json') => {
  const response = await fetch(`${API_BASE}/tests/${testId}/export?format=${format}`);
  if (!response.ok) throw new Error('Failed to export results');
  
  if (format === 'json') {
    return response.json();
  }
  
  return response.blob();
};

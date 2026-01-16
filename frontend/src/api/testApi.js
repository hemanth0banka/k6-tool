import axios from "axios";

const API_BASE = "http://localhost:8080";

export const runTest = (script) =>
  axios.post(`${API_BASE}/tests/run`, script);

export const getHistory = () =>
  axios.get(`${API_BASE}/history`);


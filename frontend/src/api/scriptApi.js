import axios from "axios";

const BASE = "http://localhost:8080";

export const createScript = (url) =>
  axios.post(`${BASE}/scripts`, { url });

export const getScripts = () =>
  axios.get(`${BASE}/scripts`);

export const getK6Script = (id) =>
  axios.get(`${BASE}/scripts/k6?id=${id}`, {
    responseType: "text", // ✅ required for JS code
  });

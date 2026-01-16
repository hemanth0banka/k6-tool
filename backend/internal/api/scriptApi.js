export const getK6Script = (id) =>
  axios.get(`http://localhost:8080/scripts/k6?id=${id}`);

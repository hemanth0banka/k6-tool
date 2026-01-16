export function downloadJS(content, filename = "k6-test.js") {
  const blob = new Blob([content], {
    type: "application/javascript",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

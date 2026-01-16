import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: 16, background: "#111", color: "#fff" }}>
      <Link to="/" style={{ marginRight: 16 }}>Create Script</Link>
      <Link to="/scripts" style={{ marginRight: 16 }}>Scripts</Link>
      <Link to="/run" style={{ marginRight: 16 }}>Run Test</Link>
      <Link to="/history">History</Link>
    </nav>
  );
}

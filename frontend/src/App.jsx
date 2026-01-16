import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CreateScript from "./pages/CreateScript";
import Scripts from "./pages/Scripts";
import RunTest from "./pages/RunTest";
import History from "./pages/History";
import ScenarioManager from "./pages/ScenarioManager";
import "./styles/app.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateScript />} />
            <Route path="/scripts" element={<Scripts />} />
            <Route path="/scenarios" element={<ScenarioManager />} />
            <Route path="/run" element={<RunTest />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

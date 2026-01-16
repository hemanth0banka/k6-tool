import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CreateScript from "./pages/CreateScript";
import Scripts from "./pages/Scripts";
import RunTest from "./pages/RunTest";
import History from "./pages/History";
import "./styles/app.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<CreateScript />} />
        <Route path="/scripts" element={<Scripts />} />
        <Route path="/run" element={<RunTest />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}


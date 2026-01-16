import { Link, useLocation } from "react-router-dom";
import { Activity, Code, Play, History, LayoutDashboard, Workflow } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/create", label: "Create Script", icon: Code },
    { path: "/scripts", label: "Scripts", icon: Activity },
    { path: "/scenarios", label: "Scenarios", icon: Workflow },
    { path: "/run", label: "Run Test", icon: Play },
    { path: "/history", label: "History", icon: History },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">⚡</div>
        <div>
          <h1>K6 Platform</h1>
          <span className="brand-subtitle">Load Testing</span>
        </div>
      </div>

      <div className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="nav-actions">
        <button className="btn-primary">
          <Play size={16} />
          Quick Test
        </button>
      </div>
    </nav>
  );
}

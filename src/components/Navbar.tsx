// Simple top navigation bar
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate({ to: "/login" });
  }

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">Team Task Manager</div>
      <div className="nav-links">
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/projects" className="nav-link">Projects</Link>
        <Link to="/team" className="nav-link">Team</Link>
        <span className="nav-role">{role}</span>
        <button className="btn btn-small" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

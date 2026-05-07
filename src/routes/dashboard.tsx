// Dashboard page - shows task stats and recent projects
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/lib/require-auth";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
});

type Stats = { total: number; completed: number; pending: number; overdue: number };
type ProjectRow = { id: string; name: string; description: string; created_at: string };

function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, pending: 0, overdue: 0 });
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    // Get tasks
    const { data: tasks } = await supabase.from("tasks").select("status, due_date");
    const today = new Date().toISOString().slice(0, 10);
    const s: Stats = { total: 0, completed: 0, pending: 0, overdue: 0 };
    (tasks ?? []).forEach((t) => {
      s.total += 1;
      if (t.status === "completed") s.completed += 1;
      if (t.status === "pending") s.pending += 1;
      if (t.due_date && t.due_date < today && t.status !== "completed") s.overdue += 1;
    });
    setStats(s);

    // Recent projects
    const { data: pr } = await supabase
      .from("projects")
      .select("id,name,description,created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    setProjects(pr ?? []);
    setLoading(false);
  }

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="container">
      <h2 className="page-title">Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="num">{stats.total}</div>
          <div className="label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="num">{stats.completed}</div>
          <div className="label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="num">{stats.pending}</div>
          <div className="label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="num">{stats.overdue}</div>
          <div className="label">Overdue</div>
        </div>
      </div>

      <h3 style={{ marginBottom: 10 }}>Recent Projects</h3>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        projects.map((p) => (
          <div className="card" key={p.id}>
            <h3>
              <Link to="/projects/$id" params={{ id: p.id }}>{p.name}</Link>
            </h3>
            <p>{p.description || "No description"}</p>
          </div>
        ))
      )}
    </div>
  );
}

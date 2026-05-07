// Projects list page - admin can create projects
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import RequireAuth from "@/lib/require-auth";

export const Route = createFileRoute("/projects")({
  component: () => (
    <RequireAuth>
      <ProjectsPage />
    </RequireAuth>
  ),
});

type ProjectRow = { id: string; name: string; description: string };

function ProjectsPage() {
  const { role, user } = useAuth();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("projects")
      .select("id,name,description")
      .order("created_at", { ascending: false });
    setProjects(data ?? []);
  }

  async function createProject(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!name.trim()) {
      setErr("Project name is required");
      return;
    }
    const { error } = await supabase
      .from("projects")
      .insert({ name: name.trim(), description: desc.trim(), created_by: user!.id });
    if (error) {
      setErr(error.message);
    } else {
      setMsg("Project created!");
      setName("");
      setDesc("");
      setShowForm(false);
      load();
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2 className="page-title">Projects</h2>
        {role === "admin" && (
          <button className="btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New Project"}
          </button>
        )}
      </div>

      {msg && <div className="msg-success">{msg}</div>}

      {showForm && role === "admin" && (
        <div className="card">
          <form onSubmit={createProject}>
            {err && <div className="msg-error">{err}</div>}
            <div className="form-group">
              <label>Project Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <button className="btn">Create Project</button>
          </form>
        </div>
      )}

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

// Project Details page - shows tasks, allows admin to add/assign tasks and add members
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import RequireAuth from "@/lib/require-auth";

export const Route = createFileRoute("/projects/$id")({
  component: () => (
    <RequireAuth>
      <ProjectDetailsPage />
    </RequireAuth>
  ),
});

type Task = {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  assigned_to: string | null;
  due_date: string | null;
};

type Profile = { id: string; full_name: string; email: string };

function ProjectDetailsPage() {
  const { id } = useParams({ from: "/projects/$id" });
  const { role, user } = useAuth();

  const [project, setProject] = useState<{ name: string; description: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [err, setErr] = useState("");

  // task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [tTitle, setTTitle] = useState("");
  const [tDesc, setTDesc] = useState("");
  const [tAssign, setTAssign] = useState("");
  const [tDue, setTDue] = useState("");

  // add member state
  const [addUserId, setAddUserId] = useState("");

  useEffect(() => {
    loadAll();
  }, [id]);

  async function loadAll() {
    const [{ data: p }, { data: t }, { data: pm }, { data: u }] = await Promise.all([
      supabase.from("projects").select("name,description").eq("id", id).maybeSingle(),
      supabase.from("tasks").select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("project_members").select("user_id").eq("project_id", id),
      supabase.from("profiles").select("id,full_name,email"),
    ]);
    setProject(p);
    setTasks((t ?? []) as Task[]);
    setAllUsers((u ?? []) as Profile[]);
    const memberIds = (pm ?? []).map((m) => m.user_id);
    setMembers((u ?? []).filter((x) => memberIds.includes(x.id)) as Profile[]);
  }

  function findUserName(uid: string | null) {
    if (!uid) return "Unassigned";
    const usr = allUsers.find((x) => x.id === uid);
    return usr ? usr.full_name || usr.email : "Unknown";
  }

  async function createTask(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (!tTitle.trim()) {
      setErr("Task title is required");
      return;
    }
    const { error } = await supabase.from("tasks").insert({
      project_id: id,
      title: tTitle.trim(),
      description: tDesc.trim(),
      assigned_to: tAssign || null,
      due_date: tDue || null,
      created_by: user!.id,
    });
    if (error) setErr(error.message);
    else {
      setTTitle(""); setTDesc(""); setTAssign(""); setTDue("");
      setShowTaskForm(false);
      loadAll();
    }
  }

  async function changeStatus(taskId: string, status: Task["status"]) {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
    if (error) alert(error.message);
    else loadAll();
  }

  async function addMember(e: FormEvent) {
    e.preventDefault();
    if (!addUserId) return;
    const { error } = await supabase
      .from("project_members")
      .insert({ project_id: id, user_id: addUserId });
    if (error) alert(error.message);
    else { setAddUserId(""); loadAll(); }
  }

  if (!project) return <div className="loading">Loading project...</div>;

  // Members eligible to assign tasks: project members + admins (just show all users for simplicity)
  const nonMembers = allUsers.filter((u) => !members.find((m) => m.id === u.id));

  return (
    <div className="container">
      <h2 className="page-title">{project.name}</h2>
      <p style={{ marginBottom: 16, color: "#555" }}>{project.description || "No description"}</p>

      {/* Members section */}
      <div className="card">
        <h3>Team Members ({members.length})</h3>
        <ul style={{ marginTop: 8, marginLeft: 18 }}>
          {members.length === 0 && <li>No members yet</li>}
          {members.map((m) => (
            <li key={m.id}>{m.full_name || m.email} <small style={{ color: "#888" }}>({m.email})</small></li>
          ))}
        </ul>

        {role === "admin" && (
          <form onSubmit={addMember} style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <select value={addUserId} onChange={(e) => setAddUserId(e.target.value)}>
              <option value="">-- Select user to add --</option>
              {nonMembers.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
              ))}
            </select>
            <button className="btn">Add</button>
          </form>
        )}
      </div>

      {/* Tasks section */}
      <div className="page-header" style={{ marginTop: 20 }}>
        <h3>Tasks ({tasks.length})</h3>
        {role === "admin" && (
          <button className="btn" onClick={() => setShowTaskForm(!showTaskForm)}>
            {showTaskForm ? "Cancel" : "+ New Task"}
          </button>
        )}
      </div>

      {showTaskForm && role === "admin" && (
        <div className="card">
          <form onSubmit={createTask}>
            {err && <div className="msg-error">{err}</div>}
            <div className="form-group">
              <label>Title</label>
              <input value={tTitle} onChange={(e) => setTTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={tDesc} onChange={(e) => setTDesc(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select value={tAssign} onChange={(e) => setTAssign(e.target.value)}>
                <option value="">-- Unassigned --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={tDue} onChange={(e) => setTDue(e.target.value)} />
            </div>
            <button className="btn">Create Task</button>
          </form>
        </div>
      )}

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Assigned To</th>
              <th>Due</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const canEdit = role === "admin" || t.assigned_to === user!.id;
              return (
                <tr key={t.id}>
                  <td>
                    <strong>{t.title}</strong>
                    {t.description && <div style={{ fontSize: 12, color: "#777" }}>{t.description}</div>}
                  </td>
                  <td>{findUserName(t.assigned_to)}</td>
                  <td>{t.due_date || "-"}</td>
                  <td><span className={`status status-${t.status}`}>{t.status.replace("_", " ")}</span></td>
                  <td>
                    {canEdit ? (
                      <select
                        value={t.status}
                        onChange={(e) => changeStatus(t.id, e.target.value as Task["status"])}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <small style={{ color: "#999" }}>-</small>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

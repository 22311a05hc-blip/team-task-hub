// Team Members page - shows everyone with their role
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/lib/require-auth";

export const Route = createFileRoute("/team")({
  component: () => (
    <RequireAuth>
      <TeamPage />
    </RequireAuth>
  ),
});

type Member = { id: string; full_name: string; email: string; role: string };

function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("id,full_name,email");
    const { data: roles } = await supabase.from("user_roles").select("user_id,role");
    const merged: Member[] = (profiles ?? []).map((p) => {
      const r = (roles ?? []).find((x) => x.user_id === p.id);
      return { ...p, role: r?.role ?? "member" };
    });
    setMembers(merged);
    setLoading(false);
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h2 className="page-title">Team Members</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td>{m.full_name || "-"}</td>
              <td>{m.email}</td>
              <td><span className="status status-in_progress">{m.role}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

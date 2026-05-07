// Login page
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (!email || !password) {
      setErr("Please fill all fields");
      return;
    }
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (res.error) setErr(res.error);
    else navigate({ to: "/dashboard" });
  }

  return (
    <div className="form-box">
      <h2>Login</h2>
      {err && <div className="msg-error">{err}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn" disabled={busy} style={{ width: "100%" }}>
          {busy ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="auth-link">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}

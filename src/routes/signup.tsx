// Signup page
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr("");

    // Basic validation
    if (!fullName || !email || !password) {
      setErr("Please fill all fields");
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      setErr("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    setBusy(true);
    const res = await signup(email, password, fullName);
    setBusy(false);
    if (res.error) setErr(res.error);
    else navigate({ to: "/dashboard" });
  }

  return (
    <div className="form-box">
      <h2>Sign Up</h2>
      {err && <div className="msg-error">{err}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn" disabled={busy} style={{ width: "100%" }}>
          {busy ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <div className="auth-link">
        Already have an account? <Link to="/login">Login</Link>
      </div>
      <p style={{ fontSize: 12, color: "#777", marginTop: 12, textAlign: "center" }}>
        Note: First user becomes Admin. Others are added as Members.
      </p>
    </div>
  );
}

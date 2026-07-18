"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, FlaskConical, LoaderCircle, ShieldCheck } from "lucide-react";
import { Toast } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [role, setRole] = useState("Researcher");
  const [email, setEmail] = useState("dr.kan@helixlab.io");
  const [password, setPassword] = useState("demo1234");
  const [toast, setToast] = useState(false);

  const signIn = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) { setError(true); return; }
    setError(false);
    setLoading(true);
    window.setTimeout(() => router.push("/dashboard"), 850);
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand"><div className="brand-mark" /><div><div className="brand-name">Helix Lab</div><span className="brand-sub" style={{ color: "var(--muted)" }}>Laboratory OS</span></div></div>
        <div className="login-card">
          <p className="eyebrow">Secure workspace</p>
          <h1>Welcome back, Dr. Kan</h1>
          <p className="page-subtitle">Sign in to continue to the Molecular Biotechnology Lab.</p>
          <form className="login-form" onSubmit={signIn}>
            {error && <div className="alert alert-danger"><AlertCircle /><div><strong>Unable to sign in</strong><p>Enter an email and password, or choose a demo account.</p></div></div>}
            <div className="field"><label htmlFor="email">Email or username</label><input id="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" /></div>
            <div className="field"><label htmlFor="password">Password</label><div className="password-wrap"><input id="password" className="input" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /><button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            <div className="login-meta"><label className="check-row"><input type="checkbox" defaultChecked /> Remember me</label><button type="button" className="btn btn-ghost btn-sm" onClick={() => { setToast(true); window.setTimeout(() => setToast(false), 2400); }}>Forgot password?</button></div>
            <button className="btn btn-primary" style={{ width: "100%", minHeight: 46 }} disabled={loading}>{loading ? <><LoaderCircle className="spin" /> Signing in…</> : <>Sign in <ArrowRight /></>}</button>
          </form>
          <div className="demo-box"><div style={{ display: "flex", gap: 9, alignItems: "center" }}><ShieldCheck size={17} color="var(--primary)" /><div><strong>Demo account</strong><div className="cell-sub">Choose a role to preview the workspace</div></div></div><div className="demo-roles">{["Researcher", "Lab Manager", "Viewer"].map((item) => <button key={item} className={`role-btn ${role === item ? "active" : ""}`} onClick={() => { setRole(item); setEmail(`${item.toLowerCase().replace(" ", ".")}@helixlab.io`); setPassword("demo1234"); }}>{item}</button>)}</div></div>
        </div>
      </section>
      <aside className="login-visual">
        <div className="visual-content"><div className="visual-kicker"><FlaskConical size={15} /> Molecular Biotechnology Lab</div><h2>Every sample.<br />One clear story.</h2><p>Bring experiments, samples, instruments, and scientific insight into one calm, connected workspace.</p><div className="visual-stats"><div><strong>2,847</strong><span>Samples tracked</span></div><div><strong>98.7%</strong><span>Data completeness</span></div><div><strong>24/7</strong><span>Lab visibility</span></div></div></div>
      </aside>
      <Toast show={toast} title="Reset link simulated" description="A password reset email would be sent to this account." />
    </main>
  );
}

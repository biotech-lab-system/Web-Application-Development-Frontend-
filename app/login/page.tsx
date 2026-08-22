"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, FlaskConical, LoaderCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { errorMessage } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { loading: sessionLoading, login, session } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (!sessionLoading && session) router.replace("/dashboard");
  }, [router, session, sessionLoading]);

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Enter your email or username and password.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await login({ identifier: identifier.trim(), password }, remember);
      router.replace("/dashboard");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link href="/login" className="auth-brand" aria-label="Helix Lab sign in">
          <div className="brand-mark" />
          <div><div className="brand-name">Helix Lab</div><span className="brand-sub" style={{ color: "var(--muted)" }}>Laboratory OS</span></div>
        </Link>
        <section className="auth-card">
          <div className="auth-form-panel">
            <div className="auth-copy">
              <p className="eyebrow">Secure workspace</p>
              <h1>Welcome back</h1>
              <p className="page-subtitle">Sign in to continue to the Molecular Biotechnology Lab.</p>
            </div>
            <form className="login-form" onSubmit={signIn} noValidate>
              {error && <div className="alert alert-danger" role="alert"><AlertCircle /><div><strong>Unable to sign in</strong><p>{error}</p></div></div>}
              <div className="field">
                <label htmlFor="identifier">Email or username</label>
                <input id="identifier" className="input" value={identifier} onChange={(event) => setIdentifier(event.target.value)} autoComplete="username" autoFocus />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="password-wrap">
                  <input id="password" className="input" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div className="login-meta">
                <label className="check-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Remember me</label>
              </div>
              <button className="btn btn-primary" style={{ width: "100%", minHeight: 46 }} disabled={submitting || sessionLoading}>
                {submitting ? <><LoaderCircle className="spin" /> Signing in…</> : <>Sign in <ArrowRight /></>}
              </button>
            </form>
            <p className="auth-switch">New to Helix Lab? <Link className="link" href="/register">Create an account</Link></p>
          </div>
          <aside className="auth-visual">
            <div className="visual-content"><div className="visual-kicker"><FlaskConical size={15} /> Molecular Biotechnology Lab</div><h2>Every sample.<br />One clear story.</h2><p>Bring experiments, samples, instruments, and scientific insight into one calm, connected workspace.</p><div className="visual-stats"><div><strong>2,847</strong><span>Samples tracked</span></div><div><strong>98.7%</strong><span>Data completeness</span></div><div><strong>24/7</strong><span>Lab visibility</span></div></div></div>
          </aside>
        </section>
        <p className="auth-footnote">Secure laboratory workspace · Role-based access</p>
      </div>
    </main>
  );
}

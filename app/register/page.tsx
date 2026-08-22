"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, FlaskConical, LoaderCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { errorMessage } from "@/lib/api";
import type { RegisterInput } from "@/types";

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const { loading: sessionLoading, register, session } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [form, setForm] = useState<RegisterInput>({ display_name: "", username: "", email: "", password: "", role: "Researcher" });

  useEffect(() => {
    if (!sessionLoading && session) router.replace("/dashboard");
  }, [router, session, sessionLoading]);

  const update = <K extends keyof RegisterInput>(key: K, value: RegisterInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    if (form.display_name.trim().length < 2) return "Display name must contain at least 2 characters.";
    if (form.username.length < 3 || form.username.length > 50 || !USERNAME_PATTERN.test(form.username)) return "Username must be 3–50 characters and use only letters, numbers, dots, dashes, or underscores.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email address.";
    if (form.password.length < 8) return "Password must contain at least 8 characters.";
    if (form.password !== confirmPassword) return "Passwords do not match.";
    return "";
  };

  const createAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await register({ ...form, display_name: form.display_name.trim(), username: form.username.trim(), email: form.email.trim().toLowerCase() }, remember);
      router.replace("/dashboard");
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell register-auth-shell">
        <Link href="/login" className="auth-brand" aria-label="Helix Lab sign in">
          <div className="brand-mark" />
          <div><div className="brand-name">Helix Lab</div><span className="brand-sub" style={{ color: "var(--muted)" }}>Laboratory OS</span></div>
        </Link>
        <section className="auth-card register-auth-card">
          <div className="auth-form-panel">
            <div className="auth-copy">
              <p className="eyebrow">Join the workspace</p>
              <h1>Create your account</h1>
              <p className="page-subtitle">Set up secure access to your laboratory workspace.</p>
            </div>
            <form className="login-form" onSubmit={createAccount} noValidate>
            {error && <div className="alert alert-danger" role="alert"><AlertCircle /><div><strong>Unable to create account</strong><p>{error}</p></div></div>}
            <div className="form-grid auth-form-grid">
              <div className="field">
                <label htmlFor="display-name">Display name</label>
                <input id="display-name" className="input" value={form.display_name} onChange={(event) => update("display_name", event.target.value)} autoComplete="name" autoFocus />
              </div>
              <div className="field">
                <label htmlFor="username">Username</label>
                <input id="username" className="input" value={form.username} onChange={(event) => update("username", event.target.value.trim())} autoComplete="username" />
                <span className="field-hint">Letters, numbers, dots, dashes, and underscores</span>
              </div>
              <div className="field span-2">
                <label htmlFor="email">Email</label>
                <input id="email" className="input" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} autoComplete="email" />
              </div>
              <div className="field">
                <label htmlFor="new-password">Password</label>
                <div className="password-wrap">
                  <input id="new-password" className="input" type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => update("password", event.target.value)} autoComplete="new-password" />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide passwords" : "Show passwords"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                <span className="field-hint">At least 8 characters</span>
              </div>
              <div className="field">
                <label htmlFor="confirm-password">Confirm password</label>
                <input id="confirm-password" className="input" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
              </div>
              <div className="field span-2">
                <label htmlFor="role">Workspace role</label>
                <select id="role" className="select" value={form.role} onChange={(event) => update("role", event.target.value as RegisterInput["role"])}>
                  <option value="Researcher">Researcher — create and manage assigned work</option>
                  <option value="Viewer">Viewer — read-only access</option>
                </select>
                <span className="field-hint">Lab Manager accounts must be provisioned by an administrator.</span>
              </div>
            </div>
            <label className="check-row"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> Keep me signed in on this device</label>
            <button className="btn btn-primary" style={{ width: "100%", minHeight: 46 }} disabled={submitting || sessionLoading}>
              {submitting ? <><LoaderCircle className="spin" /> Creating account…</> : <>Create account <ArrowRight /></>}
            </button>
            </form>
            <p className="auth-switch">Already have an account? <Link className="link" href="/login">Sign in</Link></p>
          </div>
          <aside className="auth-visual">
            <div className="visual-content"><div className="visual-kicker"><FlaskConical size={15} /> Molecular Biotechnology Lab</div><h2>Start with secure,<br />connected science.</h2><p>Create your account to bring experiments, samples, instruments, and scientific insight into one workspace.</p><div className="auth-benefit"><ShieldCheck /><div><strong>Role-based access</strong><span>Your account starts with only the permissions assigned to your selected role.</span></div></div></div>
          </aside>
        </section>
        <p className="auth-footnote">Secure laboratory workspace · Role-based access</p>
      </div>
    </main>
  );
}

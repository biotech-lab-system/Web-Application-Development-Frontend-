"use client";

import { useEffect } from "react";
import { AlertTriangle, Check, Inbox, X } from "lucide-react";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "success" | "warning" | "danger" | "info" | "neutral" | "primary" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Modal({ open, onClose, title, description, children, footer, large = false }: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  large?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`dialog ${large ? "dialog-lg" : ""}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <header className="dialog-header">
          <div><h2 id="dialog-title">{title}</h2>{description && <p>{description}</p>}</div>
          <button className="close-btn" onClick={onClose} aria-label="Close dialog"><X /></button>
        </header>
        <div className="dialog-body">{children}</div>
        {footer && <footer className="dialog-footer">{footer}</footer>}
      </section>
    </div>
  );
}

export function Drawer({ open, onClose, title, description, children, footer }: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header className="dialog-header">
          <div><h2 id="drawer-title">{title}</h2>{description && <p>{description}</p>}</div>
          <button className="close-btn" onClick={onClose} aria-label="Close drawer"><X /></button>
        </header>
        <div className="dialog-body">{children}</div>
        {footer && <footer className="dialog-footer">{footer}</footer>}
      </section>
    </div>
  );
}

export function Toast({ show, title, description, error = false }: { show: boolean; title: string; description: string; error?: boolean }) {
  if (!show) return null;
  return (
    <div className="toast" role="status" style={error ? { borderLeftColor: "var(--danger)" } : undefined}>
      <div className="toast-icon" style={error ? { color: "var(--danger)", background: "var(--danger-soft)" } : undefined}>
        {error ? <AlertTriangle size={17} /> : <Check size={17} />}
      </div>
      <div><strong>{title}</strong><span>{description}</span></div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div><div className="empty-visual"><Inbox size={30} /></div><h2>{title}</h2><p>{description}</p>{action}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const success = ["Stored", "Available", "Completed", "Pinned", "Good", "Running"];
  const warning = ["In Use", "Processing", "Planning", "Expiring", "Generating", "On Hold"];
  const danger = ["Quarantined", "Failed", "Maintenance"];
  const tone = success.includes(status) ? "success" : warning.includes(status) ? "warning" : danger.includes(status) ? "danger" : status === "Draft" ? "info" : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <header className="page-header">
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-subtitle">{description}</p></div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function StatCard({ icon, value, label, trend }: { icon: React.ReactNode; value: string | number; label: string; trend?: string }) {
  return <div className="card stat-card"><div className="stat-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span></div>{trend && <div className="trend">{trend}</div>}</div>;
}

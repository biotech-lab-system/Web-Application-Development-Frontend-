"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive, Bell, Beaker, BookOpenText, Bot, ChevronDown, FlaskConical, LayoutDashboard,
  LogOut, Menu, Microscope, Moon, PanelLeftClose, PanelLeftOpen, Search, Settings,
  Sun, TestTubes, UserRound, X,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { notifications } from "@/data/mock";

const navigationSections = [
  { label: "Workspace", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/samples", label: "Samples", icon: TestTubes },
    { href: "/experiments", label: "Experiments", icon: FlaskConical },
  ] },
  { label: "Operations", items: [
    { href: "/sample-tracking", label: "Sample Tracking", icon: Search },
    { href: "/equipment", label: "Equipment Booking", icon: Microscope },
    { href: "/lab-notebook", label: "Lab Notebook", icon: BookOpenText },
  ] },
  { label: "Intelligence", items: [
    { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
    { href: "/reports", label: "Reports", icon: Beaker },
  ] },
  { label: "System", items: [
    { href: "/archive", label: "Archive", icon: Archive },
    { href: "/settings", label: "Settings", icon: Settings },
  ] },
];
const navigation = navigationSections.flatMap((section) => section.items);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const noticeRef = useRef<HTMLDivElement>(null);
  const displayName = user?.display_name || user?.username || "User";
  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  useEffect(() => {
    const saved = localStorage.getItem("helix-theme") === "dark";
    document.documentElement.dataset.theme = saved ? "dark" : "light";
    const timer = window.setTimeout(() => setDark(saved), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (noticeRef.current && !noticeRef.current.contains(event.target as Node)) setNoticesOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const current = useMemo(() => navigation.find((item) => pathname.startsWith(item.href)), [pathname]);
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("helix-theme", next ? "dark" : "light");
  };
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (search.trim()) router.push(`/samples?q=${encodeURIComponent(search.trim())}`);
  };
  const signOut = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark" aria-hidden="true" />
          <div className="brand-copy"><div className="brand-name">Helix Lab</div><span className="brand-sub">Laboratory OS</span></div>
          <button className="close-btn sidebar-close mobile-only" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>
        </div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigationSections.map((section) => <div className="nav-section" key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
              return <Link key={item.href} href={item.href} className={`nav-link ${active ? "active" : ""}`} onClick={() => setMobileOpen(false)} title={collapsed ? item.label : undefined}><item.icon /><span className="nav-label">{item.label}</span></Link>;
            })}
          </div>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-profile"><div className="avatar">{initials}</div><div className="profile-copy"><strong>{displayName}</strong><span>{user?.email}</span><em className="role-chip">{user?.role}</em></div></div>
          <button className="logout-btn" onClick={signOut}><LogOut size={16} /><span className="logout-label">Log out</span></button>
        </div>
      </aside>

      <main className={`app-main ${collapsed ? "collapsed" : ""}`}>
        <header className="topbar">
          <button className="icon-btn desktop-collapse" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</button>
          <button className="icon-btn mobile-only" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button>
          <span className="header-separator" aria-hidden="true" />
          <div className="topbar-left"><div className="breadcrumb"><small>Molecular Biotechnology Lab</small><strong>{current?.label ?? "Workspace"}</strong></div></div>
          <form className="global-search" onSubmit={submitSearch}><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search samples, experiments…" aria-label="Global search" /><kbd>/</kbd></form>
          <div className="topbar-right">
            <select className="lab-select" aria-label="Laboratory selector" defaultValue="molecular"><option value="molecular">Molecular Biotechnology Lab</option><option value="genomics">Genomics Core Lab</option></select>
            <div className="relative" ref={noticeRef}>
              <button className="icon-btn" onClick={() => { setNoticesOpen(!noticesOpen); setProfileOpen(false); }} aria-label="Notifications"><Bell /><span className="notice-dot" /></button>
              {noticesOpen && <div className="popover"><div className="popover-header"><strong>Notifications</strong><button className="btn btn-ghost btn-sm" onClick={() => setNoticesOpen(false)}>Mark all read</button></div><div className="popover-list">{notifications.slice(0, 6).map((item) => <div className="notice-row" key={item.id}><div className="notice-icon"><Bell size={14} /></div><div><strong>{item.title}</strong><span>{item.detail} · {item.time}</span></div></div>)}</div></div>}
            </div>
            <button className="icon-btn theme-button" onClick={toggleTheme} aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</button>
            <div className="relative">
              <button className="user-menu" onClick={() => { setProfileOpen(!profileOpen); setNoticesOpen(false); }} aria-label="Open user menu"><div className="avatar">{initials}</div><span>{displayName}</span><ChevronDown size={14} /></button>
              {profileOpen && <div className="popover" style={{ width: 220 }}><div className="popover-header"><div><strong>{displayName}</strong><div className="cell-sub">{user?.role}</div></div></div><div style={{ padding: 8 }}><Link href="/settings" className="nav-link" style={{ color: "var(--ink)" }} onClick={() => setProfileOpen(false)}><UserRound />Profile settings</Link><button className="logout-btn" style={{ color: "var(--danger)" }} onClick={signOut}><LogOut size={16} />Log out</button></div></div>}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

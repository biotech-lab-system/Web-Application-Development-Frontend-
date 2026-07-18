"use client";

import { useState } from "react";
import Link from "next/link";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowRight, Beaker, CalendarClock, CheckCircle2, ClipboardCheck, FlaskConical, Microscope, PackageOpen, TestTubes, ThermometerSun } from "lucide-react";
import { bookings, chartData, chemicals, experiments, notifications, samples, tasks as initialTasks } from "@/data/mock";
import { Badge, PageHeader, StatCard, StatusBadge, Toast } from "@/components/ui";

export default function DashboardPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [toast, setToast] = useState(false);
  const toggleTask = (id: string) => {
    setTasks((items) => items.map((item) => item.id === id ? { ...item, done: !item.done } : item));
    setToast(true); window.setTimeout(() => setToast(false), 1800);
  };
  return (
    <div className="page">
      <PageHeader eyebrow="Saturday, July 18" title="Good morning, Dr. Kan" description="Here’s the pulse of Molecular Biotechnology Lab today." actions={<><Link className="btn btn-secondary" href="/reports">View reports</Link><Link className="btn btn-primary" href="/samples">Register sample <ArrowRight /></Link></>} />
      <section className="stat-grid">
        <StatCard icon={<TestTubes />} value="2,847" label="Active samples" trend="+12.4%" />
        <StatCard icon={<FlaskConical />} value="8" label="Active experiments" trend="2 due soon" />
        <StatCard icon={<ClipboardCheck />} value={tasks.filter((task) => !task.done).length} label="Tasks due today" trend="3 high priority" />
        <StatCard icon={<Microscope />} value="5 / 8" label="Equipment available" trend="62% ready" />
      </section>

      <section className="grid-main">
        <div className="card"><div className="card-header"><div><h2>Sample registrations</h2><p>New samples added this week</p></div><Badge tone="success">+18.2%</Badge></div><div className="card-body"><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData.registrations}><defs><linearGradient id="sampleFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f8b8d" stopOpacity={0.28}/><stop offset="95%" stopColor="#0f8b8d" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }}/><Tooltip contentStyle={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--surface)", color: "var(--ink)" }}/><Area type="monotone" dataKey="samples" stroke="#0f8b8d" strokeWidth={2.5} fill="url(#sampleFill)" /></AreaChart></ResponsiveContainer></div></div></div>
        <div className="card"><div className="card-header"><div><h2>Experiment status</h2><p>Current portfolio distribution</p></div></div><div className="card-body"><div className="chart-box" style={{ height: 190 }}><ResponsiveContainer><PieChart><Pie data={chartData.experimentStatus} dataKey="value" innerRadius={52} outerRadius={76} paddingAngle={4}>{chartData.experimentStatus.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}</Pie><Tooltip contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }}/></PieChart></ResponsiveContainer></div><div className="grid-2" style={{ gap: 8, margin: 0 }}>{chartData.experimentStatus.map((item) => <div key={item.name} className="metric-row" style={{ margin: 0 }}><span style={{ display: "flex", alignItems: "center", gap: 6 }}><i style={{ width: 7, height: 7, borderRadius: 9, background: item.fill }} />{item.name}</span><strong>{item.value}</strong></div>)}</div></div></div>
      </section>

      <section className="grid-3">
        <div className="card"><div className="card-header"><div><h2>Equipment usage</h2><p>Utilization over the last 7 days</p></div></div><div className="card-body"><div className="chart-box" style={{ height: 220 }}><ResponsiveContainer><BarChart data={chartData.equipmentUsage}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 9 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 10 }}/><Tooltip cursor={{ fill: "var(--surface-3)" }} contentStyle={{ borderRadius: 10, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--ink)" }}/><Bar dataKey="usage" fill="#3b7f8f" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer></div></div></div>
        <div className="card"><div className="card-header"><div><h2>Today’s tasks</h2><p>{tasks.filter((task) => task.done).length} of {tasks.length} complete</p></div><Link href="/lab-notebook" className="btn btn-ghost btn-sm">View all</Link></div><div className="card-body"><div className="list">{tasks.slice(0, 5).map((task) => <label className="list-item" key={task.id} style={{ cursor: "pointer" }}><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} style={{ accentColor: "var(--primary)" }} /><div className="list-copy"><strong style={task.done ? { textDecoration: "line-through", opacity: .55 } : undefined}>{task.title}</strong><span>{task.due} · {task.assignee}</span></div><Badge tone={task.priority === "High" ? "danger" : task.priority === "Medium" ? "warning" : "neutral"}>{task.priority}</Badge></label>)}</div></div></div>
        <div className="card"><div className="card-header"><div><h2>Alerts</h2><p>Items that need attention</p></div><Badge tone="danger">4 new</Badge></div><div className="card-body"><div className="list">{notifications.slice(0,4).map((item) => <div className="list-item" key={item.id}><div className="list-icon" style={item.severity === "critical" ? { color: "var(--danger)", background: "var(--danger-soft)" } : undefined}>{item.severity === "critical" ? <ThermometerSun /> : <AlertTriangle />}</div><div className="list-copy"><strong>{item.title}</strong><span>{item.detail}</span></div><span className="list-meta">{item.time}</span></div>)}</div></div></div>
      </section>

      <section className="grid-3">
        <div className="card"><div className="card-header"><div><h2>Active experiments</h2><p>Progress across running work</p></div><Link href="/experiments" className="btn btn-ghost btn-sm">Open board</Link></div><div className="card-body">{experiments.filter((item) => item.status === "Running").slice(0,3).map((item) => <div key={item.id} style={{ marginBottom: 16 }}><div className="metric-row"><div><strong>{item.title}</strong><div className="cell-sub">{item.id} · due {item.due}</div></div><span>{item.progress}%</span></div><div className="progress"><span style={{ width: `${item.progress}%` }} /></div></div>)}</div></div>
        <div className="card"><div className="card-header"><div><h2>Upcoming bookings</h2><p>Next reserved instruments</p></div><Link href="/equipment" className="btn btn-ghost btn-sm">Calendar</Link></div><div className="card-body"><div className="list">{bookings.slice(0,4).map((item) => <div className="list-item" key={item.id}><div className="list-icon"><CalendarClock /></div><div className="list-copy"><strong>{item.equipment}</strong><span>{item.purpose} · {item.researcher}</span></div><span className="list-meta">{item.time}</span></div>)}</div></div></div>
        <div className="card"><div className="card-header"><div><h2>Expiring chemicals</h2><p>Inventory attention window</p></div><Badge tone="warning">2 soon</Badge></div><div className="card-body"><div className="list">{chemicals.slice(0,4).map((item) => <div className="list-item" key={item.lot}><div className="list-icon"><PackageOpen /></div><div className="list-copy"><strong>{item.name}</strong><span>Lot {item.lot} · {item.stock}</span></div><StatusBadge status={item.status} /></div>)}</div></div></div>
      </section>

      <div className="card"><div className="card-header"><div><h2>Recent activity</h2><p>Latest changes across your laboratory</p></div></div><div className="card-body"><div className="list">{samples.slice(0,5).map((sample, index) => <div className="list-item" key={sample.id}><div className="list-icon">{index % 2 ? <Beaker /> : <CheckCircle2 />}</div><div className="list-copy"><strong>{sample.name} {index % 2 ? "was updated" : "passed intake review"}</strong><span>{sample.id} · {sample.owner}</span></div><span className="list-meta">{sample.updated}</span></div>)}</div></div></div>
      <Toast show={toast} title="Task updated" description="Your dashboard progress has been refreshed." />
    </div>
  );
}

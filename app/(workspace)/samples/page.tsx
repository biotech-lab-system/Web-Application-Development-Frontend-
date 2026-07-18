"use client";

import { useMemo, useState } from "react";
import { Archive, ChevronLeft, ChevronRight, Eye, Filter, MoreHorizontal, Pencil, Plus, QrCode, Search, TestTubes, Thermometer, XCircle } from "lucide-react";
import { samples as seedSamples } from "@/data/mock";
import type { Sample } from "@/types";
import { Drawer, Modal, PageHeader, StatCard, StatusBadge, Toast } from "@/components/ui";

const pageSize = 6;

export default function SamplesPage() {
  const [items, setItems] = useState(seedSamples);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [page, setPage] = useState(1);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selected, setSelected] = useState<Sample | null>(null);
  const [editing, setEditing] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Sample | null>(null);
  const [toast, setToast] = useState({ show: false, title: "", description: "" });
  const [form, setForm] = useState({ name: "", type: "DNA Extract", owner: "Dr. Kan", location: "", temperature: "-20°C" });
  const [formError, setFormError] = useState(false);

  const filtered = useMemo(() => items.filter((item) => {
    const term = query.toLowerCase();
    return (!term || `${item.id} ${item.name} ${item.owner}`.toLowerCase().includes(term)) && (status === "All" || item.status === status) && (type === "All" || item.type === type);
  }), [items, query, status, type]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const showToast = (title: string, description: string) => { setToast({ show: true, title, description }); window.setTimeout(() => setToast((value) => ({ ...value, show: false })), 2200); };
  const resetFilters = () => { setQuery(""); setStatus("All"); setType("All"); setPage(1); };
  const register = () => {
    if (!form.name.trim() || !form.location.trim()) { setFormError(true); return; }
    const newSample: Sample = { id: `SMP-${240700 + items.length + 1}`, name: form.name, type: form.type, owner: form.owner, collectionDate: "Jul 18, 2026", location: form.location, status: "Stored", updated: "Just now", temperature: form.temperature };
    setItems([newSample, ...items]); setRegisterOpen(false); setFormError(false); setForm({ name: "", type: "DNA Extract", owner: "Dr. Kan", location: "", temperature: "-20°C" }); showToast("Sample registered", `${newSample.id} and its QR label are ready.`);
  };
  const archiveSample = () => {
    if (!archiveTarget) return;
    setItems((all) => all.map((item) => item.id === archiveTarget.id ? { ...item, status: "Archived", updated: "Just now" } : item));
    setArchiveTarget(null); showToast("Sample archived", "The sample remains searchable in Archive.");
  };

  return (
    <div className="page">
      <PageHeader eyebrow="Sample operations" title="Sample management" description="Register, locate, and maintain the complete lifecycle of every biological sample." actions={<><button className="btn btn-secondary" onClick={() => showToast("Labels queued", "4 selected QR labels would be sent to the lab printer.")}><QrCode /> Print labels</button><button className="btn btn-primary" onClick={() => setRegisterOpen(true)}><Plus /> Register sample</button></>} />
      <section className="stat-grid">
        <StatCard icon={<TestTubes />} value={items.filter((item) => item.status !== "Archived").length} label="Active in workspace" trend="+8 this week" />
        <StatCard icon={<Thermometer />} value={items.filter((item) => item.status === "Stored").length} label="Safely stored" trend="All monitored" />
        <StatCard icon={<Filter />} value={items.filter((item) => item.status === "Processing" || item.status === "In Use").length} label="In workflow" trend="3 due today" />
        <StatCard icon={<XCircle />} value={items.filter((item) => item.status === "Quarantined").length} label="Quality holds" trend="Review needed" />
      </section>
      <div className="toolbar">
        <label className="search-field"><Search /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search sample ID, name, or owner…" aria-label="Search samples" /></label>
        <select className="select" style={{ width: 150 }} value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} aria-label="Filter by type"><option>All</option>{Array.from(new Set(items.map((item) => item.type))).map((item) => <option key={item}>{item}</option>)}</select>
        <select className="select" style={{ width: 145 }} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter by status"><option>All</option>{["Stored", "In Use", "Processing", "Quarantined", "Archived"].map((item) => <option key={item}>{item}</option>)}</select>
        {(query || status !== "All" || type !== "All") && <button className="btn btn-ghost" onClick={resetFilters}>Clear filters</button>}
      </div>
      <section className="card">
        <div className="card-header"><div><h2>Sample inventory</h2><p>{filtered.length} records match the current view</p></div><button className="btn btn-ghost btn-sm" onClick={() => showToast("View customized", "Column preferences were saved for this session.")}><MoreHorizontal /> Columns</button></div>
        <div className="table-wrap"><table className="data-table"><thead><tr><th>Sample ID</th><th>Sample name</th><th>Type</th><th>Owner</th><th>Collection date</th><th>Storage location</th><th>Status</th><th>Last updated</th><th>Actions</th></tr></thead><tbody>{visible.map((sample) => <tr key={sample.id}><td><span className="cell-main" style={{ color: "var(--primary)" }}>{sample.id}</span></td><td><div className="cell-main">{sample.name}</div><div className="cell-sub">{sample.temperature}</div></td><td>{sample.type}</td><td>{sample.owner}</td><td>{sample.collectionDate}</td><td><div className="cell-main">{sample.location}</div></td><td><StatusBadge status={sample.status} /></td><td>{sample.updated}</td><td><div className="table-actions"><button className="btn btn-ghost btn-icon" onClick={() => { setSelected(sample); setEditing(false); }} aria-label={`View ${sample.id}`}><Eye /></button><button className="btn btn-ghost btn-icon" onClick={() => { setSelected(sample); setEditing(true); }} aria-label={`Edit ${sample.id}`}><Pencil /></button><button className="btn btn-ghost btn-icon" onClick={() => setArchiveTarget(sample)} aria-label={`Archive ${sample.id}`}><Archive /></button></div></td></tr>)}</tbody></table></div>
        {visible.length === 0 ? <div className="empty-state"><div><div className="empty-visual"><Search /></div><h2>No samples found</h2><p>Try a different search term or clear the current filters.</p><button className="btn btn-secondary" onClick={resetFilters}>Reset filters</button></div></div> : <div className="pagination"><span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div className="pagination-controls"><button className="btn btn-secondary btn-icon" disabled={page === 1} onClick={() => setPage((value) => value - 1)} aria-label="Previous page"><ChevronLeft /></button><button className="btn btn-secondary btn-sm">Page {page} of {totalPages}</button><button className="btn btn-secondary btn-icon" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ChevronRight /></button></div></div>}
      </section>

      <Drawer open={registerOpen} onClose={() => setRegisterOpen(false)} title="Register a new sample" description="Add intake details. A unique Sample ID and QR code will be created automatically." footer={<><button className="btn btn-secondary" onClick={() => setRegisterOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={register}>Register sample</button></>}>
        {formError && <div className="alert alert-danger section-gap"><XCircle /><div><strong>Required details missing</strong><p>Enter a sample name and storage location.</p></div></div>}
        <div className="qr-box section-gap" style={{ minHeight: 150 }}><div><QrCode size={40} color="var(--primary)" /><h3 style={{ margin: "8px 0 0" }}>QR label generated after registration</h3></div></div>
        <div className="form-grid"><div className="field span-2"><label htmlFor="sample-name">Sample name *</label><input id="sample-name" className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. DNA Extract BRCA-12" /></div><div className="field"><label htmlFor="sample-type">Sample type</label><select id="sample-type" className="select" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{["DNA Extract", "RNA Sample", "Human Plasma", "Cell Culture", "Bacterial Culture", "Protein Extract", "Tissue Sample"].map((item) => <option key={item}>{item}</option>)}</select></div><div className="field"><label htmlFor="sample-owner">Owner</label><select id="sample-owner" className="select" value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })}><option>Dr. Kan</option><option>Maya Chen</option><option>Nina Patel</option></select></div><div className="field"><label htmlFor="sample-location">Storage location *</label><input id="sample-location" className="input" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="FZ-01 / Box A2" /></div><div className="field"><label htmlFor="sample-temp">Temperature</label><select id="sample-temp" className="select" value={form.temperature} onChange={(event) => setForm({ ...form, temperature: event.target.value })}><option>-196°C</option><option>-80°C</option><option>-20°C</option><option>4°C</option><option>Room temperature</option></select></div><div className="field span-2"><label htmlFor="sample-note">Intake note</label><textarea id="sample-note" className="textarea" placeholder="Condition, collection protocol, or handling note…" /></div></div>
      </Drawer>

      <Drawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? "Sample detail"} description={selected ? `${selected.id} · collected ${selected.collectionDate}` : undefined} footer={<>{editing ? <><button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel edit</button><button className="btn btn-primary" onClick={() => { setEditing(false); setSelected(null); showToast("Sample updated", "Changes were saved in the mock workspace."); }}>Save changes</button></> : <><button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button><button className="btn btn-primary" onClick={() => setEditing(true)}><Pencil /> Edit sample</button></>}</>}>
        {selected && <><div className="qr-box section-gap"><div><div className="qr-frame"><QrCode size={72} /><i className="qr-corner tl"/><i className="qr-corner tr"/><i className="qr-corner bl"/><i className="qr-corner br"/></div><strong>{selected.id}</strong><p className="cell-sub">Scan to open sample tracking</p></div></div><div className="form-grid"><div className="field"><label>Sample name</label><input className="input" defaultValue={selected.name} disabled={!editing} /></div><div className="field"><label>Type</label><input className="input" defaultValue={selected.type} disabled={!editing} /></div><div className="field"><label>Owner</label><input className="input" defaultValue={selected.owner} disabled={!editing} /></div><div className="field"><label>Storage</label><input className="input" defaultValue={selected.location} disabled={!editing} /></div></div><div className="list section-gap" style={{ marginTop: 20 }}><div className="list-item"><span>Status</span><span style={{ marginLeft: "auto" }}><StatusBadge status={selected.status} /></span></div><div className="list-item"><span>Temperature</span><strong style={{ marginLeft: "auto" }}>{selected.temperature}</strong></div><div className="list-item"><span>Last updated</span><strong style={{ marginLeft: "auto" }}>{selected.updated}</strong></div></div></>}
      </Drawer>

      <Modal open={Boolean(archiveTarget)} onClose={() => setArchiveTarget(null)} title="Archive sample?" description="This removes the sample from active inventory but keeps its full audit history." footer={<><button className="btn btn-secondary" onClick={() => setArchiveTarget(null)}>Cancel</button><button className="btn btn-danger" onClick={archiveSample}>Archive sample</button></>}><div className="alert alert-warning"><Archive /><div><strong>{archiveTarget?.name}</strong><p>{archiveTarget?.id} will move to Archive and can be restored later.</p></div></div></Modal>
      <Toast show={toast.show} title={toast.title} description={toast.description} />
    </div>
  );
}

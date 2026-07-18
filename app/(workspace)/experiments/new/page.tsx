"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, FlaskConical, Info, Plus, Users } from "lucide-react";
import { samples } from "@/data/mock";
import { PageHeader, Toast } from "@/components/ui";

export default function NewExperimentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [protocol, setProtocol] = useState("");
  const [selectedSamples, setSelectedSamples] = useState<string[]>([samples[0].id]);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !protocol) { setError(true); return; }
    setError(false); setSaving(true); setToast(true);
    window.setTimeout(() => router.push("/experiments/EXP-26081"), 1000);
  };
  const toggleSample = (id: string) => setSelectedSamples((all) => all.includes(id) ? all.filter((item) => item !== id) : [...all, id]);
  return (
    <div className="page">
      <PageHeader eyebrow="Create study" title="New experiment" description="Define the scientific plan, samples, ownership, and operational timeline." actions={<button className="btn btn-secondary" onClick={() => router.back()}><ArrowLeft /> Back</button>} />
      <form onSubmit={submit}>
        <div className="grid-main">
          <div className="stack">
            {error && <div className="alert alert-danger"><Info /><div><strong>Complete required fields</strong><p>Add an experiment title and select a protocol before saving.</p></div></div>}
            <section className="card"><div className="card-header"><div><h2>Study details</h2><p>Core information shown across the workspace</p></div><FlaskConical size={19} color="var(--primary)"/></div><div className="card-body"><div className="form-grid"><div className="field span-2"><label htmlFor="experiment-title">Experiment title *</label><input id="experiment-title" className="input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. CRISPR off-target validation" /></div><div className="field"><label htmlFor="experiment-priority">Priority</label><select id="experiment-priority" className="select"><option>Medium</option><option>High</option><option>Low</option></select></div><div className="field"><label htmlFor="experiment-status">Starting status</label><select id="experiment-status" className="select"><option>Draft</option><option>Planning</option></select></div><div className="field span-2"><label htmlFor="objective">Objective</label><textarea id="objective" className="textarea" placeholder="Describe the hypothesis and expected outcome…" /></div></div></div></section>
            <section className="card"><div className="card-header"><div><h2>Protocol & method</h2><p>Choose the approved lab procedure</p></div></div><div className="card-body"><div className="field"><label htmlFor="protocol">Protocol *</label><select id="protocol" className="select" value={protocol} onChange={(event) => setProtocol(event.target.value)}><option value="">Select a protocol…</option><option>CRISPR-Cas9 Validation v3.2</option><option>RNA-seq Library Prep v4</option><option>Western Blot Quantification v2</option><option>Growth Curve Assay</option></select></div><div className="field" style={{ marginTop: 14 }}><label htmlFor="method-note">Method notes</label><textarea id="method-note" className="textarea" placeholder="Add deviations or experiment-specific controls…" /></div></div></section>
            <section className="card"><div className="card-header"><div><h2>Selected samples</h2><p>{selectedSamples.length} samples selected</p></div><button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedSamples(samples.slice(0,3).map((item) => item.id))}><Plus /> Add recommended</button></div><div className="card-body"><div className="list">{samples.slice(0,6).map((sample) => <label className="list-item" key={sample.id} style={{ cursor: "pointer" }}><input type="checkbox" checked={selectedSamples.includes(sample.id)} onChange={() => toggleSample(sample.id)} /><div className="list-copy"><strong>{sample.name}</strong><span>{sample.id} · {sample.location}</span></div><span className="cell-sub">{sample.type}</span></label>)}</div></div></section>
          </div>
          <aside className="stack">
            <section className="card"><div className="card-header"><div><h2>Ownership</h2><p>Research team and reviewer</p></div><Users size={19} color="var(--primary)"/></div><div className="card-body"><div className="field"><label htmlFor="owner">Experiment owner</label><select id="owner" className="select"><option>Dr. Kan</option><option>Maya Chen</option><option>Nina Patel</option></select></div><div className="field" style={{ marginTop: 14 }}><label htmlFor="team">Research team</label><select id="team" className="select" multiple style={{ height: 108 }} defaultValue={["Maya Chen", "Leo Martin"]}><option>Maya Chen</option><option>Leo Martin</option><option>Nina Patel</option><option>Owen Brooks</option></select></div></div></section>
            <section className="card"><div className="card-header"><div><h2>Timeline</h2><p>Planned execution window</p></div><Calendar size={19} color="var(--primary)"/></div><div className="card-body"><div className="field"><label htmlFor="start">Start date</label><input id="start" className="input" type="date" defaultValue="2026-07-20" /></div><div className="field" style={{ marginTop: 14 }}><label htmlFor="due">Target completion</label><input id="due" className="input" type="date" defaultValue="2026-08-03" /></div></div></section>
            <div className="alert alert-info"><Info /><div><strong>Draft-safe workflow</strong><p>You can save now and complete the protocol or sample plan later.</p></div></div>
            <div style={{ display: "flex", gap: 9 }}><button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setToast(true); window.setTimeout(() => setToast(false), 1800); }}>Save draft</button><button className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? "Creating…" : "Create experiment"}</button></div>
          </aside>
        </div>
      </form>
      <Toast show={toast} title={saving ? "Experiment created" : "Draft saved"} description={saving ? "Opening the new experiment workspace…" : "Your local draft is ready to continue."} />
    </div>
  );
}

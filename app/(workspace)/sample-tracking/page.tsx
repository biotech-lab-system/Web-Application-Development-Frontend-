"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Camera, FlaskConical, MapPin, QrCode, RotateCcw, Search, Snowflake, TestTubes } from "lucide-react";
import { experiments, samples } from "@/data/mock";
import type { Sample } from "@/types";
import { EmptyState, PageHeader, StatusBadge, Toast } from "@/components/ui";

export default function SampleTrackingPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Sample | null>(samples[0]);
  const [state, setState] = useState<"success" | "failed" | "empty">("success");
  const [toast, setToast] = useState(false);
  const search = () => {
    const found = samples.find((item) => `${item.id} ${item.name}`.toLowerCase().includes(query.toLowerCase()));
    setResult(found ?? null); setState(found ? "success" : "empty");
  };
  const scan = () => {
    if (state === "failed") { setResult(samples[1]); setState("success"); setToast(true); window.setTimeout(() => setToast(false), 1800); }
    else { setResult(null); setState("failed"); }
  };
  return (
    <div className="page">
      <PageHeader eyebrow="Live traceability" title="Sample tracking" description="Scan or search to see storage, custody, and experimental context in one view." actions={<Link href="/samples" className="btn btn-secondary"><TestTubes /> Open inventory</Link>} />
      <section className="grid-main">
        <div className="card"><div className="card-header"><div><h2>Scan sample label</h2><p>Camera access is simulated in this prototype</p></div><StatusBadge status={state === "failed" ? "Failed" : "Available"} /></div><div className="card-body"><div className="qr-box"><div><div className="qr-frame"><Camera size={52} /><i className="qr-corner tl"/><i className="qr-corner tr"/><i className="qr-corner bl"/><i className="qr-corner br"/></div><h3>{state === "failed" ? "QR code could not be read" : "Position a sample label in the frame"}</h3><p className="cell-sub">No real camera access is requested</p><button className={`btn ${state === "failed" ? "btn-secondary" : "btn-primary"}`} onClick={scan}>{state === "failed" ? <><RotateCcw /> Try again</> : <><QrCode /> Simulate scan</>}</button></div></div>{state === "failed" && <div className="alert alert-danger" style={{ marginTop: 14 }}><AlertTriangle /><div><strong>Scan failed</strong><p>The label may be damaged. Search by Sample ID or name instead.</p></div></div>}</div></div>
        <div className="stack">
          <div className="card"><div className="card-header"><div><h2>Find a sample</h2><p>Search by ID or sample name</p></div></div><div className="card-body"><div className="field"><label htmlFor="tracking-search">Sample ID or name</label><div style={{ display: "flex", gap: 8 }}><input id="tracking-search" className="input" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && search()} placeholder="SMP-240702 or DNA Extract" /><button className="btn btn-primary" onClick={search} aria-label="Search"><Search /></button></div></div></div></div>
          <div className="card"><div className="card-header"><div><h2>Recent scans</h2><p>Your last accessed labels</p></div></div><div className="card-body"><div className="list">{samples.slice(0,4).map((item) => <button className="list-item" key={item.id} style={{ borderLeft: 0, borderRight: 0, borderTop: 0, background: "transparent", textAlign: "left", cursor: "pointer" }} onClick={() => { setResult(item); setState("success"); }}><div className="list-icon"><QrCode /></div><div className="list-copy"><strong>{item.name}</strong><span>{item.id} · {item.location}</span></div><ArrowRight size={15} /></button>)}</div></div></div>
        </div>
      </section>

      {state === "empty" ? <div className="card"><EmptyState title="No matching sample" description={`We could not find “${query}”. Check the ID or try part of the sample name.`} action={<button className="btn btn-secondary" onClick={() => { setQuery(""); setResult(samples[0]); setState("success"); }}>Clear search</button>} /></div> : result && <>
        <section className="card section-gap"><div className="card-header"><div><p className="eyebrow">Located sample</p><h2 style={{ fontSize: 21 }}>{result.name}</h2><p>{result.id} · {result.type}</p></div><StatusBadge status={result.status} /></div><div className="card-body"><div className="grid-3" style={{ margin: 0 }}><div className="list-item"><div className="list-icon"><MapPin /></div><div className="list-copy"><span>Current location</span><strong>{result.location}</strong></div></div><div className="list-item"><div className="list-icon"><Snowflake /></div><div className="list-copy"><span>Storage condition</span><strong>{result.temperature}</strong></div></div><div className="list-item"><div className="list-icon"><FlaskConical /></div><div className="list-copy"><span>Custodian</span><strong>{result.owner}</strong></div></div></div></div></section>
        <section className="grid-3">
          <div className="card"><div className="card-header"><div><h2>Storage location</h2><p>FZ-02 freezer map</p></div><MapPin size={18} color="var(--primary)" /></div><div className="card-body"><div className="storage-map"><strong>Rack overview · Level 3</strong><div className="freezer">{Array.from({ length: 12 }, (_, index) => <div className={`rack ${index === 6 ? "active" : ""}`} key={index}>{index === 6 ? "A3-07" : `A${Math.floor(index / 4) + 1}-${(index % 4) + 1}`}</div>)}</div></div></div></div>
          <div className="card"><div className="card-header"><div><h2>Movement timeline</h2><p>Chain of custody</p></div></div><div className="card-body"><div className="timeline"><div className="timeline-item"><strong>Moved to {result.location}</strong><span>Today, 09:42 · Dr. Kan</span></div><div className="timeline-item"><strong>Checked out for experiment</strong><span>Yesterday, 14:20 · Maya Chen</span></div><div className="timeline-item"><strong>Quality control passed</strong><span>Jul 16, 11:08 · Nina Patel</span></div><div className="timeline-item"><strong>Sample registered</strong><span>{result.collectionDate} · {result.owner}</span></div></div></div></div>
          <div className="card"><div className="card-header"><div><h2>Related experiments</h2><p>Work that uses this sample type</p></div></div><div className="card-body"><div className="list">{experiments.slice(0,3).map((item) => <Link href={`/experiments/${item.id}`} className="list-item" key={item.id}><div className="list-icon"><FlaskConical /></div><div className="list-copy"><strong>{item.title}</strong><span>{item.id} · {item.progress}% complete</span></div><StatusBadge status={item.status} /></Link>)}</div></div></div>
        </section>
      </>}
      <Toast show={toast} title="Scan successful" description="SMP-240702 was found and loaded." />
    </div>
  );
}

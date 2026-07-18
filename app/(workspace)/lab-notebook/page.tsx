"use client";

import { useEffect, useMemo, useState } from "react";
import { AlignLeft, Bold, Check, Clock3, CloudOff, FileImage, FilePlus2, History, Italic, List, Pin, Redo2, Save, Search, Underline, Undo2 } from "lucide-react";
import { labNotes } from "@/data/mock";
import { Drawer, Modal, PageHeader, StatusBadge, Toast } from "@/components/ui";

export default function LabNotebookPage() {
  const [tab, setTab] = useState("Recent");
  const [selectedId, setSelectedId] = useState(labNotes[0].id);
  const [title, setTitle] = useState(labNotes[0].title);
  const [objective, setObjective] = useState("Validate editing efficiency for guide RNA candidates A and B against the TP53 target locus.");
  const [observation, setObservation] = useState("Replicate B showed improved cell morphology after media replacement. No contamination observed.");
  const [autosave, setAutosave] = useState("All changes saved");
  const [offline, setOffline] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, title: "", description: "" });
  const currentNotes = useMemo(() => labNotes.filter((note) => tab === "Recent" || note.state === tab), [tab]);
  useEffect(() => {
    const timer = window.setTimeout(() => setAutosave(offline ? "Saved offline" : "All changes saved"), 850);
    return () => window.clearTimeout(timer);
  }, [title, objective, observation, offline]);
  const updateTitle = (value: string) => { setTitle(value); setAutosave(offline ? "Saved locally · waiting to sync" : "Saving…"); };
  const updateObjective = (value: string) => { setObjective(value); setAutosave(offline ? "Saved locally · waiting to sync" : "Saving…"); };
  const updateObservation = (value: string) => { setObservation(value); setAutosave(offline ? "Saved locally · waiting to sync" : "Saving…"); };
  const notify = (titleValue: string, description: string) => { setToast({ show: true, title: titleValue, description }); window.setTimeout(() => setToast((value) => ({ ...value, show: false })), 2000); };
  const selectNote = (id: string) => { const note = labNotes.find((item) => item.id === id); if (!note) return; setSelectedId(id); setTitle(note.title); setObservation(note.preview); };
  return (
    <div className="page">
      <PageHeader eyebrow="Electronic lab record" title="Lab notebook" description="Capture observations with autosave, version history, and experimental context." actions={<><button className={`btn ${offline ? "btn-danger" : "btn-secondary"}`} onClick={() => setOffline(!offline)}><CloudOff /> {offline ? "Offline demo" : "Go offline"}</button><button className="btn btn-primary" onClick={() => notify("New note created", "A clean draft is ready in your notebook.")}><FilePlus2 /> New note</button></>} />
      {offline && <div className="alert alert-warning section-gap"><CloudOff /><div><strong>You are working offline</strong><p>Changes are stored in this session and will sync when the connection returns.</p></div></div>}
      <section className="card notebook-layout">
        <aside className="notebook-side"><div className="note-search"><label className="search-field" style={{ minWidth: 0 }}><Search /><input placeholder="Search notes…" aria-label="Search notes" /></label></div><div className="note-tabs">{["Recent", "Draft", "Pinned", "Archived"].map((item) => <button key={item} className={`note-tab ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>{item}</button>)}</div>{currentNotes.map((note) => <button key={note.id} className={`note-item ${selectedId === note.id ? "active" : ""}`} onClick={() => selectNote(note.id)} style={{ width: "100%", textAlign: "left", borderRight: 0, borderBottom: 0, background: selectedId === note.id ? undefined : "transparent" }}><div style={{ display: "flex", alignItems: "center", gap: 5 }}>{note.state === "Pinned" && <Pin size={12} color="var(--primary)"/>}<h3>{note.title}</h3></div><p>{note.experiment}</p><p style={{ marginTop: 5 }}>{note.updated}</p></button>)}</aside>
        <div className="editor">
          <div className="editor-head"><input className="editor-title" value={title} onChange={(event) => updateTitle(event.target.value)} aria-label="Note title" /><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}><span className="autosave">{autosave.includes("Saving") ? <Clock3 size={13}/> : offline ? <CloudOff size={13}/> : <Check size={13}/>} {autosave}</span><div style={{ display: "flex", gap: 7 }}><StatusBadge status="Draft"/><button className="btn btn-ghost btn-sm" onClick={() => setHistoryOpen(true)}><History /> Versions</button></div></div></div>
          <div className="editor-toolbar" aria-label="Rich text toolbar placeholder">{[Bold, Italic, Underline, AlignLeft, List, Undo2, Redo2].map((Icon, index) => <button className="tool-btn" key={index} onClick={() => notify("Formatting applied", "Toolbar behavior is simulated for this prototype.")} aria-label={`Formatting tool ${index + 1}`}><Icon size={16}/></button>)}<span style={{ width: 1, background: "var(--line)", margin: "3px 5px" }}/><button className="btn btn-ghost btn-sm" onClick={() => notify("Image attached", "microscopy-day4.png was added as a placeholder.")}><FileImage /> Image</button><button className="btn btn-ghost btn-sm" onClick={() => notify("File attached", "results-replicate-b.csv was added as a placeholder.")}><FilePlus2 /> File</button></div>
          <div className="editor-body">
            <div className="editor-section"><label htmlFor="note-objective">Objective</label><textarea id="note-objective" value={objective} onChange={(event) => updateObjective(event.target.value)} /></div>
            <div className="editor-section"><label htmlFor="note-method">Method</label><textarea id="note-method" defaultValue="Prepared Cas9 RNP complexes using CRISPR-Cas9 Validation v3.2. Transfected HEK293 cells at 75% confluency and incubated for 48 hours." /></div>
            <div className="editor-section"><label htmlFor="note-observation">Observation</label><textarea id="note-observation" value={observation} onChange={(event) => updateObservation(event.target.value)} /></div>
            <div className="editor-section"><label htmlFor="note-results">Results</label><textarea id="note-results" defaultValue="Guide A: 58% editing efficiency. Guide B: 71% editing efficiency. Cell viability remained above 89% in both conditions." /></div>
            <div className="editor-section"><label htmlFor="note-conclusion">Conclusion</label><textarea id="note-conclusion" defaultValue="Guide B meets the primary efficiency endpoint and will proceed to off-target validation." /></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}><button className="btn btn-secondary" onClick={() => notify("Image placeholder added", "A new evidence block was appended.")}><FileImage /> Attach image</button><button className="btn btn-secondary" onClick={() => notify("File placeholder added", "A file reference was appended.")}><FilePlus2 /> Attach file</button><button className="btn btn-primary" onClick={() => notify("Note saved", "Version 8 is now the current draft.")}><Save /> Save now</button></div>
          </div>
        </div>
      </section>
      <Drawer open={historyOpen} onClose={() => setHistoryOpen(false)} title="Version history" description="Review and restore earlier notebook states.">
        <div className="timeline">{["Version 7 · Current", "Version 6", "Version 5", "Version 4"].map((version, index) => <div className="timeline-item" key={version}><div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><div><strong>{version}</strong><span>{index === 0 ? "Today, 10:42" : `Jul ${18 - index}, ${10 + index}:20`} · Dr. Kan</span></div>{index > 0 && <button className="btn btn-secondary btn-sm" onClick={() => setRestoreOpen(true)}>Restore</button>}</div><p className="cell-sub" style={{ marginTop: 6 }}>{index === 0 ? "Updated observation and conclusion." : "Autosaved experiment note content."}</p></div>)}</div>
      </Drawer>
      <Modal open={restoreOpen} onClose={() => setRestoreOpen(false)} title="Restore this version?" description="The current content will be preserved as a new version before restoring." footer={<><button className="btn btn-secondary" onClick={() => setRestoreOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { setRestoreOpen(false); setHistoryOpen(false); notify("Version restored", "Version 6 is now active; the previous content was preserved."); }}>Restore version</button></>}><div className="alert alert-info"><History /><div><strong>No work will be lost</strong><p>Restoring creates a new entry in version history.</p></div></div></Modal>
      <Toast show={toast.show} title={toast.title} description={toast.description}/>
    </div>
  );
}

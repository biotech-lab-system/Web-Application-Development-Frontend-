"use client";

import { useState } from "react";
import { AlertTriangle, BarChart3, Bot, LoaderCircle, MessageSquarePlus, Paperclip, Send, Sparkles, UserRound } from "lucide-react";
import { experiments } from "@/data/mock";
import { Badge, Modal, PageHeader, Toast } from "@/components/ui";

type Message = { role: "user" | "assistant"; text: string };

const quickActions = ["Analyze Result", "Summarize Experiment", "Find Anomalies", "Compare Experiments", "Suggest Next Steps", "Generate Conclusion"];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", text: "Analyze the editing efficiency from today’s CRISPR validation and flag anything unusual." },
    { role: "assistant", text: "Replicate B reached 71% editing efficiency, which is 13 percentage points above Replicate A. Cell viability remained stable, but the variance in control C3 is higher than expected. I recommend reviewing the raw C3 read counts before concluding." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const send = (text = input) => {
    if (!text.trim() || loading) return;
    setMessages((all) => [...all, { role: "user", text }]); setInput(""); setLoading(true); setFailed(false);
    window.setTimeout(() => {
      setLoading(false);
      setMessages((all) => [...all, { role: "assistant", text: "The selected dataset supports the current hypothesis. Replicate B remains the strongest candidate, with acceptable viability and consistent signal across two technical repeats. Review the C3 control and run one confirmatory replicate before final reporting." }]);
    }, 1000);
  };
  return (
    <div className="page">
      <PageHeader eyebrow="Scientific decision support" title="AI laboratory assistant" description="Explore results and next steps with contextual, explainable mock analysis." actions={<><button className="btn btn-secondary" onClick={() => setFailed(!failed)}><AlertTriangle /> Demo failure</button><button className="btn btn-primary" onClick={() => { setMessages([]); setFailed(false); }}><MessageSquarePlus /> New analysis</button></>} />
      <section className="card chat-layout">
        <aside className="chat-side"><button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setMessages([])}><MessageSquarePlus /> New analysis</button><p className="eyebrow" style={{ marginTop: 22 }}>Conversations</p>{["CRISPR efficiency review", "Protein assay summary", "RNA QC anomalies", "Compare viability runs"].map((item, index) => <button key={item} className={`conversation ${index === 0 ? "active" : ""}`} style={{ width: "100%", border: 0, textAlign: "left" }} onClick={() => setToast(true)}><strong>{item}</strong><span>{index === 0 ? "Active now" : `${index + 1} days ago`}</span></button>)}</aside>
        <div className="chat-main">
          <header className="chat-head"><div><strong>CRISPR efficiency review</strong><div className="cell-sub">Context-aware analysis · mock mode</div></div><select className="select" style={{ width: 230 }} aria-label="Select experiment">{experiments.slice(0,6).map((item) => <option key={item.id}>{item.title}</option>)}</select></header>
          <div className="messages">
            {messages.length === 0 && <div className="empty-state"><div><div className="empty-visual"><Sparkles /></div><h2>What would you like to investigate?</h2><p>Select an experiment or start with one of these suggestions.</p><div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>{quickActions.slice(0,3).map((item) => <button className="btn btn-secondary btn-sm" key={item} onClick={() => send(item)}>{item}</button>)}</div></div></div>}
            {messages.map((message, index) => <div className={`message ${message.role === "user" ? "user" : ""}`} key={index}><div className="message-avatar">{message.role === "user" ? <UserRound size={16}/> : <Bot size={17}/>}</div><div className="message-bubble"><p>{message.text}</p>{message.role === "assistant" && <div className="cell-sub">Mock analysis · generated just now</div>}</div></div>)}
            {loading && <div className="message"><div className="message-avatar"><Bot size={17}/></div><div className="message-bubble"><div style={{ display: "flex", gap: 8, alignItems: "center" }}><LoaderCircle className="spin" size={16}/> Reviewing experiment context and attached data…</div></div></div>}
            {failed && <div className="alert alert-danger"><AlertTriangle /><div><strong>AI analysis could not be completed</strong><p>The mock service could not interpret one of the selected columns. You can retry or enter results manually.</p><div style={{ display: "flex", gap: 8, marginTop: 9 }}><button className="btn btn-secondary btn-sm" onClick={() => { setFailed(false); send("Retry the previous analysis"); }}>Retry</button><button className="btn btn-secondary btn-sm" onClick={() => setManualOpen(true)}>Enter result manually</button></div></div></div>}
          </div>
          <footer className="chat-compose"><div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 8 }}>{quickActions.map((item) => <button className="btn btn-ghost btn-sm" key={item} onClick={() => setInput(item)}>{item}</button>)}</div><div className="compose-box"><button className="btn btn-ghost btn-icon" onClick={() => { setToast(true); window.setTimeout(() => setToast(false), 1900); }} aria-label="Attach data"><Paperclip /></button><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Ask about results, anomalies, or next steps…" aria-label="Message" /><button className="btn btn-primary btn-icon" onClick={() => send()} disabled={!input.trim() || loading} aria-label="Send"><Send /></button></div><p className="cell-sub" style={{ textAlign: "center", margin: "7px 0 0" }}>AI can make mistakes. Verify scientific conclusions against source data and approved protocols.</p></footer>
        </div>
        <aside className="analysis-panel"><p className="eyebrow">Analysis snapshot</p><h2>CRISPR validation</h2><p className="cell-sub">Based on 3 replicates and 2 controls</p><div className="metric-row" style={{ marginTop: 20 }}><span>Confidence level</span><Badge tone="success">87% · High</Badge></div><div className="progress"><span style={{ width: "87%" }}/></div><h3 style={{ marginTop: 22 }}>Key findings</h3><div className="finding"><strong>Guide B leads performance</strong><p>71% editing efficiency with viability above 89%.</p></div><div className="finding"><strong>Controls mostly consistent</strong><p>Two of three controls fall inside the expected range.</p></div><h3 style={{ marginTop: 20 }}>Possible anomalies</h3><div className="finding" style={{ borderLeft: "3px solid var(--warning)" }}><strong>Control C3 variance</strong><p>18% higher dispersion than the other controls.</p></div><h3 style={{ marginTop: 20 }}>Recommended next steps</h3><div className="timeline"><div className="timeline-item"><strong>Review raw C3 reads</strong><span>Before final interpretation</span></div><div className="timeline-item"><strong>Run confirmatory replicate</strong><span>Guide B, same conditions</span></div><div className="timeline-item"><strong>Proceed to off-target panel</strong><span>If replicate confirms ≥65%</span></div></div><div className="alert alert-info"><BarChart3 /><div><strong>Decision support only</strong><p>This output is simulated and is not a validated scientific conclusion.</p></div></div></aside>
      </section>
      <Modal open={manualOpen} onClose={() => setManualOpen(false)} title="Enter result manually" description="Record a human-reviewed conclusion when automated analysis is unavailable." footer={<><button className="btn btn-secondary" onClick={() => setManualOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { setManualOpen(false); setFailed(false); setToast(true); }}>Save manual result</button></>}><div className="form-grid"><div className="field"><label htmlFor="manual-efficiency">Editing efficiency</label><input id="manual-efficiency" className="input" defaultValue="71%" /></div><div className="field"><label htmlFor="manual-confidence">Confidence</label><select id="manual-confidence" className="select"><option>High</option><option>Medium</option><option>Low</option></select></div><div className="field span-2"><label htmlFor="manual-conclusion">Reviewed conclusion</label><textarea id="manual-conclusion" className="textarea" placeholder="Enter the researcher-reviewed result…" /></div></div></Modal>
      <Toast show={toast} title="Action completed" description="The mock workspace was updated for this session." />
    </div>
  );
}

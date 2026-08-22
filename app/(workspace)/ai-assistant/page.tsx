"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Bot, FileUp, LoaderCircle, MessageSquarePlus, Paperclip, Send, Sparkles, Trash2, UserRound, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge, PageHeader } from "@/components/ui";
import { apiRequest, errorMessage } from "@/lib/api";

type Analysis = { answer: string; confidence: number; key_findings: string[]; anomalies: string[]; next_steps: string[]; disclaimer: string };
type Attachment = { id: string; name: string; mime_type: string; size_bytes: number };
type Message = { id: number; role: "user" | "assistant"; content: string; analysis?: Analysis | null; model?: string | null; attachments: Attachment[]; created_at: string };
type Conversation = { id: string; title: string; experiment_id: string | null; experiment_title: string | null; message_count: number; messages?: Message[]; updated_at: string };
type Experiment = { id: string; title: string };
type AiConfig = { configured: boolean; model: string; max_files_per_message: number; max_file_bytes: number };
type ConversationList = { items: Conversation[] };
type Paginated<T> = { items: T[] };
type SendResponse = { conversation: Conversation; user_message: Message; assistant_message: Message };

const quickActions = ["Analyze results", "Summarize experiment", "Find anomalies", "Compare evidence", "Suggest next steps", "Generate conclusion"];
const acceptedFiles = ".pdf,.csv,.xlsx,.png,.jpg,.jpeg,.webp";

export default function AiAssistantPage() {
  const { session } = useAuth();
  const token = session?.accessToken;
  const fileInput = useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [current, setCurrent] = useState<Conversation | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState("");
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const refreshConversations = useCallback(async () => {
    if (!token) return [];
    const response = await apiRequest<ConversationList>("/ai/conversations", {}, token);
    setConversations(response.items);
    return response.items;
  }, [token]);

  const openConversation = useCallback(async (id: string) => {
    if (!token) return;
    setError("");
    const response = await apiRequest<Conversation>(`/ai/conversations/${id}`, {}, token);
    setCurrent(response);
    setSelectedExperiment(response.experiment_id || "");
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void Promise.all([
      apiRequest<AiConfig>("/ai/config", {}, token),
      apiRequest<Paginated<Experiment>>("/experiments?limit=100", {}, token),
      apiRequest<ConversationList>("/ai/conversations", {}, token),
    ]).then(async ([nextConfig, experimentPage, conversationPage]) => {
      if (cancelled) return;
      setConfig(nextConfig);
      setExperiments(experimentPage.items);
      setConversations(conversationPage.items);
      if (conversationPage.items[0]) await openConversation(conversationPage.items[0].id);
    }).catch((requestError) => !cancelled && setError(errorMessage(requestError))).finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [openConversation, token]);

  const newConversation = async () => {
    if (!token) return null;
    setError("");
    const response = await apiRequest<Conversation>("/ai/conversations", {
      method: "POST",
      body: JSON.stringify({ experiment_id: selectedExperiment || null }),
    }, token);
    setCurrent(response);
    await refreshConversations();
    return response;
  };

  const changeExperiment = async (experimentId: string) => {
    setSelectedExperiment(experimentId);
    if (!token || !current) return;
    try {
      const updated = await apiRequest<Conversation>(`/ai/conversations/${current.id}`, {
        method: "PATCH",
        body: JSON.stringify({ experiment_id: experimentId || null }),
      }, token);
      setCurrent(updated);
      await refreshConversations();
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const chooseFiles = (selected: FileList | null) => {
    if (!selected) return;
    const next = Array.from(selected).slice(0, config?.max_files_per_message || 3);
    const tooLarge = next.find((item) => item.size > (config?.max_file_bytes || 8 * 1024 * 1024));
    if (tooLarge) {
      setError(`${tooLarge.name} exceeds the 8 MB attachment limit.`);
      return;
    }
    setError("");
    setFiles(next);
  };

  const send = async (text = input) => {
    if (!token || !text.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const conversation = current || await newConversation();
      if (!conversation) return;
      const form = new FormData();
      form.append("message", text.trim());
      files.forEach((file) => form.append("files", file));
      const response = await apiRequest<SendResponse>(`/ai/conversations/${conversation.id}/messages`, { method: "POST", body: form }, token);
      setCurrent((previous) => ({ ...response.conversation, messages: [...(previous?.id === conversation.id ? previous.messages || [] : []), response.user_message, response.assistant_message] }));
      setInput("");
      setFiles([]);
      if (fileInput.current) fileInput.current.value = "";
      await refreshConversations();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSending(false);
    }
  };

  const removeCurrent = async () => {
    if (!token || !current) return;
    try {
      await apiRequest(`/ai/conversations/${current.id}`, { method: "DELETE" }, token);
      const remaining = await refreshConversations();
      if (remaining[0]) await openConversation(remaining[0].id);
      else setCurrent(null);
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const messages = current?.messages || [];
  const latestAnalysis = [...messages].reverse().find((item) => item.role === "assistant" && item.analysis)?.analysis;

  return (
    <div className="page">
      <PageHeader eyebrow="Scientific decision support" title="AI laboratory assistant" description="Analyze laboratory records and attached evidence with Gemini while keeping every conclusion reviewable." actions={<button className="btn btn-primary" onClick={() => void newConversation()}><MessageSquarePlus /> New analysis</button>} />
      {error && <div className="alert alert-danger section-gap" role="alert"><AlertTriangle /><div><strong>AI request could not be completed</strong><p>{error}</p></div></div>}
      {!loading && config && !config.configured && <div className="alert alert-warning section-gap"><AlertTriangle /><div><strong>Gemini is not configured</strong><p>Add GEMINI_API_KEY to the API environment and restart the API service.</p></div></div>}
      <section className="card chat-layout">
        <aside className="chat-side"><button className="btn btn-primary" style={{ width: "100%" }} onClick={() => void newConversation()}><MessageSquarePlus /> New analysis</button><p className="eyebrow" style={{ marginTop: 22 }}>Conversations</p>{conversations.length === 0 && <p className="cell-sub">No saved analyses yet.</p>}{conversations.map((item) => <button key={item.id} className={`conversation ${current?.id === item.id ? "active" : ""}`} style={{ width: "100%", border: 0, textAlign: "left" }} onClick={() => void openConversation(item.id)}><strong>{item.title}</strong><span>{item.experiment_title || "General lab context"} · {item.message_count} messages</span></button>)}</aside>
        <div className="chat-main">
          <header className="chat-head"><div><strong>{current?.title || "New laboratory analysis"}</strong><div className="cell-sub">{config?.model || "Gemini"} · responses follow your language</div></div><div style={{ display: "flex", gap: 6 }}><select className="select" style={{ width: 230 }} aria-label="Select experiment" value={selectedExperiment} onChange={(event) => void changeExperiment(event.target.value)}><option value="">No experiment selected</option>{experiments.map((item) => <option value={item.id} key={item.id}>{item.id} · {item.title}</option>)}</select>{current && <button className="btn btn-ghost btn-icon" onClick={() => void removeCurrent()} aria-label="Delete conversation"><Trash2 /></button>}</div></header>
          <div className="messages">
            {loading && <div className="empty-state"><div><LoaderCircle className="spin" /><p>Loading saved analyses…</p></div></div>}
            {!loading && messages.length === 0 && <div className="empty-state"><div><div className="empty-visual"><Sparkles /></div><h2>What would you like to investigate?</h2><p>Select an experiment, attach evidence, or start with a suggestion.</p><div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>{quickActions.slice(0, 3).map((item) => <button className="btn btn-secondary btn-sm" key={item} onClick={() => setInput(item)}>{item}</button>)}</div></div></div>}
            {messages.map((message) => <div className={`message ${message.role === "user" ? "user" : ""}`} key={message.id}><div className="message-avatar">{message.role === "user" ? <UserRound size={16} /> : <Bot size={17} />}</div><div className="message-bubble"><p>{message.content}</p>{message.attachments.length > 0 && <div className="attachment-list">{message.attachments.map((item) => <span className="attachment-chip" key={item.id}><FileUp /> {item.name}</span>)}</div>}{message.role === "assistant" && <div className="cell-sub">{message.model} · verify against source data</div>}</div></div>)}
            {sending && <div className="message"><div className="message-avatar"><Bot size={17} /></div><div className="message-bubble"><div style={{ display: "flex", gap: 8, alignItems: "center" }}><LoaderCircle className="spin" size={16} /> Reviewing experiment context and attached evidence…</div></div></div>}
          </div>
          <footer className="chat-compose"><div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 8 }}>{quickActions.map((item) => <button className="btn btn-ghost btn-sm" key={item} onClick={() => setInput(item)}>{item}</button>)}</div>{files.length > 0 && <div className="attachment-list compose-attachments">{files.map((file) => <span className="attachment-chip" key={`${file.name}-${file.size}`}><Paperclip /> {file.name}<button onClick={() => setFiles((items) => items.filter((item) => item !== file))} aria-label={`Remove ${file.name}`}><X /></button></span>)}</div>}<div className="compose-box"><input ref={fileInput} className="sr-only" type="file" accept={acceptedFiles} multiple onChange={(event) => chooseFiles(event.target.files)} /><button className="btn btn-ghost btn-icon" onClick={() => fileInput.current?.click()} aria-label="Attach data"><Paperclip /></button><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Ask about results, anomalies, or next steps…" aria-label="Message" /><button className="btn btn-primary btn-icon" onClick={() => void send()} disabled={!input.trim() || sending || !config?.configured} aria-label="Send"><Send /></button></div><p className="cell-sub" style={{ textAlign: "center", margin: "7px 0 0" }}>PDF, CSV, XLSX, PNG, JPG or WebP · AI can make mistakes; verify scientific conclusions.</p></footer>
        </div>
        <aside className="analysis-panel"><p className="eyebrow">Analysis snapshot</p><h2>{current?.experiment_title || "Select an experiment"}</h2>{!latestAnalysis && <p className="cell-sub">Structured findings will appear after Gemini completes an analysis.</p>}{latestAnalysis && <><div className="metric-row" style={{ marginTop: 20 }}><span>Confidence level</span><Badge tone={latestAnalysis.confidence >= 75 ? "success" : latestAnalysis.confidence >= 50 ? "warning" : "danger"}>{latestAnalysis.confidence}%</Badge></div><div className="progress"><span style={{ width: `${latestAnalysis.confidence}%` }} /></div><h3 style={{ marginTop: 22 }}>Key findings</h3>{latestAnalysis.key_findings.map((item) => <div className="finding" key={item}><p>{item}</p></div>)}<h3 style={{ marginTop: 20 }}>Possible anomalies</h3>{latestAnalysis.anomalies.length ? latestAnalysis.anomalies.map((item) => <div className="finding" style={{ borderLeft: "3px solid var(--warning)" }} key={item}><p>{item}</p></div>) : <p className="cell-sub">No anomaly was identified from the supplied evidence.</p>}<h3 style={{ marginTop: 20 }}>Recommended next steps</h3><div className="timeline">{latestAnalysis.next_steps.map((item) => <div className="timeline-item" key={item}><strong>{item}</strong></div>)}</div><div className="alert alert-info"><Sparkles /><div><strong>Decision support only</strong><p>{latestAnalysis.disclaimer}</p></div></div></>}</aside>
      </section>
    </div>
  );
}

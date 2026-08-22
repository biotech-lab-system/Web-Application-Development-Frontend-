"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Download, FileCheck2, FileSpreadsheet, FileText, LoaderCircle, Plus, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge, PageHeader, StatCard, StatusBadge, Toast } from "@/components/ui";
import { apiDownload, apiRequest, errorMessage } from "@/lib/api";

type Experiment = { id: string; title: string; status: string; priority: string; objective?: string | null; protocol?: string | null };
type Sample = { id: string; name: string; type: string; status: string; location: string; temperature: string };
type ReportType = "experiment_summary" | "sample_inventory" | "quality_control";
type ReportFormat = "pdf" | "xlsx";
type Report = { id: string; title: string; report_type: ReportType; format: ReportFormat; language: "th" | "en"; experiment_id: string | null; sample_ids: string[]; status: "Generating" | "Completed" | "Failed"; ai_status: string | null; error_message: string | null; created_at: string };
type Paginated<T> = { items: T[]; total: number };

const reportTemplates: Array<{ type: ReportType; title: string; copy: string; icon: typeof FileText }> = [
  { type: "experiment_summary", title: "Experiment summary", copy: "Objectives, methods, samples, notes, and conclusions", icon: FileText },
  { type: "sample_inventory", title: "Sample inventory", copy: "Status, locations, conditions, and custody data", icon: FileSpreadsheet },
  { type: "quality_control", title: "Quality control", copy: "Record completeness and workflow exceptions", icon: BarChart3 },
];

const reportTypeName = (value: ReportType) => reportTemplates.find((item) => item.type === value)?.title || value;

export default function ReportsPage() {
  const { session } = useAuth();
  const token = session?.accessToken;
  const [state, setState] = useState<"idle" | "loading" | "generating" | "completed" | "failed">("loading");
  const [reportType, setReportType] = useState<ReportType>("experiment_summary");
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [language, setLanguage] = useState<"th" | "en">("en");
  const [includeAi, setIncludeAi] = useState(true);
  const [experimentId, setExperimentId] = useState("");
  const [sampleIds, setSampleIds] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ show: false, title: "", description: "" });

  const refreshReports = useCallback(async () => {
    if (!token) return;
    const response = await apiRequest<Paginated<Report>>("/reports?limit=100", {}, token);
    setReports(response.items);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    void Promise.all([
      apiRequest<Paginated<Experiment>>("/experiments?limit=100", {}, token),
      apiRequest<Paginated<Sample>>("/samples?limit=100", {}, token),
      apiRequest<Paginated<Report>>("/reports?limit=100", {}, token),
    ]).then(([experimentPage, samplePage, reportPage]) => {
      if (cancelled) return;
      setExperiments(experimentPage.items);
      setSamples(samplePage.items);
      setReports(reportPage.items);
      if (experimentPage.items[0]) setExperimentId(experimentPage.items[0].id);
      setSampleIds(samplePage.items.slice(0, 2).map((item) => item.id));
      setState("idle");
    }).catch((requestError) => {
      if (!cancelled) { setError(errorMessage(requestError)); setState("failed"); }
    });
    return () => { cancelled = true; };
  }, [token]);

  const download = async (report: Report) => {
    if (!token) return;
    try {
      const filename = await apiDownload(`/reports/${report.id}/download`, token);
      setToast({ show: true, title: "File downloaded", description: filename });
      window.setTimeout(() => setToast((current) => ({ ...current, show: false })), 2200);
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const generate = async () => {
    if (!token) return;
    if (reportType === "experiment_summary" && !experimentId) {
      setError("Select an experiment for the experiment summary.");
      return;
    }
    setState("generating");
    setError("");
    try {
      const report = await apiRequest<Report>("/reports", {
        method: "POST",
        body: JSON.stringify({
          report_type: reportType,
          format,
          language,
          experiment_id: experimentId || null,
          sample_ids: sampleIds,
          date_from: dateFrom || null,
          date_to: dateTo || null,
          include_ai: includeAi,
        }),
      }, token);
      setState("completed");
      await refreshReports();
      await download(report);
      if (report.ai_status === "Failed") setError(`The file was generated without an AI summary: ${report.error_message || "Gemini was unavailable."}`);
    } catch (requestError) {
      setState("failed");
      setError(errorMessage(requestError));
    }
  };

  const removeReport = async (report: Report) => {
    if (!token) return;
    try {
      await apiRequest(`/reports/${report.id}`, { method: "DELETE" }, token);
      await refreshReports();
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  };

  const selectedExperiment = experiments.find((item) => item.id === experimentId);
  const selectedSamples = samples.filter((item) => sampleIds.includes(item.id));
  const completedReports = reports.filter((item) => item.status === "Completed");
  const stats = useMemo(() => ({
    total: reports.length,
    pdf: reports.filter((item) => item.format === "pdf").length,
    xlsx: reports.filter((item) => item.format === "xlsx").length,
    ai: reports.filter((item) => item.ai_status === "Completed").length,
  }), [reports]);

  return (
    <div className="page">
      <PageHeader eyebrow="Scientific communication" title="Report center" description="Generate persistent bilingual reports from live laboratory records and download real PDF or Excel files." actions={<button className="btn btn-primary" onClick={() => void generate()} disabled={state === "generating"}><Plus /> Generate report</button>} />
      {error && <div className={`alert ${state === "completed" ? "alert-warning" : "alert-danger"} section-gap`} role="alert"><AlertTriangle /><div><strong>{state === "completed" ? "Report generated with a warning" : "Report request failed"}</strong><p>{error}</p></div></div>}
      <section className="stat-grid"><StatCard icon={<FileCheck2 />} value={stats.total} label="Saved reports" trend={`${completedReports.length} available to download`} /><StatCard icon={<FileText />} value={stats.pdf} label="PDF reports" trend="Print-ready output" /><StatCard icon={<FileSpreadsheet />} value={stats.xlsx} label="Excel exports" trend="Structured data sheets" /><StatCard icon={<Sparkles />} value={stats.ai} label="With AI summary" trend="Gemini-assisted context" /></section>
      <section className="card section-gap"><div className="card-header"><div><h2>Report templates</h2><p>Choose a report scope backed by the laboratory database</p></div></div><div className="card-body"><div className="grid-3" style={{ margin: 0 }}>{reportTemplates.map(({ type, title, copy, icon: Icon }) => <button className={`card stat-card report-template ${reportType === type ? "active" : ""}`} key={type} style={{ textAlign: "left", cursor: "pointer" }} onClick={() => setReportType(type)}><div className="stat-icon"><Icon /></div><div><strong style={{ fontSize: 15 }}>{title}</strong><span>{copy}</span></div></button>)}</div></div></section>
      <section className="grid-main">
        <div className="card"><div className="card-header"><div><h2>Generate a report</h2><p>Configure scope, language, and output</p></div><Badge tone={state === "completed" ? "success" : state === "failed" ? "danger" : state === "generating" ? "warning" : "neutral"}>{state === "loading" ? "Loading" : state === "idle" ? "Ready" : state}</Badge></div><div className="card-body">
          {state === "completed" && <div className="alert alert-success section-gap"><CheckCircle2 /><div><strong>Report completed</strong><p>The file was generated, saved to report history, and downloaded.</p></div></div>}
          <div className="form-grid"><div className="field"><label htmlFor="report-type">Report type</label><select id="report-type" className="select" value={reportType} onChange={(event) => setReportType(event.target.value as ReportType)}>{reportTemplates.map((item) => <option value={item.type} key={item.type}>{item.title}</option>)}</select></div><div className="field"><label htmlFor="report-format">Output format</label><select id="report-format" className="select" value={format} onChange={(event) => setFormat(event.target.value as ReportFormat)}><option value="pdf">PDF</option><option value="xlsx">Excel (.xlsx)</option></select></div><div className="field"><label htmlFor="report-language">Report language</label><select id="report-language" className="select" value={language} onChange={(event) => setLanguage(event.target.value as "th" | "en")}><option value="en">English</option><option value="th">ไทย</option></select></div><div className="field"><label htmlFor="report-experiment">Experiment</label><select id="report-experiment" className="select" value={experimentId} onChange={(event) => setExperimentId(event.target.value)}><option value="">All / no experiment</option>{experiments.map((item) => <option value={item.id} key={item.id}>{item.id} · {item.title}</option>)}</select></div><div className="field span-2"><label htmlFor="report-samples">Samples</label><select id="report-samples" className="select" multiple style={{ height: 112 }} value={sampleIds} onChange={(event) => setSampleIds(Array.from(event.target.selectedOptions, (option) => option.value))}>{samples.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.name} · {item.status}</option>)}</select><span className="field-hint">Leave all items unselected to include the full scope.</span></div><div className="field"><label htmlFor="range-start">From</label><input id="range-start" className="input" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></div><div className="field"><label htmlFor="range-end">To</label><input id="range-end" className="input" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></div><label className="check-row span-2"><input type="checkbox" checked={includeAi} onChange={(event) => setIncludeAi(event.target.checked)} /> Include a Gemini-assisted summary and key findings</label></div>
          <div style={{ display: "flex", gap: 9, marginTop: 18 }}><button className="btn btn-primary" onClick={() => void generate()} disabled={state === "generating" || state === "loading"}>{state === "generating" ? <><LoaderCircle className="spin" /> Generating real file…</> : <><Download /> Generate & download</>}</button><button className="btn btn-secondary" onClick={() => { setSampleIds([]); setDateFrom(""); setDateTo(""); setError(""); setState("idle"); }}>Reset scope</button></div>
        </div></div>
        <div className="report-preview"><div className="report-preview-head"><div><strong style={{ fontSize: 20 }}>Helix Lab</strong><div>{reportTypeName(reportType)}</div></div><div style={{ textAlign: "right" }}><strong>{format.toUpperCase()}</strong><div>{language === "th" ? "ภาษาไทย" : "English"}</div></div></div><h2>{selectedExperiment?.title || reportTypeName(reportType)}</h2>{selectedExperiment && <><p><strong>Status:</strong> {selectedExperiment.status}</p><p><strong>Protocol:</strong> {selectedExperiment.protocol || "Not recorded"}</p><h3 style={{ marginTop: 22 }}>Objective</h3><p>{selectedExperiment.objective || "No objective has been recorded."}</p></>}<h3 style={{ marginTop: 20 }}>Included samples</h3><p>{selectedSamples.length ? `${selectedSamples.length} selected records` : "All samples in the selected scope"}</p>{selectedSamples.slice(0, 4).map((item) => <div className="metric-row" key={item.id}><span>{item.id} · {item.name}</span><StatusBadge status={item.status} /></div>)}{includeAi && <><h3 style={{ marginTop: 20 }}>AI-assisted summary</h3><p>Gemini will summarize only the records included in this report. If Gemini is unavailable, the factual report still downloads without this section.</p></>}<div className="alert alert-info" style={{ marginTop: 22 }}><FileCheck2 /><div><strong>Persistent snapshot</strong><p>Downloads are regenerated from the saved data snapshot, so history remains reproducible.</p></div></div></div>
      </section>
      <section className="card"><div className="card-header"><div><h2>Report history</h2><p>Persistent outputs generated from database snapshots</p></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Report</th><th>Type</th><th>Generated</th><th>Status</th><th>AI</th><th>Format</th><th>Actions</th></tr></thead><tbody>{reports.map((report) => <tr key={report.id}><td><div className="cell-main">{report.title}</div><div className="cell-sub">{report.id}</div></td><td>{reportTypeName(report.report_type)}</td><td>{new Date(report.created_at).toLocaleString()}</td><td><StatusBadge status={report.status} /></td><td><Badge tone={report.ai_status === "Completed" ? "success" : report.ai_status === "Failed" ? "warning" : "neutral"}>{report.ai_status || "—"}</Badge></td><td>{report.format.toUpperCase()} · {report.language.toUpperCase()}</td><td><div className="table-actions"><button className="btn btn-ghost btn-icon" disabled={report.status !== "Completed"} onClick={() => void download(report)} aria-label={`Download ${report.title}`}><Download /></button><button className="btn btn-ghost btn-icon" onClick={() => void removeReport(report)} aria-label={`Delete ${report.title}`}><Trash2 /></button></div></td></tr>)}{reports.length === 0 && <tr><td colSpan={7}><div className="empty-state"><div><FileText /><h3>No reports generated yet</h3><p>Create your first PDF or Excel report above.</p></div></div></td></tr>}</tbody></table></div></section>
      <Toast show={toast.show} title={toast.title} description={toast.description} />
    </div>
  );
}

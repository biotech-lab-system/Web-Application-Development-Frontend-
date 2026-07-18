import type { AuditLog, Booking, Equipment, Experiment, LabNote, Report, Sample } from "@/types";

export const samples: Sample[] = [
  ["SMP-240701", "Human Plasma A-17", "Human Plasma", "Dr. Kan", "Jul 01, 2026", "FZ-02 / Rack A3", "Stored", "12 min ago", "-80°C"],
  ["SMP-240702", "DNA Extract BRCA-01", "DNA Extract", "Dr. Kan", "Jul 02, 2026", "FZ-01 / Box B2", "In Use", "28 min ago", "-20°C"],
  ["SMP-240703", "E. coli DH5α Batch 8", "Bacterial Culture", "Maya Chen", "Jul 03, 2026", "INC-03 / Shelf 2", "Processing", "1 hr ago", "37°C"],
  ["SMP-240704", "HEK293 Culture P12", "Cell Culture", "Dr. Kan", "Jul 04, 2026", "INC-01 / Shelf 4", "In Use", "2 hrs ago", "37°C"],
  ["SMP-240705", "RNA Sample Liver-22", "RNA Sample", "Leo Martin", "Jul 05, 2026", "FZ-02 / Rack C1", "Stored", "3 hrs ago", "-80°C"],
  ["SMP-240706", "Serum Cohort B-09", "Serum Sample", "Nina Patel", "Jul 06, 2026", "FZ-01 / Box D4", "Stored", "Yesterday", "-20°C"],
  ["SMP-240707", "Protein Extract GFP-4", "Protein Extract", "Dr. Kan", "Jul 07, 2026", "FR-04 / Tray 1", "Processing", "Yesterday", "4°C"],
  ["SMP-240708", "Tumor Tissue T-31", "Tissue Sample", "Maya Chen", "Jul 08, 2026", "FZ-02 / Rack D2", "Quarantined", "Yesterday", "-80°C"],
  ["SMP-240709", "PBMC Donor K12", "Cell Culture", "Nina Patel", "Jul 09, 2026", "LN2-01 / Canister 3", "Stored", "2 days ago", "-196°C"],
  ["SMP-240710", "RNA Sample Kidney-07", "RNA Sample", "Leo Martin", "Jul 10, 2026", "FZ-02 / Rack C2", "Stored", "2 days ago", "-80°C"],
  ["SMP-240711", "DNA Extract TP53-05", "DNA Extract", "Dr. Kan", "Jul 11, 2026", "FZ-01 / Box B3", "In Use", "3 days ago", "-20°C"],
  ["SMP-240712", "B. subtilis Culture 14", "Bacterial Culture", "Owen Brooks", "Jul 11, 2026", "INC-03 / Shelf 3", "Processing", "3 days ago", "30°C"],
  ["SMP-240713", "Plasma Control C-02", "Human Plasma", "Nina Patel", "Jul 12, 2026", "FZ-02 / Rack A4", "Stored", "4 days ago", "-80°C"],
  ["SMP-240714", "CHO Culture P08", "Cell Culture", "Maya Chen", "Jul 12, 2026", "INC-02 / Shelf 1", "In Use", "4 days ago", "37°C"],
  ["SMP-240715", "Protein Extract Cas9", "Protein Extract", "Dr. Kan", "Jul 13, 2026", "FR-04 / Tray 2", "Stored", "5 days ago", "4°C"],
  ["SMP-240716", "Brain Tissue BT-16", "Tissue Sample", "Leo Martin", "Jul 13, 2026", "FZ-02 / Rack E1", "Quarantined", "5 days ago", "-80°C"],
  ["SMP-240717", "Serum Cohort A-21", "Serum Sample", "Nina Patel", "Jul 14, 2026", "FZ-01 / Box D2", "Stored", "6 days ago", "-20°C"],
  ["SMP-240718", "mRNA Vaccine Control", "RNA Sample", "Dr. Kan", "Jul 15, 2026", "FZ-02 / Rack C4", "Processing", "6 days ago", "-80°C"],
  ["SMP-240719", "DNA Reference NA12878", "DNA Extract", "Owen Brooks", "Jul 15, 2026", "FZ-01 / Box A1", "Stored", "1 week ago", "-20°C"],
  ["SMP-240720", "Archived Plasma P-04", "Human Plasma", "Dr. Kan", "Jun 18, 2026", "Archive / Batch 7", "Archived", "1 week ago", "-80°C"],
].map(([id, name, type, owner, collectionDate, location, status, updated, temperature]) => ({
  id, name, type, owner, collectionDate, location, status: status as Sample["status"], updated, temperature,
}));

export const experiments: Experiment[] = [
  { id: "EXP-26071", title: "CRISPR Gene Editing Validation", owner: "Dr. Kan", status: "Running", priority: "High", progress: 68, due: "Jul 22", protocol: "CRISPR-Cas9 Validation v3.2", samples: ["SMP-240711", "SMP-240715"], team: ["Dr. Kan", "Maya Chen", "Leo Martin"] },
  { id: "EXP-26072", title: "Protein Expression Analysis", owner: "Dr. Kan", status: "Running", priority: "Medium", progress: 42, due: "Jul 25", protocol: "Western Blot Quantification v2", samples: ["SMP-240707", "SMP-240715"], team: ["Dr. Kan", "Nina Patel"] },
  { id: "EXP-26073", title: "Bacterial Growth Study", owner: "Maya Chen", status: "Planning", priority: "Low", progress: 18, due: "Jul 28", protocol: "Growth Curve Assay", samples: ["SMP-240703", "SMP-240712"], team: ["Maya Chen", "Owen Brooks"] },
  { id: "EXP-26074", title: "RNA Sequencing Preparation", owner: "Leo Martin", status: "On Hold", priority: "High", progress: 55, due: "Jul 23", protocol: "RNA-seq Library Prep v4", samples: ["SMP-240705", "SMP-240710"], team: ["Leo Martin", "Dr. Kan"] },
  { id: "EXP-26075", title: "Cell Viability Assay", owner: "Nina Patel", status: "Completed", priority: "Medium", progress: 100, due: "Jul 15", protocol: "MTT Assay Standard", samples: ["SMP-240704", "SMP-240714"], team: ["Nina Patel", "Maya Chen"] },
  { id: "EXP-26076", title: "DNA Extraction Optimization", owner: "Dr. Kan", status: "Draft", priority: "Medium", progress: 5, due: "Aug 02", protocol: "Silica Column Extraction", samples: ["SMP-240719"], team: ["Dr. Kan"] },
  { id: "EXP-26077", title: "Plasma Biomarker Screening", owner: "Nina Patel", status: "Running", priority: "High", progress: 76, due: "Jul 21", protocol: "Multiplex ELISA Panel", samples: ["SMP-240701", "SMP-240706"], team: ["Nina Patel", "Dr. Kan"] },
  { id: "EXP-26078", title: "HEK293 Transfection Study", owner: "Maya Chen", status: "Planning", priority: "Medium", progress: 24, due: "Jul 30", protocol: "Lipid Transfection v2", samples: ["SMP-240704"], team: ["Maya Chen", "Dr. Kan"] },
  { id: "EXP-26079", title: "Tissue RNA Integrity Review", owner: "Leo Martin", status: "Completed", priority: "Low", progress: 100, due: "Jul 14", protocol: "RIN Assessment", samples: ["SMP-240710", "SMP-240716"], team: ["Leo Martin"] },
  { id: "EXP-26080", title: "Legacy Culture Characterization", owner: "Owen Brooks", status: "Archived", priority: "Low", progress: 100, due: "Jun 28", protocol: "16S Characterization", samples: ["SMP-240712"], team: ["Owen Brooks"] },
];

export const equipment: Equipment[] = [
  { id: "EQ-01", name: "PCR Machine", room: "Genomics 201", status: "In Use", nextAvailable: "11:30 AM", utilization: 82 },
  { id: "EQ-02", name: "Centrifuge", room: "Core Lab 105", status: "Available", nextAvailable: "Now", utilization: 64 },
  { id: "EQ-03", name: "Spectrophotometer", room: "Analytics 204", status: "Available", nextAvailable: "Now", utilization: 47 },
  { id: "EQ-04", name: "Incubator", room: "Culture Room 108", status: "In Use", nextAvailable: "4:00 PM", utilization: 91 },
  { id: "EQ-05", name: "Biosafety Cabinet", room: "Culture Room 108", status: "Available", nextAvailable: "Now", utilization: 55 },
  { id: "EQ-06", name: "Autoclave", room: "Sterilization 102", status: "Maintenance", nextAvailable: "Jul 20", utilization: 38 },
  { id: "EQ-07", name: "Microscope", room: "Imaging 305", status: "Available", nextAvailable: "Now", utilization: 61 },
  { id: "EQ-08", name: "DNA Sequencer", room: "Genomics 202", status: "In Use", nextAvailable: "Tomorrow", utilization: 88 },
];

export const bookings: Booking[] = [
  { id: "BK-101", equipment: "PCR Machine", date: "Jul 18", time: "09:00–11:30", researcher: "Dr. Kan", purpose: "CRISPR validation" },
  { id: "BK-102", equipment: "Centrifuge", date: "Jul 18", time: "13:00–14:00", researcher: "Nina Patel", purpose: "Plasma prep" },
  { id: "BK-103", equipment: "Microscope", date: "Jul 18", time: "14:30–16:00", researcher: "Maya Chen", purpose: "Cell morphology" },
  { id: "BK-104", equipment: "Spectrophotometer", date: "Jul 19", time: "08:30–10:00", researcher: "Leo Martin", purpose: "RNA QC" },
  { id: "BK-105", equipment: "DNA Sequencer", date: "Jul 19", time: "09:00–17:00", researcher: "Dr. Kan", purpose: "Amplicon run" },
  { id: "BK-106", equipment: "Biosafety Cabinet", date: "Jul 20", time: "10:00–12:00", researcher: "Maya Chen", purpose: "Cell passage" },
  { id: "BK-107", equipment: "Incubator", date: "Jul 20", time: "12:00–16:00", researcher: "Owen Brooks", purpose: "Growth study" },
  { id: "BK-108", equipment: "PCR Machine", date: "Jul 21", time: "09:00–11:00", researcher: "Nina Patel", purpose: "qPCR panel" },
  { id: "BK-109", equipment: "Microscope", date: "Jul 21", time: "15:00–17:00", researcher: "Dr. Kan", purpose: "Viability imaging" },
  { id: "BK-110", equipment: "Centrifuge", date: "Jul 22", time: "08:00–09:00", researcher: "Leo Martin", purpose: "Library cleanup" },
];

export const labNotes: LabNote[] = [
  { id: "NOTE-101", title: "CRISPR validation — Day 4", experiment: "CRISPR Gene Editing Validation", updated: "10 min ago", state: "Pinned", preview: "Editing efficiency increased to 71% in replicate B..." },
  { id: "NOTE-102", title: "Western blot membrane transfer", experiment: "Protein Expression Analysis", updated: "45 min ago", state: "Draft", preview: "Transfer completed at 100V for 60 minutes..." },
  { id: "NOTE-103", title: "Growth curve OD600 readings", experiment: "Bacterial Growth Study", updated: "Yesterday", state: "Pinned", preview: "Lag phase observed through hour two..." },
  { id: "NOTE-104", title: "RNA library concentration", experiment: "RNA Sequencing Preparation", updated: "Yesterday", state: "Draft", preview: "Qubit results below target for sample 07..." },
  { id: "NOTE-105", title: "MTT assay final observation", experiment: "Cell Viability Assay", updated: "2 days ago", state: "Archived", preview: "Dose response was consistent across all wells..." },
  { id: "NOTE-106", title: "Column wash optimization", experiment: "DNA Extraction Optimization", updated: "3 days ago", state: "Draft", preview: "Second wash reduced salt carryover..." },
  { id: "NOTE-107", title: "ELISA plate 3 calibration", experiment: "Plasma Biomarker Screening", updated: "4 days ago", state: "Pinned", preview: "Standard curve R² reached 0.997..." },
  { id: "NOTE-108", title: "HEK293 confluency check", experiment: "HEK293 Transfection Study", updated: "5 days ago", state: "Draft", preview: "Cells at approximately 72% confluency..." },
  { id: "NOTE-109", title: "RIN review summary", experiment: "Tissue RNA Integrity Review", updated: "1 week ago", state: "Archived", preview: "Four of six samples passed the RIN threshold..." },
  { id: "NOTE-110", title: "16S library notes", experiment: "Legacy Culture Characterization", updated: "2 weeks ago", state: "Archived", preview: "Final library pooled at equimolar concentration..." },
];

export const reports: Report[] = [
  { id: "RPT-26081", title: "CRISPR Weekly Progress", type: "Experiment Summary", experiment: "CRISPR Gene Editing Validation", generated: "Jul 18, 09:42", status: "Completed", format: "PDF" },
  { id: "RPT-26082", title: "Protein Expression Results", type: "Results Report", experiment: "Protein Expression Analysis", generated: "Jul 17, 16:20", status: "Completed", format: "Excel" },
  { id: "RPT-26083", title: "Biobank Inventory", type: "Sample Inventory", experiment: "All samples", generated: "Jul 17, 11:08", status: "Completed", format: "Excel" },
  { id: "RPT-26084", title: "RNA QC Exception Report", type: "Quality Control", experiment: "RNA Sequencing Preparation", generated: "Jul 16, 14:32", status: "Failed", format: "PDF" },
  { id: "RPT-26085", title: "Equipment Utilization — July", type: "Operations", experiment: "All experiments", generated: "Jul 15, 10:15", status: "Completed", format: "PDF" },
  { id: "RPT-26086", title: "Plasma Biomarker Interim", type: "Experiment Summary", experiment: "Plasma Biomarker Screening", generated: "Jul 14, 17:40", status: "Completed", format: "PDF" },
  { id: "RPT-26087", title: "Cell Viability Final", type: "Final Report", experiment: "Cell Viability Assay", generated: "Jul 14, 09:05", status: "Completed", format: "PDF" },
  { id: "RPT-26088", title: "Monthly Audit Trail", type: "Audit", experiment: "All experiments", generated: "Generating now", status: "Generating", format: "Excel" },
];

export const tasks = [
  { id: "TSK-01", title: "Review CRISPR plate images", due: "10:30 AM", assignee: "Dr. Kan", priority: "High", done: false },
  { id: "TSK-02", title: "Approve sample intake batch 24", due: "11:15 AM", assignee: "Dr. Kan", priority: "Medium", done: true },
  { id: "TSK-03", title: "Prepare PCR master mix", due: "1:00 PM", assignee: "Dr. Kan", priority: "High", done: false },
  { id: "TSK-04", title: "Check freezer FZ-02 temperature", due: "2:00 PM", assignee: "Maya Chen", priority: "Medium", done: false },
  { id: "TSK-05", title: "Sign protein assay report", due: "3:30 PM", assignee: "Dr. Kan", priority: "Low", done: false },
  { id: "TSK-06", title: "Reorder pipette tips", due: "4:00 PM", assignee: "Nina Patel", priority: "Low", done: true },
  { id: "TSK-07", title: "Archive completed MTT run", due: "Tomorrow", assignee: "Dr. Kan", priority: "Low", done: false },
  { id: "TSK-08", title: "Review RNA QC exceptions", due: "Tomorrow", assignee: "Leo Martin", priority: "High", done: false },
  { id: "TSK-09", title: "Calibrate spectrophotometer", due: "Jul 21", assignee: "Owen Brooks", priority: "Medium", done: false },
  { id: "TSK-10", title: "Team protocol review", due: "Jul 22", assignee: "Dr. Kan", priority: "Medium", done: false },
];

export const notifications = [
  { id: 1, title: "Freezer temperature warning", detail: "FZ-02 reached -73°C for 6 minutes", time: "8 min", severity: "critical" },
  { id: 2, title: "Report ready", detail: "CRISPR Weekly Progress was generated", time: "24 min", severity: "success" },
  { id: 3, title: "Booking starts soon", detail: "PCR Machine at 9:00 AM", time: "45 min", severity: "info" },
  { id: 4, title: "Chemical expiring", detail: "Trypsin-EDTA expires in 5 days", time: "1 hr", severity: "warning" },
  { id: 5, title: "Sample moved", detail: "SMP-240711 moved to FZ-01 / B3", time: "2 hrs", severity: "info" },
  { id: 6, title: "Experiment updated", detail: "RNA Sequencing Preparation is on hold", time: "3 hrs", severity: "warning" },
  { id: 7, title: "New comment", detail: "Maya mentioned you in a lab note", time: "4 hrs", severity: "info" },
  { id: 8, title: "Maintenance scheduled", detail: "Autoclave service on Jul 20", time: "Yesterday", severity: "info" },
];

export const chemicals = [
  { name: "Trypsin-EDTA", lot: "T-8821", expires: "Jul 23", stock: "125 mL", status: "Expiring" },
  { name: "Ethidium Bromide", lot: "E-1074", expires: "Jul 26", stock: "18 mL", status: "Expiring" },
  { name: "DMEM High Glucose", lot: "D-2930", expires: "Aug 02", stock: "2.5 L", status: "Low" },
  { name: "Fetal Bovine Serum", lot: "F-3108", expires: "Aug 10", stock: "800 mL", status: "Good" },
  { name: "TRIzol Reagent", lot: "R-5512", expires: "Sep 18", stock: "420 mL", status: "Good" },
  { name: "Proteinase K", lot: "P-9022", expires: "Oct 12", stock: "85 mL", status: "Good" },
  { name: "Agarose", lot: "A-6631", expires: "Nov 25", stock: "760 g", status: "Good" },
  { name: "Ampicillin", lot: "AM-773", expires: "Dec 08", stock: "45 g", status: "Good" },
  { name: "PBS 10X", lot: "PB-117", expires: "Jan 14, 2027", stock: "4 L", status: "Good" },
  { name: "SYBR Green Mix", lot: "S-4127", expires: "Feb 20, 2027", stock: "12 mL", status: "Low" },
];

export const auditLogs: AuditLog[] = Array.from({ length: 15 }, (_, index) => ({
  id: `AUD-${String(26040 + index)}`,
  action: ["Archived", "Updated", "Restored", "Viewed", "Exported"][index % 5],
  item: [samples[index % samples.length].name, experiments[index % experiments.length].title, labNotes[index % labNotes.length].title][index % 3],
  user: ["Dr. Kan", "Maya Chen", "Nina Patel", "Leo Martin"][index % 4],
  date: `Jul ${17 - (index % 10)}, ${String(9 + (index % 8)).padStart(2, "0")}:20`,
  category: ["Samples", "Experiments", "Lab Notes", "Reports", "Audit Logs"][index % 5],
}));

export const chartData = {
  registrations: [
    { day: "Mon", samples: 14 }, { day: "Tue", samples: 22 }, { day: "Wed", samples: 18 },
    { day: "Thu", samples: 29 }, { day: "Fri", samples: 24 }, { day: "Sat", samples: 9 }, { day: "Sun", samples: 12 },
  ],
  experimentStatus: [
    { name: "Running", value: 3, fill: "#0f8b8d" }, { name: "Planning", value: 2, fill: "#4f76c7" },
    { name: "On Hold", value: 1, fill: "#e29442" }, { name: "Completed", value: 2, fill: "#48a474" },
  ],
  equipmentUsage: [
    { name: "PCR", usage: 82 }, { name: "Centrifuge", usage: 64 }, { name: "Spectro", usage: 47 },
    { name: "Incubator", usage: 91 }, { name: "Sequencer", usage: 88 },
  ],
};

export type SampleStatus = "Stored" | "In Use" | "Processing" | "Quarantined" | "Archived";

export interface Sample {
  id: string;
  name: string;
  type: string;
  owner: string;
  collectionDate: string;
  location: string;
  status: SampleStatus;
  updated: string;
  temperature: string;
}

export type ExperimentStatus = "Draft" | "Planning" | "Running" | "On Hold" | "Completed" | "Archived";

export interface Experiment {
  id: string;
  title: string;
  owner: string;
  status: ExperimentStatus;
  priority: "Low" | "Medium" | "High";
  progress: number;
  due: string;
  protocol: string;
  samples: string[];
  team: string[];
}

export interface Equipment {
  id: string;
  name: string;
  room: string;
  status: "Available" | "In Use" | "Maintenance";
  nextAvailable: string;
  utilization: number;
}

export interface Booking {
  id: string;
  equipment: string;
  date: string;
  time: string;
  researcher: string;
  purpose: string;
}

export interface LabNote {
  id: string;
  title: string;
  experiment: string;
  updated: string;
  state: "Draft" | "Pinned" | "Archived";
  preview: string;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  experiment: string;
  generated: string;
  status: "Completed" | "Generating" | "Failed";
  format: "PDF" | "Excel";
}

export interface AuditLog {
  id: string;
  action: string;
  item: string;
  user: string;
  date: string;
  category: string;
}

export type UserRole = "Lab Manager" | "Researcher" | "Viewer";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  display_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
  persistent: boolean;
}

export interface LoginInput {
  identifier: string;
  password: string;
}

export interface RegisterInput {
  display_name: string;
  username: string;
  email: string;
  password: string;
  role: Extract<UserRole, "Researcher" | "Viewer">;
}

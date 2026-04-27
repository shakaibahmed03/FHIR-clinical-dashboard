// Clean output types — the JSON contract between backend and frontend
// These are what the frontend receives after FHIR data is transformed

export interface Patient {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
}

export interface Condition {
  id: string;
  code: string;
  display: string;
  status: string;
  onsetDate: string;
}

export interface Observation {
  id: string;
  code: string;
  display: string;
  value: number;
  unit: string;
  effectiveDate: string;
}

export type RiskSeverity = "HIGH" | "MEDIUM" | "LOW";

export interface RiskFlag {
  type: string;
  severity: RiskSeverity;
  message: string;
}

export interface DashboardResponse {
  patient: Patient;
  conditions: Condition[];
  observations: Observation[];
  summary: string;
  flags: RiskFlag[];
}

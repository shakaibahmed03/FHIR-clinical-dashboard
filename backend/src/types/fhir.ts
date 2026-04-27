// Raw FHIR R4 resource shapes — verified against live HAPI FHIR server
// These types model the actual JSON structure returned by https://hapi.fhir.org/baseR4

// --- Shared FHIR building blocks ---

export interface FhirCoding {
  system?: string;
  code?: string;
  display?: string;
}

export interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text?: string;
}

export interface FhirQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface FhirHumanName {
  use?: string;
  family?: string;
  given?: string[];
}

// --- FHIR Bundle wrapper ---

export interface FhirBundleEntry<T> {
  fullUrl?: string;
  resource: T;
}

export interface FhirBundle<T> {
  resourceType: "Bundle";
  type: string;
  total?: number;
  entry?: FhirBundleEntry<T>[];
}

// --- Patient ---

export interface FhirPatient {
  resourceType: "Patient";
  id: string;
  name?: FhirHumanName[];
  gender?: string;
  birthDate?: string;
  telecom?: { system?: string; value?: string }[];
}

// --- Condition ---

export interface FhirCondition {
  resourceType: "Condition";
  id: string;
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  code?: FhirCodeableConcept;
  onsetDateTime?: string;
  subject?: { reference?: string };
}

// --- Observation ---

export interface FhirObservationComponent {
  code?: FhirCodeableConcept;
  valueQuantity?: FhirQuantity;
}

export interface FhirObservation {
  resourceType: "Observation";
  id: string;
  status?: string;
  category?: FhirCodeableConcept[];
  code?: FhirCodeableConcept;
  valueQuantity?: FhirQuantity;
  component?: FhirObservationComponent[];
  effectiveDateTime?: string;
  subject?: { reference?: string };
}

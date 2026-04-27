import {
  FhirPatient,
  FhirCondition,
  FhirObservation,
  FhirBundle,
} from "../types/fhir";
import { Patient, Condition, Observation } from "../types/dashboard";

// --- Patient ---

export function mapPatient(raw: FhirPatient): Patient {
  const nameEntry = raw.name?.[0];
  const given = nameEntry?.given?.join(" ") ?? "";
  const family = nameEntry?.family ?? "";
  const fullName = [given, family].filter(Boolean).join(" ") || "Unknown";

  return {
    id: raw.id,
    name: fullName,
    gender: raw.gender ?? "Unknown",
    birthDate: raw.birthDate ?? "Unknown",
  };
}

// --- Conditions ---

function mapSingleCondition(raw: FhirCondition): Condition {
  const coding = raw.code?.coding?.[0];

  return {
    id: raw.id,
    code: coding?.code ?? "Unknown",
    display: coding?.display ?? raw.code?.text ?? "Unknown condition",
    status: raw.clinicalStatus?.coding?.[0]?.code ?? "unknown",
    onsetDate: raw.onsetDateTime ?? "Unknown",
  };
}

export function mapConditions(bundle: FhirBundle<FhirCondition>): Condition[] {
  if (!bundle.entry || bundle.entry.length === 0) return [];
  return bundle.entry.map((entry) => mapSingleCondition(entry.resource));
}

// --- Observations ---
// Handles both simple observations (valueQuantity at root)
// and compound observations (component[] like BP panels)

function mapSingleObservation(raw: FhirObservation): Observation[] {
  const effectiveDate = raw.effectiveDateTime ?? "Unknown";

  // Case 1: Simple observation with valueQuantity at root level
  if (raw.valueQuantity) {
    const coding = raw.code?.coding?.[0];
    return [
      {
        id: raw.id,
        code: coding?.code ?? "Unknown",
        display: coding?.display ?? raw.code?.text ?? "Unknown observation",
        value: raw.valueQuantity.value ?? 0,
        unit: raw.valueQuantity.unit ?? "",
        effectiveDate,
      },
    ];
  }

  // Case 2: Compound observation with component[] (e.g. BP panel)
  if (raw.component && raw.component.length > 0) {
    return raw.component.map((comp, index) => {
      const coding = comp.code?.coding?.[0];
      return {
        id: `${raw.id}-comp-${index}`,
        code: coding?.code ?? "Unknown",
        display: coding?.display ?? comp.code?.text ?? "Unknown component",
        value: comp.valueQuantity?.value ?? 0,
        unit: comp.valueQuantity?.unit ?? "",
        effectiveDate,
      };
    });
  }

  // Case 3: Observation with neither — return with zeroed values
  const coding = raw.code?.coding?.[0];
  return [
    {
      id: raw.id,
      code: coding?.code ?? "Unknown",
      display: coding?.display ?? raw.code?.text ?? "Unknown observation",
      value: 0,
      unit: "",
      effectiveDate,
    },
  ];
}

export function mapObservations(
  bundle: FhirBundle<FhirObservation>
): Observation[] {
  if (!bundle.entry || bundle.entry.length === 0) return [];
  return bundle.entry.flatMap((entry) => mapSingleObservation(entry.resource));
}

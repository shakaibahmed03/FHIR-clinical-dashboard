import axios from "axios";
import {
  FhirPatient,
  FhirCondition,
  FhirObservation,
  FhirBundle,
} from "../types/fhir";

const FHIR_BASE = process.env.FHIR_BASE_URL || "https://hapi.fhir.org/baseR4";

// --- Individual resource fetchers ---

async function fetchPatient(patientId: string): Promise<FhirPatient> {
  const { data } = await axios.get<FhirPatient>(
    `${FHIR_BASE}/Patient/${patientId}`,
    { headers: { Accept: "application/fhir+json" } }
  );
  return data;
}

async function fetchConditions(
  patientId: string
): Promise<FhirBundle<FhirCondition>> {
  const { data } = await axios.get<FhirBundle<FhirCondition>>(
    `${FHIR_BASE}/Condition`,
    {
      params: { patient: patientId, _count: 100 },
      headers: { Accept: "application/fhir+json" },
    }
  );
  return data;
}

async function fetchObservations(
  patientId: string
): Promise<FhirBundle<FhirObservation>> {
  const { data } = await axios.get<FhirBundle<FhirObservation>>(
    `${FHIR_BASE}/Observation`,
    {
      params: { patient: patientId, _count: 100 },
      headers: { Accept: "application/fhir+json" },
    }
  );
  return data;
}

// --- Main export: parallel fetch all patient data ---

export interface RawPatientData {
  patient: FhirPatient;
  conditionsBundle: FhirBundle<FhirCondition>;
  observationsBundle: FhirBundle<FhirObservation>;
}

export async function fetchPatientData(
  patientId: string
): Promise<RawPatientData> {
  const [patient, conditionsBundle, observationsBundle] = await Promise.all([
    fetchPatient(patientId),
    fetchConditions(patientId),
    fetchObservations(patientId),
  ]);

  return { patient, conditionsBundle, observationsBundle };
}

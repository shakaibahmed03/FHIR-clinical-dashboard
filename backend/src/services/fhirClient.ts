import axios from "axios";
import {
  FhirPatient,
  FhirCondition,
  FhirObservation,
  FhirBundle,
} from "../types/fhir";
import patientsMock from "../mock-data/patients.json";
import conditionsMock from "../mock-data/conditions.json";
import observationsMock from "../mock-data/observations.json";

const FHIR_BASE = process.env.FHIR_BASE_URL || "https://hapi.fhir.org/baseR4";
const USE_MOCK_DATA = process.env.USE_MOCK_DATA !== "false";

// --- Mock lookup tables ---
// Cast the imported JSON to typed FHIR shapes. The JSON files are authored
// in valid FHIR R4 and verified to match these interfaces.

const PATIENTS = patientsMock as unknown as Record<string, FhirPatient>;
const CONDITIONS = conditionsMock as unknown as Record<
  string,
  FhirBundle<FhirCondition>
>;
const OBSERVATIONS = observationsMock as unknown as Record<
  string,
  FhirBundle<FhirObservation>
>;

// Match axios error shape so route handlers can keep their existing
// `error.response.status === 404` check (no diff needed in patients.ts).
class MockNotFoundError extends Error {
  response: { status: number };
  constructor(patientId: string) {
    super(`Patient ${patientId} not found in mock data`);
    this.response = { status: 404 };
  }
}

function emptyBundle<T>(): FhirBundle<T> {
  return { resourceType: "Bundle", type: "searchset", total: 0, entry: [] };
}

// --- Mock fetchers (read from imported JSON) ---

async function fetchPatientMock(patientId: string): Promise<FhirPatient> {
  const p = PATIENTS[patientId];
  if (!p) throw new MockNotFoundError(patientId);
  return p;
}

async function fetchConditionsMock(
  patientId: string
): Promise<FhirBundle<FhirCondition>> {
  return CONDITIONS[patientId] ?? emptyBundle<FhirCondition>();
}

async function fetchObservationsMock(
  patientId: string
): Promise<FhirBundle<FhirObservation>> {
  return OBSERVATIONS[patientId] ?? emptyBundle<FhirObservation>();
}

// --- Live HAPI fetchers ---

async function fetchPatientLive(patientId: string): Promise<FhirPatient> {
  const { data } = await axios.get<FhirPatient>(
    `${FHIR_BASE}/Patient/${patientId}`,
    { headers: { Accept: "application/fhir+json" } }
  );
  return data;
}

async function fetchConditionsLive(
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

async function fetchObservationsLive(
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

// --- Dispatch: same return signatures regardless of source ---

const fetchPatient = USE_MOCK_DATA ? fetchPatientMock : fetchPatientLive;
const fetchConditions = USE_MOCK_DATA
  ? fetchConditionsMock
  : fetchConditionsLive;
const fetchObservations = USE_MOCK_DATA
  ? fetchObservationsMock
  : fetchObservationsLive;

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

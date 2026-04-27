import { Router, Request, Response } from "express";
import { fetchPatientData } from "../services/fhirClient";
import { mapPatient, mapConditions, mapObservations } from "../services/transformer";
import { evaluateRisk } from "../services/riskRules";
import { generateSummary } from "../services/summary";
import { DashboardResponse } from "../types/dashboard";

const router = Router();

// GET /api/patients/:id/dashboard
router.get("/:id/dashboard", async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!id || id.trim() === "") {
    res.status(400).json({ error: "Patient ID is required" });
    return;
  }

  try {
    // 1. Fetch raw FHIR data (3 parallel calls)
    const raw = await fetchPatientData(id);

    // 2. Transform to clean types
    const patient = mapPatient(raw.patient);
    const conditions = mapConditions(raw.conditionsBundle);
    const observations = mapObservations(raw.observationsBundle);

    // 3. Evaluate risk flags (sync)
    const flags = evaluateRisk(conditions, observations);

    // 4. Generate AI summary (async, with fallback)
    const summary = await generateSummary(conditions, observations);

    // 5. Assemble response
    const dashboard: DashboardResponse = {
      patient,
      conditions,
      observations,
      summary,
      flags,
    };

    res.json(dashboard);
  } catch (error: unknown) {
    // FHIR server errors (404 = patient not found, etc.)
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      (error as { response: { status: number } }).response
    ) {
      const status = (error as { response: { status: number } }).response.status;
      if (status === 404) {
        res.status(404).json({ error: `Patient ${id} not found` });
        return;
      }
    }

    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to fetch patient dashboard" });
  }
});

export default router;

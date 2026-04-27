import type { DashboardResponse } from "../types/dashboard";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function fetchDashboard(
  patientId: string
): Promise<DashboardResponse> {
  const id = patientId.trim();
  if (!id) {
    throw new ApiError("Patient ID is required", 400);
  }

  const url = `${API_BASE_URL}/api/patients/${encodeURIComponent(
    id
  )}/dashboard`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ApiError(
      "Cannot reach backend. Is the API server running?",
      0
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as DashboardResponse;
}

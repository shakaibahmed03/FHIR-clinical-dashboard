import { useState } from "react";
import SearchBar from "./components/SearchBar";
import DemographicsPanel from "./components/DemographicsPanel";
import ConditionsList from "./components/ConditionsList";
import ObservationsList from "./components/ObservationsList";
import AISummaryBox from "./components/AISummaryBox";
import RiskFlagsSection from "./components/RiskFlagsSection";
import { fetchDashboard, ApiError } from "./services/api";
import type { DashboardResponse } from "./types/dashboard";

export default function App() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedId, setLastSearchedId] = useState<string>("");

  async function handleSearch(patientId: string) {
    setLoading(true);
    setError(null);
    setLastSearchedId(patientId);
    try {
      const data = await fetchDashboard(patientId);
      setDashboard(data);
    } catch (err) {
      setDashboard(null);
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M11.645 20.91a.75.75 0 0 0 .71 0c4.04-2.18 7.395-5.78 7.395-10.41a5.25 5.25 0 0 0-9-3.71 5.25 5.25 0 0 0-9 3.71c0 4.63 3.355 8.23 7.395 10.41Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Layer Health
              </h1>
              <p className="text-xs text-slate-500">Clinical Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SearchBar onSearch={handleSearch} loading={loading} />
          <p className="mt-2 text-xs text-slate-500">
            Try IDs like <code className="font-mono">592924</code> or{" "}
            <code className="font-mono">90270587</code> from the public HAPI
            FHIR test server.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        )}

        {loading && !dashboard && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 shadow-sm">
            Loading patient {lastSearchedId}…
          </div>
        )}

        {!loading && !error && !dashboard && (
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500">
              Search a patient ID to view their dashboard.
            </p>
          </div>
        )}

        {dashboard && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <DemographicsPanel patient={dashboard.patient} />
              <AISummaryBox summary={dashboard.summary} />
              <ConditionsList conditions={dashboard.conditions} />
              <ObservationsList observations={dashboard.observations} />
            </div>
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
                <RiskFlagsSection flags={dashboard.flags} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-8 pt-4 text-center text-xs text-slate-400">
        Data source: HAPI FHIR public test server
      </footer>
    </div>
  );
}

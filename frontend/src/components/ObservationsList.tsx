import type { Observation } from "../types/dashboard";

interface ObservationsListProps {
  observations: Observation[];
}

export default function ObservationsList({
  observations,
}: ObservationsListProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Observations</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {observations.length}
        </span>
      </header>

      {observations.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-slate-500">
          No observations on record.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-2.5 text-left font-medium text-slate-500">
                  Observation
                </th>
                <th className="px-6 py-2.5 text-right font-medium text-slate-500">
                  Value
                </th>
                <th className="px-6 py-2.5 text-left font-medium text-slate-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {observations.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-900">
                      {o.display}
                    </div>
                    {o.code && o.code !== "Unknown" && (
                      <div className="font-mono text-xs text-slate-400">
                        {o.code}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right font-mono tabular-nums text-slate-900">
                    {o.value}
                    {o.unit ? (
                      <span className="ml-1 text-slate-500">{o.unit}</span>
                    ) : null}
                  </td>
                  <td className="px-6 py-3 text-slate-700">
                    {o.effectiveDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

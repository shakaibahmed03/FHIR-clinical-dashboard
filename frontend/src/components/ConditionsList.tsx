import type { Condition } from "../types/dashboard";

interface ConditionsListProps {
  conditions: Condition[];
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "active")
    return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  if (s === "resolved" || s === "inactive")
    return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
}

export default function ConditionsList({ conditions }: ConditionsListProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Conditions</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {conditions.length}
        </span>
      </header>

      {conditions.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-slate-500">
          No conditions on record.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-2.5 text-left font-medium text-slate-500">
                  Condition
                </th>
                <th className="px-6 py-2.5 text-left font-medium text-slate-500">
                  Status
                </th>
                <th className="px-6 py-2.5 text-left font-medium text-slate-500">
                  Onset
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {conditions.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-900">
                      {c.display}
                    </div>
                    {c.code && c.code !== "Unknown" && (
                      <div className="font-mono text-xs text-slate-400">
                        {c.code}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-700">{c.onsetDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

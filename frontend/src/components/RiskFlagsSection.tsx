import type { RiskFlag, RiskSeverity } from "../types/dashboard";

interface RiskFlagsSectionProps {
  flags: RiskFlag[];
}

const SEVERITY_ORDER: Record<RiskSeverity, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const SEVERITY_STYLES: Record<
  RiskSeverity,
  { card: string; badge: string; label: string }
> = {
  HIGH: {
    card: "border-rose-300 bg-rose-50",
    badge: "bg-rose-600 text-white",
    label: "High",
  },
  MEDIUM: {
    card: "border-amber-300 bg-amber-50",
    badge: "bg-amber-500 text-white",
    label: "Medium",
  },
  LOW: {
    card: "border-sky-300 bg-sky-50",
    badge: "bg-sky-500 text-white",
    label: "Low",
  },
};

export default function RiskFlagsSection({ flags }: RiskFlagsSectionProps) {
  const sorted = [...flags].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Risk Flags</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {flags.length}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          No risk flags identified.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sorted.map((flag, idx) => {
            const style = SEVERITY_STYLES[flag.severity];
            return (
              <li
                key={`${flag.type}-${idx}`}
                className={`flex items-start gap-3 rounded-lg border p-4 ${style.card}`}
              >
                <span
                  className={`mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${style.badge}`}
                >
                  {style.label}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900">
                    {flag.type.replace(/_/g, " ")}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-700">{flag.message}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

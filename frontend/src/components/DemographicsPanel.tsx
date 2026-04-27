import type { Patient } from "../types/dashboard";

interface DemographicsPanelProps {
  patient: Patient;
}

function calculateAge(birthDate: string): number | null {
  if (!birthDate || birthDate === "Unknown") return null;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 0 ? age : null;
}

export default function DemographicsPanel({ patient }: DemographicsPanelProps) {
  const age = calculateAge(patient.birthDate);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          {patient.name}
        </h2>
        <p className="text-sm text-slate-500">
          Patient ID:{" "}
          <span className="font-mono text-slate-700">{patient.id}</span>
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Gender
          </dt>
          <dd className="mt-1 text-sm capitalize text-slate-900">
            {patient.gender}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Birth Date
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{patient.birthDate}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Age
          </dt>
          <dd className="mt-1 text-sm text-slate-900">
            {age !== null ? `${age} years` : "—"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

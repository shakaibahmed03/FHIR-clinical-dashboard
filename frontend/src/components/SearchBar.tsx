import { useState, type FormEvent } from "react";

interface SearchBarProps {
  onSearch: (patientId: string) => void;
  loading: boolean;
  initialValue?: string;
}

export default function SearchBar({
  onSearch,
  loading,
  initialValue = "",
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
    >
      <label htmlFor="patient-id" className="sr-only">
        Patient ID
      </label>
      <input
        id="patient-id"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="Enter HAPI FHIR patient ID (e.g. 592924)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      <button
        type="submit"
        disabled={loading || value.trim().length === 0}
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300"
      >
        {loading ? "Loading…" : "Search"}
      </button>
    </form>
  );
}

interface AISummaryBoxProps {
  summary: string;
}

export default function AISummaryBox({ summary }: AISummaryBoxProps) {
  return (
    <section className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          AI
        </span>
        <h2 className="text-lg font-semibold text-slate-900">
          Patient Summary
        </h2>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
        {summary}
      </p>
    </section>
  );
}

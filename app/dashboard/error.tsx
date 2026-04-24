"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-red-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-xl font-bold text-red-700">
          !
        </div>
        <h2 className="mt-6 text-xl font-bold text-slate-900">
          Dashboard unavailable
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
          {error.message ||
            "Could not load your dashboard. This may be a temporary issue with the database or cache."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

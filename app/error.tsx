"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
          !
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

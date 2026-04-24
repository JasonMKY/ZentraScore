export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="animate-pulse space-y-8">
        {/* Header skeleton */}
        <div className="border-b border-slate-200/80 pb-8">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="mt-3 h-8 w-64 rounded bg-slate-200" />
          <div className="mt-3 h-3 w-48 rounded bg-slate-200" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-24 rounded-full bg-slate-200" />
            <div className="h-6 w-40 rounded-full bg-slate-200" />
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-24 rounded-lg bg-slate-200" />
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="h-72 rounded-2xl bg-slate-200" />
          </div>
          <div className="lg:col-span-7">
            <div className="h-72 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-2 border-bg-border" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-lime-400 animate-spin" />
      </div>
      {label && <p className="text-xs font-mono text-ink-low">{label}</p>}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-bg-border bg-bg-surface p-5"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-lg bg-bg-raised animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded bg-bg-raised animate-pulse" />
              <div className="h-2.5 w-16 rounded bg-bg-raised animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="rounded-xl border border-bg-border bg-bg-raised/60 px-3 py-2.5">
                <div className="h-2 w-10 rounded bg-bg-border animate-pulse mb-2" />
                <div className="h-5 w-16 rounded bg-bg-border animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

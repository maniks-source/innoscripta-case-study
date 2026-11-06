type StatusPanelProps = {
  title: string
  description: string
}

export function StatusPanel({ title, description }: StatusPanelProps) {
  return (
    <div className="rounded-2xl border border-dashed border-rule bg-white px-6 py-16 text-center">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">{description}</p>
    </div>
  )
}

export function ArticleSkeleton() {
  return (
    <div className="grid gap-5" aria-hidden="true">
      <div className="h-72 animate-pulse rounded-2xl bg-chip" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-2xl bg-chip" />
        ))}
      </div>
    </div>
  )
}

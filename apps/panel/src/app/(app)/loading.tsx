export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Cargando…</span>
      <div className="g-skeleton h-9 w-1/3" />
      <div className="g-skeleton h-24 w-full" />
      <div className="g-skeleton h-24 w-full" />
      <div className="g-skeleton h-24 w-2/3" />
    </div>
  )
}

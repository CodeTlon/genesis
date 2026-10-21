export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="mx-auto max-w-5xl space-y-4 px-4 py-12">
      <span className="sr-only">Cargando…</span>
      <div className="g-skeleton h-10 w-1/2" />
      <div className="g-skeleton h-40 w-full" />
    </div>
  )
}

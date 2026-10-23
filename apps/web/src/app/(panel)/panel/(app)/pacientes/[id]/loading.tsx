/** Esqueleto de la ficha: volver, nombre, acciones, pestañas y un panel. */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Cargando la ficha…</span>
      <div className="g-skeleton h-12 w-32" />
      <div className="space-y-3"><div className="g-skeleton h-10 w-2/3 max-w-md" /><div className="g-skeleton h-6 w-40" /><div className="flex gap-3"><div className="g-skeleton h-12 w-44" /><div className="g-skeleton h-12 w-56" /></div></div>
      <div className="flex gap-4 border-b border-lila/60 pb-3">{[0, 1, 2, 3].map((i) => <div key={i} className="g-skeleton h-6 w-24" />)}</div>
      <div className="g-skeleton h-40 w-full" />
    </div>
  )
}

/** Esqueleto de la lista de pacientes: misma forma que la pantalla real, para que no salte al cargar. */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Cargando pacientes…</span>
      <div className="flex items-center justify-between"><div className="g-skeleton h-10 w-40" /><div className="g-skeleton h-12 w-44" /></div>
      <div className="g-skeleton h-12 w-full max-w-xl" />
      <div className="divide-y divide-lila/50 rounded-card bg-white shadow-soft">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="flex min-h-20 items-center justify-between px-4 py-3"><div className="space-y-2"><div className="g-skeleton h-6 w-48" /><div className="g-skeleton h-4 w-32" /></div><div className="g-skeleton size-6" /></div>)}
      </div>
    </div>
  )
}

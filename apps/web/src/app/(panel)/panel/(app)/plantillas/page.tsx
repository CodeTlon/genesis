import { TemplateTable, type TemplateRow } from '@/panel/components/template-table'
import { PROXIMAS, TEMPLATES } from '@/panel/lib/templates'

const AREA: Record<string, string> = { A: 'General', B: 'Podología', C: 'Estética' }

function Stat({ n, label }: { n: number | string; label: string }) {
  return <div className="rounded-card bg-white p-4 shadow-soft"><p className="text-3xl font-normal">{n}</p><p className="mt-1 text-sm">{label}</p></div>
}

export default function Plantillas() {
  const all = Object.values(TEMPLATES)
  const rows: TemplateRow[] = all.map((t) => ({ code: t.code, name: t.name, area: AREA[t.code] ?? 'General', version: t.version, basic: t.fields.filter((f) => !f.advanced).map((f) => f.label), extra: t.fields.filter((f) => f.advanced).map((f) => f.label), followupDays: t.followupDays }))
  return (
    <main>
      <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Plantillas de ficha</h1>
      <p className="mt-2 rounded-card bg-lila/50 p-3">Son <strong>propuestas</strong> para revisar juntas: cada profesional decide qué datos quiere en cada ficha. En la versión final se editan desde acá, sin tocar código, y cada ficha guarda con qué versión se completó.</p>

      <section aria-label="Resumen" className="g-stagger mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat n={all.length} label="plantillas propuestas" />
        <Stat n={all.reduce((n, t) => n + t.fields.length, 0)} label="campos en total" />
        <Stat n={all.filter((t) => t.followupDays).length} label="con control sugerido" />
        <Stat n={PROXIMAS.length} label="por proponer" />
      </section>

      <div className="mt-6"><TemplateTable rows={rows} /></div>

      <h2 className="mt-10 text-xl font-normal uppercase tracking-[0.06em]">Próximas plantillas propuestas</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {PROXIMAS.map((p) => <li key={p} className="rounded-control border border-dashed border-tinta/40 bg-white/60 px-4 py-3">{p}</li>)}
      </ul>
    </main>
  )
}

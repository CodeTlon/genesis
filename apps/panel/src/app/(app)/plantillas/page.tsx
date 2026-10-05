import { PROXIMAS, TEMPLATES, type Template } from '@/lib/templates'

const AREA: Record<string, string> = { A: 'General', B: 'Podología', C: 'Estética' }
const TYPE_LABEL: Record<string, string> = { text: 'texto', longtext: 'texto largo', number: 'número', bool: 'sí / no', select: 'opciones', multi: 'varias opciones', date: 'fecha', footmap: 'mapa de pies' }

function Stat({ n, label }: { n: number | string; label: string }) {
  return <div className="rounded-card bg-white p-4 shadow-soft"><p className="text-3xl font-normal">{n}</p><p className="mt-1 text-sm">{label}</p></div>
}

function Card({ t }: { t: Template }) {
  const basic = t.fields.filter((f) => !f.advanced)
  const extra = t.fields.filter((f) => f.advanced)
  return (
    <li className="flex h-full flex-col rounded-card bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-lila/60 px-3 py-0.5 text-sm font-semibold">{AREA[t.code] ?? 'General'}</span>
        <span className="rounded-full bg-amber-100 px-3 py-0.5 text-sm text-amber-950">Propuesta · versión {t.version}</span>
      </div>
      <h2 className="mt-3 text-xl font-semibold">{t.name}</h2>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-control bg-lila/20 p-2"><dt className="text-sm">Básicos</dt><dd className="text-xl">{basic.length}</dd></div>
        <div className="rounded-control bg-lila/20 p-2"><dt className="text-sm">Completos</dt><dd className="text-xl">{t.fields.length}</dd></div>
        <div className="rounded-control bg-lila/20 p-2"><dt className="text-sm">Control</dt><dd className="text-xl">{t.followupDays ? `${t.followupDays} d` : '—'}</dd></div>
      </dl>
      <p className="mt-4 font-semibold">Campos básicos</p>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {basic.map((f) => <li key={f.id} className="rounded-full bg-lila/40 px-3 py-0.5" title={TYPE_LABEL[f.type]}>{f.label}</li>)}
      </ul>
      {extra.length > 0 && (
        <details className="mt-4">
          <summary className="min-h-touch cursor-pointer py-2 underline decoration-dotted underline-offset-4">Ver los {extra.length} campos del modo completo</summary>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {extra.map((f) => <li key={f.id} className="rounded-full bg-neutral-100 px-3 py-0.5" title={TYPE_LABEL[f.type]}>{f.label}</li>)}
          </ul>
        </details>
      )}
    </li>
  )
}

export default function Plantillas() {
  const all = Object.values(TEMPLATES)
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

      <ul className="g-stagger mt-6 grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-3">
        {all.map((t) => <Card key={t.code} t={t} />)}
      </ul>

      <h2 className="mt-10 text-xl font-normal uppercase tracking-[0.06em]">Próximas plantillas propuestas</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {PROXIMAS.map((p) => <li key={p} className="rounded-control border border-dashed border-tinta/40 bg-white/60 px-4 py-3">{p}</li>)}
      </ul>
    </main>
  )
}

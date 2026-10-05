import { PROXIMAS, TEMPLATES } from '@/lib/templates'

export default function Plantillas() {
  return (
    <main>
      <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Plantillas de ficha</h1>
      <p className="mt-2 rounded-card bg-lila/50 p-3">Son <strong>propuestas</strong> para revisar juntas: Inés decide qué datos quiere en cada ficha. En la versión final se editan desde acá, sin tocar código, y cada ficha guarda con qué versión se completó.</p>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {Object.values(TEMPLATES).map((t) => (
          <li key={t.code} className="rounded-card bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">{t.code} · {t.name} <span className="text-sm font-normal">(versión {t.version}, propuesta)</span></h2>
            <p className="mt-2 text-sm">{t.fields.filter((f) => !f.advanced).length} campos en modo simple · {t.fields.length} en modo completo</p>
            <ul className="mt-2 flex flex-wrap gap-1 text-sm">
              {t.fields.map((f) => <li key={f.id} className={`rounded-full px-2 py-0.5 ${f.advanced ? 'bg-neutral-100' : 'bg-lila/50'}`}>{f.label}</li>)}
            </ul>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 text-xl font-normal uppercase tracking-[0.06em]">Próximas plantillas propuestas</h2>
      <ul className="mt-3 list-disc pl-5">{PROXIMAS.map((p) => <li key={p}>{p}</li>)}</ul>
    </main>
  )
}

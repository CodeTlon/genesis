import Link from 'next/link'
import { BarList, ColumnChart, type Series } from '@/components/charts'
import { todayKey } from '@/lib/dates'
import { historyRows, PROFESSIONALS, SERVICES } from '@/lib/store'

export const dynamic = 'force-dynamic'

const DAY = 86_400_000
const t = (d: string) => new Date(`${d}T12:00:00`).getTime()
const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)

export default async function Resumen({ searchParams }: { searchParams: Promise<{ pro?: string }> }) {
  const { pro } = await searchParams
  const sel = PROFESSIONALS.find((p) => p.id === pro)
  const all = historyRows()
  const rows = sel ? all.filter((r) => r.professionalId === sel.id) : all
  const series: Series[] = (sel ? [sel] : PROFESSIONALS).map((p) => ({ name: p.name, color: p.color }))
  const today = t(todayKey())

  // 8 semanas (la más vieja primero), contando turnos atendidos
  const weeks = Array.from({ length: 8 }, (_, i) => 7 - i)
  const weekLabel = (w: number) => { const d = new Date(today - (w * 7 + 6) * DAY); return `${d.getDate()}/${d.getMonth() + 1}` }
  const weekOf = (day: string) => Math.floor((today - t(day) - DAY) / (7 * DAY))
  const perWeek = series.map((s, si) => {
    const pid = (sel ?? PROFESSIONALS[si]).id
    return weeks.map((w) => all.filter((r) => r.professionalId === pid && r.status === 'done' && weekOf(r.day) === w).length)
  })

  const done = rows.filter((r) => r.status === 'done').length
  const noShow = rows.filter((r) => r.status === 'no_show').length
  const cancelled = rows.filter((r) => r.status === 'cancelled').length
  const patientsCount = new Set(rows.map((r) => r.patientId)).size
  const days = new Set(rows.map((r) => r.day)).size

  const byService = SERVICES.map((s) => {
    const owner = PROFESSIONALS.find((p) => p.area === s.area)!
    return { label: s.name, value: rows.filter((r) => r.serviceId === s.id && r.status === 'done').length, color: owner.color, owner: owner.name }
  }).filter((i) => i.value > 0).sort((a, b) => b.value - a.value).slice(0, 6)

  const dowOrder = [1, 2, 3, 4, 5, 6]
  const perDow = series.map((_, si) => {
    const pid = (sel ?? PROFESSIONALS[si]).id
    return dowOrder.map((d) => all.filter((r) => r.professionalId === pid && r.status === 'done' && new Date(`${r.day}T12:00:00`).getDay() === d).length)
  })

  const tab = (on: boolean) => `min-h-touch inline-flex items-center rounded-full border px-5 transition-colors ${on ? 'border-violeta-oscuro bg-violeta-oscuro text-white' : 'border-tinta/60 bg-white hover:bg-lila/40'}`
  const kpis = [
    { n: done, label: 'turnos atendidos' },
    { n: `${pct(done, rows.length)}%`, label: 'de los turnos se atendieron' },
    { n: `${pct(noShow + cancelled, rows.length)}%`, label: 'ausentes o cancelados', warn: pct(noShow + cancelled, rows.length) > 15 },
    { n: patientsCount, label: 'pacientes distintos' },
    { n: days ? (done / days).toFixed(1).replace('.', ',') : '0', label: 'atendidos por día' },
  ]

  return (
    <main>
      <h1 className="text-3xl font-normal uppercase tracking-[0.08em]">Resumen</h1>
      <p className="mt-1">Últimas 8 semanas. Datos de práctica, no son reales.</p>

      <nav aria-label="Filtrar por profesional" className="mt-5 flex flex-wrap gap-2">
        <Link href="/resumen" aria-current={!sel ? 'page' : undefined} className={tab(!sel)}>Todo el equipo</Link>
        {PROFESSIONALS.map((p) => (
          <Link key={p.id} href={`/resumen?pro=${p.id}`} aria-current={sel?.id === p.id ? 'page' : undefined} className={tab(sel?.id === p.id)}>{p.name}</Link>
        ))}
      </nav>

      <section aria-label="Indicadores" className="g-stagger mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-card p-4 shadow-soft ${k.warn ? 'bg-amber-100 text-amber-950' : 'bg-white'}`}>
            <p className="text-3xl font-normal">{k.n}</p>
            <p className="mt-1 text-sm">{k.label}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-card bg-white p-5 shadow-soft lg:col-span-2">
          <ColumnChart title="Turnos atendidos por semana" unit="turnos" categories={weeks.map(weekLabel)} series={series} values={perWeek} />
        </section>
        <section className="rounded-card bg-white p-5 shadow-soft">
          <BarList title="Servicios más atendidos" unit="turnos" items={byService} series={series} />
        </section>
        <section className="rounded-card bg-white p-5 shadow-soft">
          <ColumnChart title="Turnos atendidos por día de la semana" unit="turnos" categories={dowOrder.map((d) => DOW[d])} series={series} values={perDow} />
        </section>
      </div>
    </main>
  )
}

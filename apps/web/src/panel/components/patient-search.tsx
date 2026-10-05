'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AlertBadges } from './alert-badges'
import { IconChevronDown, IconChevronUp } from './icons'
import { ALERT_LABEL, type Alert } from '@/panel/lib/types'

export type PatientRow = { id: string; name: string; dni: string; phone: string; age: number; alerts: Alert[]; visits: number; nextLabel: string; nextTs: number; search: string }

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Distancia de edición ≤ 1 sobre cada palabra: tolera tildes y errores de tipeo ("Gonzalez" ≈ "González"). */
function near(word: string, token: string) {
  if (word.includes(token)) return true
  if (token.length < 4) return false
  for (const w of word.split(' ')) {
    if (Math.abs(w.length - token.length) > 1) continue
    let i = 0, j = 0, edits = 0
    while (i < w.length && j < token.length) {
      if (w[i] === token[j]) { i++; j++; continue }
      if (++edits > 1) break
      if (w.length > token.length) i++
      else if (w.length < token.length) j++
      else { i++; j++ }
    }
    edits += (w.length - i) + (token.length - j)
    if (edits <= 1) return true
  }
  return false
}

export function PatientSearch({ rows }: { rows: PatientRow[] }) {
  const [q, setQ] = useState('')
  const [only, setOnly] = useState<Alert | 'any' | null>(null)
  const [view, setView] = useState<'tabla' | 'tarjetas'>('tabla')
  const [sort, setSort] = useState<{ key: 'name' | 'age' | 'visits' | 'next'; dir: 1 | -1 }>({ key: 'name', dir: 1 })
  const present = useMemo(() => [...new Set(rows.flatMap((r) => r.alerts))], [rows])
  const filtered = useMemo(() => {
    const tokens = norm(q).split(/\s+/).filter(Boolean)
    return rows.filter((r) =>
      tokens.every((t) => near(r.search, t)) &&
      (only === null || (only === 'any' ? r.alerts.length > 0 : r.alerts.includes(only))))
  }, [q, rows, only])
  const sorted = useMemo(() => {
    const val = (r: PatientRow) => (sort.key === 'name' ? r.name : sort.key === 'age' ? r.age : sort.key === 'visits' ? r.visits : r.nextTs || Infinity)
    return [...filtered].sort((a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * sort.dir })
  }, [filtered, sort])
  const toggle = (key: typeof sort.key) => setSort((s0) => (s0.key === key ? { key, dir: (s0.dir * -1) as 1 | -1 } : { key, dir: 1 }))
  const th = (key: typeof sort.key, label: string) => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'} className="px-4 py-3 text-left font-semibold">
      <button type="button" onClick={() => toggle(key)} className="inline-flex min-h-touch items-center gap-1 hover:underline">
        {label}{sort.key === key && (sort.dir === 1 ? <IconChevronUp className="size-4" /> : <IconChevronDown className="size-4" />)}
      </button>
    </th>
  )
  const chip = (on: boolean) => `min-h-touch rounded-full border px-4 transition-colors ${on ? 'border-violeta-oscuro bg-violeta-oscuro text-white' : 'border-tinta/60 bg-white hover:bg-lila/40'}`

  return (
    <div className="min-w-0">
      <label htmlFor="q" className="font-semibold">Buscar por nombre, DNI o teléfono</label>
      <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: gonzalez, 351…, 00.000.0…"
        className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4" />
      <div role="group" aria-label="Filtrar por alerta" className="mt-4 flex flex-wrap gap-2">
        <button type="button" aria-pressed={only === null} onClick={() => setOnly(null)} className={chip(only === null)}>Todos ({rows.length})</button>
        <button type="button" aria-pressed={only === 'any'} onClick={() => setOnly(only === 'any' ? null : 'any')} className={chip(only === 'any')}>Con alertas ({rows.filter((r) => r.alerts.length).length})</button>
        {present.map((a) => (
          <button key={a} type="button" aria-pressed={only === a} onClick={() => setOnly(only === a ? null : a)} className={chip(only === a)}>{ALERT_LABEL[a]}</button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite">{filtered.length} {filtered.length === 1 ? 'paciente' : 'pacientes'}</p>
        <div role="group" aria-label="Vista" className="inline-flex overflow-hidden rounded-control border border-violeta-oscuro">
          {(['tabla', 'tarjetas'] as const).map((v) => <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={`min-h-touch px-4 capitalize transition-colors ${view === v ? 'bg-violeta-oscuro text-white' : 'bg-white text-violeta-oscuro hover:bg-lila/40'}`}>{v}</button>)}
        </div>
      </div>

      {view === 'tabla' ? (
        <div className="relative mt-4 overflow-x-auto rounded-card bg-white shadow-soft">
          <table className="w-full min-w-[36rem] text-left">
            <caption className="sr-only">Lista de pacientes</caption>
            <thead className="border-b border-lila/60 bg-lila/20">
              <tr>
                {th('name', 'Paciente')}{th('age', 'Edad')}
                <th scope="col" className="hidden px-4 py-3 font-semibold 2xl:table-cell">DNI</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold lg:table-cell">Teléfono</th>
                <th scope="col" className="px-4 py-3 font-semibold">Alertas</th>
                {th('visits', 'Atenciones')}{th('next', 'Próximo turno')}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="border-b border-lila/30 transition-colors last:border-0 hover:bg-lila/20">
                  <td className="px-4 py-2 whitespace-nowrap"><Link href={`/panel/pacientes/${r.id}`} className="inline-flex min-h-touch items-center gap-3 font-semibold hover:underline"><span aria-hidden className="grid size-9 flex-none place-items-center rounded-full bg-lila/60 text-sm">{r.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>{r.name}</Link></td>
                  <td className="px-4 py-2">{r.age}</td>
                  <td className="hidden px-4 py-2 whitespace-nowrap 2xl:table-cell">{r.dni}</td>
                  <td className="hidden px-4 py-2 whitespace-nowrap lg:table-cell">{r.phone}</td>
                  <td className="px-4 py-2">{r.alerts.length ? <AlertBadges alerts={r.alerts} compact max={3} /> : <span className="text-tinta/60">—</span>}</td>
                  <td className="px-4 py-2">{r.visits}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.nextLabel || <span className="text-tinta/60">Sin turno</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
      <ul className="g-stagger mt-4 grid auto-rows-fr gap-4 md:grid-cols-2">
        {sorted.map((r) => (
          <li key={r.id} className="h-full">
            <Link href={`/panel/pacientes/${r.id}`} className="flex h-full min-h-28 items-start gap-4 rounded-card bg-white p-4 shadow-soft transition-shadow hover:ring-2 hover:ring-violeta-oscuro">
              <span aria-hidden className="grid size-12 flex-none place-items-center rounded-full bg-lila/60 font-semibold text-tinta">{r.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-semibold">{r.name}</span>
                <span className="block truncate">{r.age} años · DNI {r.dni}</span>
                <span className="block truncate">{r.nextLabel ? `Próximo turno: ${r.nextLabel}` : 'Sin turno'}</span>
              </span>
              <span className="flex min-h-6 flex-none items-start"><AlertBadges alerts={r.alerts} compact max={3} /></span>
            </Link>
          </li>
        ))}
      </ul>
      )}
      {!filtered.length && <p className="mt-6">No encontramos pacientes con esa búsqueda. Revisá cómo lo escribiste.</p>}
    </div>
  )
}

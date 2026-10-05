'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AlertBadges } from './alert-badges'
import { ALERT_LABEL, type Alert } from '@/lib/types'

export type PatientRow = { id: string; name: string; dni: string; phone: string; age: number; alerts: Alert[]; search: string }

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
  const present = useMemo(() => [...new Set(rows.flatMap((r) => r.alerts))], [rows])
  const filtered = useMemo(() => {
    const tokens = norm(q).split(/\s+/).filter(Boolean)
    return rows.filter((r) =>
      tokens.every((t) => near(r.search, t)) &&
      (only === null || (only === 'any' ? r.alerts.length > 0 : r.alerts.includes(only))))
  }, [q, rows, only])
  const chip = (on: boolean) => `min-h-touch rounded-full border px-4 transition-colors ${on ? 'border-violeta-oscuro bg-violeta-oscuro text-white' : 'border-tinta/60 bg-white hover:bg-lila/40'}`

  return (
    <div>
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
      <p className="mt-3" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'paciente' : 'pacientes'}</p>
      <ul className="g-stagger mt-4 grid auto-rows-fr gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((r) => (
          <li key={r.id} className="h-full">
            <Link href={`/pacientes/${r.id}`} className="flex h-full min-h-28 items-start gap-4 rounded-card bg-white p-4 shadow-soft transition-shadow hover:ring-2 hover:ring-violeta-oscuro">
              <span aria-hidden className="grid size-12 flex-none place-items-center rounded-full bg-lila/60 font-semibold text-tinta">{r.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-semibold">{r.name}</span>
                <span className="block truncate">{r.age} años · DNI {r.dni}</span>
                <span className="block truncate">Tel. {r.phone}</span>
              </span>
              <span className="flex min-h-6 flex-none items-start"><AlertBadges alerts={r.alerts} compact max={3} /></span>
            </Link>
          </li>
        ))}
      </ul>
      {!filtered.length && <p className="mt-6">No encontramos pacientes con esa búsqueda. Revisá cómo lo escribiste.</p>}
    </div>
  )
}

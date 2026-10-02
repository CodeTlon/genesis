'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AlertBadges } from './alert-badges'
import type { Alert } from '@/lib/types'

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
  const filtered = useMemo(() => {
    const tokens = norm(q).split(/\s+/).filter(Boolean)
    if (!tokens.length) return rows
    return rows.filter((r) => tokens.every((t) => near(r.search, t)))
  }, [q, rows])

  return (
    <div>
      <label htmlFor="q" className="font-semibold">Buscar por nombre, DNI o teléfono</label>
      <input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: gonzalez, 351…, 00.000.0…"
        className="mt-1 block min-h-touch w-full rounded-control border border-tinta/40 bg-white px-4" />
      <p className="mt-2 text-sm" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'paciente' : 'pacientes'}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {filtered.map((r) => (
          <li key={r.id}>
            <Link href={`/pacientes/${r.id}`} className="block rounded-card bg-white p-4 shadow-soft hover:ring-2 hover:ring-violeta">
              <p className="text-lg font-semibold">{r.name}</p>
              <p>{r.age} años · DNI {r.dni} · Tel. {r.phone}</p>
              <div className="mt-2"><AlertBadges alerts={r.alerts} /></div>
            </Link>
          </li>
        ))}
      </ul>
      {!filtered.length && <p className="mt-6">No encontramos pacientes con esa búsqueda. Revisá cómo lo escribiste.</p>}
    </div>
  )
}

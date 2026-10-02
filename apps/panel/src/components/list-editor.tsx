'use client'
import { useState } from 'react'

type Item = Record<string, string>
export type ListField = { key: string; label: string; textarea?: boolean }

/** Lista editable (agregar / quitar / ordenar). Se envía como JSON en un input oculto. */
export function ListEditor({ name, initial, fields, addLabel, itemLabel }: { name: string; initial: Item[]; fields: ListField[]; addLabel: string; itemLabel: string }) {
  const [items, setItems] = useState<Item[]>(initial.map((i) => ({ ...i })))
  const set = (i: number, k: string, v: string) => setItems((p) => p.map((it, j) => (j === i ? { ...it, [k]: v } : it)))
  const swap = (i: number, d: -1 | 1) => setItems((p) => { const a = [...p]; const j = i + d; if (j < 0 || j >= a.length) return p; [a[i], a[j]] = [a[j], a[i]]; return a })
  const empty = () => Object.fromEntries(fields.map((f) => [f.key, '']))

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <ol className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="rounded-card border border-lila/70 bg-white p-4">
            <p className="mb-2 text-sm font-semibold">{itemLabel} {i + 1}</p>
            <div className="grid gap-3">
              {fields.map((f) => (
                <label key={f.key} className="block text-sm">{f.label}
                  {f.textarea
                    ? <textarea value={it[f.key] ?? ''} onChange={(e) => set(i, f.key, e.target.value)} rows={3} className="mt-1 block w-full rounded-control border border-tinta/40 bg-white px-3 py-2 text-base" />
                    : <input value={it[f.key] ?? ''} onChange={(e) => set(i, f.key, e.target.value)} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/40 bg-white px-3 text-base" />}
                </label>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => swap(i, -1)} disabled={i === 0} aria-label={`Subir ${itemLabel} ${i + 1}`} className="min-h-touch rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro disabled:opacity-40">↑ Subir</button>
              <button type="button" onClick={() => swap(i, 1)} disabled={i === items.length - 1} aria-label={`Bajar ${itemLabel} ${i + 1}`} className="min-h-touch rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro disabled:opacity-40">↓ Bajar</button>
              <button type="button" onClick={() => setItems((p) => p.filter((_, j) => j !== i))} className="min-h-touch rounded-control border border-red-800 px-4 text-red-900">Quitar</button>
            </div>
          </li>
        ))}
      </ol>
      {!items.length && <p className="text-sm">Todavía no hay elementos.</p>}
      <button type="button" onClick={() => setItems((p) => [...p, empty()])} className="mt-3 min-h-touch rounded-control bg-lila/60 px-5">{addLabel}</button>
    </div>
  )
}

'use client'
import { useId, useState } from 'react'

export type Series = { name: string; color: string }

/** Máximo del eje con 4 intervalos de números redondos (0, 10, 20, 30, 40 y no 0, 13, 25, 38, 50). */
const niceMax = (v: number) => {
  const step = [1, 2, 5, 10, 15, 20, 25, 50, 100, 200, 500].find((s) => s * 4 >= v) ?? Math.ceil(v / 4)
  return step * 4
}

/** Texto en tinta (nunca del color de la serie); el color solo lo lleva la marca. */
function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null
  return (
    <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1" aria-label="Referencias">
      {series.map((s) => (
        <li key={s.name} className="flex items-center gap-2"><span aria-hidden className="size-3 rounded-sm" style={{ background: s.color }} />{s.name}</li>
      ))}
    </ul>
  )
}

function DataTable({ head, rows, caption }: { head: string[]; rows: (string | number)[][]; caption: string }) {
  return (
    <details className="mt-4">
      <summary className="min-h-touch cursor-pointer py-2 underline decoration-dotted underline-offset-4">Ver como tabla</summary>
      <div className="relative overflow-x-auto">
        <table className="mt-2 w-full text-left">
          <caption className="sr-only">{caption}</caption>
          <thead><tr>{head.map((h) => <th key={h} scope="col" className="border-b border-tinta/30 py-2 pr-4 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-lila/50 py-2 pr-4">{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </details>
  )
}

/** Columnas agrupadas: una serie por profesional. Una sola escala (nunca doble eje). */
export function ColumnChart({ title, categories, series, values, unit }: {
  title: string; categories: string[]; series: Series[]; values: number[][]; unit: string
}) {
  const id = useId()
  const [tip, setTip] = useState<{ c: number; s: number } | null>(null)
  const max = niceMax(Math.max(1, ...values.flat()))
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i)
  return (
    <figure aria-labelledby={id}>
      <figcaption id={id} className="text-lg font-semibold">{title}</figcaption>
      <div className="mt-2"><Legend series={series} /></div>
      <div className="flex gap-2">
        <div aria-hidden className="relative h-56 w-8 flex-none text-sm">
          {ticks.map((t) => <span key={t} className="absolute right-0 translate-y-1/2" style={{ bottom: `${(t / max) * 100}%` }}>{t}</span>)}
        </div>
        <div className="relative h-56 min-w-0 flex-1" onMouseLeave={() => setTip(null)}>
          {ticks.map((t) => <div key={t} aria-hidden className="absolute inset-x-0 border-t border-tinta/15" style={{ bottom: `${(t / max) * 100}%` }} />)}
          <ul className="absolute inset-0 flex items-end justify-around">
            {categories.map((cat, c) => (
              <li key={cat} className="flex h-full flex-1 items-end justify-center gap-0.5 px-0.5">
                {series.map((s, si) => {
                  const v = values[si][c]
                  const on = tip?.c === c && tip.s === si
                  return (
                    <div key={s.name} tabIndex={0} role="img" aria-label={`${s.name}, ${cat}: ${v} ${unit}`}
                      onMouseEnter={() => setTip({ c, s: si })} onFocus={() => setTip({ c, s: si })} onBlur={() => setTip(null)}
                      className="relative w-full max-w-5 rounded-t-[4px] outline-none transition-[filter,height] duration-300 focus-visible:ring-2 focus-visible:ring-tinta"
                      style={{ height: `${(v / max) * 100}%`, background: s.color, filter: on ? 'brightness(1.12)' : undefined }}>
                      {on && (
                        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-control bg-tinta px-3 py-1.5 text-sm text-marmol shadow-soft">
                          {s.name} · {cat}: <strong>{v}</strong> {unit}
                        </span>
                      )}
                    </div>
                  )
                })}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="ml-10 mt-1 flex justify-around text-sm" aria-hidden>
        {categories.map((c) => <span key={c} className="flex-1 text-center">{c}</span>)}
      </div>
      <DataTable caption={title} head={['Semana', ...series.map((s) => s.name)]} rows={categories.map((c, i) => [c, ...series.map((_, si) => values[si][i])])} />
    </figure>
  )
}

/** Barras horizontales con el valor al final (etiqueta directa). El color identifica a la profesional. */
export function BarList({ title, items, unit, series, columns = ['Servicio', 'Profesional', 'Cantidad'] }: {
  title: string; columns?: [string, string, string]; items: { label: string; value: number; color: string; owner: string }[]; unit: string; series: Series[]
}) {
  const id = useId()
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <figure aria-labelledby={id}>
      <figcaption id={id} className="text-lg font-semibold">{title}</figcaption>
      <div className="mt-2"><Legend series={series} /></div>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.label} title={`${i.label}: ${i.value} ${unit}`}>
            <div className="flex items-baseline justify-between gap-3"><span className="min-w-0 truncate">{i.label}</span><span className="font-semibold tabular-nums">{i.value}</span></div>
            <div className="mt-1 h-3 rounded-full bg-lila/30"><div className="h-3 rounded-full transition-[width] duration-500" style={{ width: `${(i.value / max) * 100}%`, background: i.color }} /></div>
          </li>
        ))}
      </ul>
      <DataTable caption={title} head={columns} rows={items.map((i) => [i.label, i.owner, i.value])} />
    </figure>
  )
}

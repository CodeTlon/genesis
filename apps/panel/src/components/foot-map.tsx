'use client'
import { Fragment, useState } from 'react'
import { FOOT_FINDINGS } from '@/lib/templates'
import type { FootMarker } from '@/lib/types'

type Side = 'left' | 'right'
type View = 'plantar' | 'dorsal'
type Sel = { side: Side; zone: string } | null

const SEV_FILL = { 1: '#f5c84b', 2: '#f08a3c', 3: '#d64545' } as const
const SEV_LABEL = { 1: 'Leve', 2: 'Moderada', 3: 'Intensa' } as const

// Geometría de cada zona (viewBox 0 0 200 420). Toes numerados 1 (hallux) a 5.
const TOES: Record<string, { cx: number; cy: number; r: number }> = {
  'Dedo 1': { cx: 52, cy: 62, r: 26 }, 'Dedo 2': { cx: 94, cy: 44, r: 17 }, 'Dedo 3': { cx: 124, cy: 52, r: 15 },
  'Dedo 4': { cx: 150, cy: 66, r: 13 }, 'Dedo 5': { cx: 171, cy: 88, r: 11 },
}
const BODY: Record<View, Record<string, string>> = {
  plantar: {
    Metatarsos: 'M28 112 Q100 92 182 112 L176 196 Q100 212 36 196 Z',
    Arco: 'M44 204 Q100 218 168 204 L160 290 Q104 300 58 290 Z',
    Talón: 'M62 298 Q108 308 158 298 Q156 392 108 400 Q60 392 62 298 Z',
  },
  dorsal: {
    Empeine: 'M30 112 Q100 94 182 112 L170 290 Q104 304 52 290 Z',
    Tobillo: 'M54 298 Q108 310 164 298 Q158 396 108 404 Q58 396 54 298 Z',
  },
}

export function FootMap({ markers, onChange }: { markers: FootMarker[]; onChange: (m: FootMarker[]) => void }) {
  const [view, setView] = useState<View>('plantar')
  const [sel, setSel] = useState<Sel>(null)
  const [finding, setFinding] = useState(FOOT_FINDINGS[0])
  const [severity, setSeverity] = useState<1 | 2 | 3>(1)
  const [note, setNote] = useState('')

  const find = (side: Side, zone: string) => markers.find((m) => m.side === side && m.view === view && m.zone === zone)

  function pick(side: Side, zone: string) {
    const m = find(side, zone)
    setSel({ side, zone })
    setFinding(m?.finding ?? FOOT_FINDINGS[0]); setSeverity(m?.severity ?? 1); setNote(m?.note ?? '')
  }
  function save() {
    if (!sel) return
    const rest = markers.filter((m) => !(m.side === sel.side && m.view === view && m.zone === sel.zone))
    onChange([...rest, { side: sel.side, view, zone: sel.zone, finding, severity, note: note.trim() || undefined }])
    setSel(null)
  }
  function remove() {
    if (!sel) return
    onChange(markers.filter((m) => !(m.side === sel.side && m.view === view && m.zone === sel.zone)))
    setSel(null)
  }

  const Zone = ({ side, zone, children }: { side: Side; zone: string; children: (fill: string) => React.ReactNode }) => {
    const m = find(side, zone)
    const selected = sel?.side === side && sel.zone === zone
    const label = `${side === 'left' ? 'Pie izquierdo' : 'Pie derecho'}, ${zone}${m ? `: ${m.finding}, ${SEV_LABEL[m.severity]}` : ''}`
    return (
      <g role="button" tabIndex={0} aria-label={label} aria-pressed={selected} className="cursor-pointer outline-none [&:focus-visible>*]:stroke-[5] [&:focus-visible>*]:stroke-violeta-oscuro"
        onClick={() => pick(side, zone)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(side, zone) } }}>
        {children(m ? SEV_FILL[m.severity] : selected ? '#c9a7eb' : '#f4e6dc')}
      </g>
    )
  }

  const Foot = ({ side }: { side: Side }) => (
    <figure className="text-center">
      <svg viewBox="0 0 200 420" className="mx-auto h-60 w-auto sm:h-72 touch-manipulation" role="group" aria-label={side === 'left' ? 'Pie izquierdo' : 'Pie derecho'}>
        <g transform={side === 'left' ? 'translate(200 0) scale(-1 1)' : undefined}>
          {Object.entries(BODY[view]).map(([zone, d]) => (
            <Fragment key={zone}>{Zone({ side, zone, children: (fill) => <path d={d} fill={fill} stroke="#5b4a40" strokeWidth={2} /> })}</Fragment>
          ))}
          {Object.entries(TOES).map(([zone, t]) => (
            <Fragment key={zone}>{Zone({ side, zone, children: (fill) => <circle cx={t.cx} cy={t.cy} r={t.r} fill={fill} stroke="#5b4a40" strokeWidth={2} /> })}</Fragment>
          ))}
        </g>
      </svg>
      <figcaption className="font-semibold">{side === 'left' ? 'Pie izquierdo' : 'Pie derecho'}</figcaption>
    </figure>
  )

  const list = markers.filter((m) => m.view === view)
  return (
    <div className="rounded-card bg-white p-4 shadow-soft">
      <div role="tablist" aria-label="Vista del pie" className="mb-3 flex gap-2">
        {(['plantar', 'dorsal'] as const).map((v) => (
          <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => { setView(v); setSel(null) }}
            className={`min-h-touch rounded-control px-5 ${view === v ? 'bg-violeta-oscuro text-white' : 'border border-violeta-oscuro text-violeta-oscuro'}`}>
            {v === 'plantar' ? 'Planta' : 'Dorso'}
          </button>
        ))}
      </div>
      <p className="mb-2 text-sm">Tocá una zona para marcar un hallazgo. Desde el teclado: Tab para moverte y Enter para elegir.</p>
      <div className="grid grid-cols-2 gap-2">
        {Foot({ side: 'left' })}
        {Foot({ side: 'right' })}
      </div>

      <ul className="mt-2 flex flex-wrap gap-3 text-sm" aria-label="Referencias de gravedad">
        {([1, 2, 3] as const).map((s) => <li key={s} className="flex items-center gap-1"><span aria-hidden className="size-4 rounded-full" style={{ background: SEV_FILL[s] }} />{SEV_LABEL[s]}</li>)}
      </ul>

      {sel && (
        <div className="mt-4 space-y-3 rounded-card border border-violeta-oscuro/40 p-4" role="group" aria-label="Detalle de la zona">
          <p className="font-semibold">{sel.side === 'left' ? 'Pie izquierdo' : 'Pie derecho'} · {view === 'plantar' ? 'planta' : 'dorso'} · {sel.zone}</p>
          <label className="block">Hallazgo
            <select value={finding} onChange={(e) => setFinding(e.target.value)} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-3">
              {FOOT_FINDINGS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>
          <fieldset>
            <legend>Gravedad</legend>
            <div className="mt-1 flex gap-2">
              {([1, 2, 3] as const).map((s) => (
                <label key={s} className={`flex min-h-touch cursor-pointer items-center gap-2 rounded-control border px-4 ${severity === s ? 'border-violeta-oscuro bg-lila/50' : 'border-tinta/30'}`}>
                  <input type="radio" name="sev" checked={severity === s} onChange={() => setSeverity(s)} />{SEV_LABEL[s]}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block">Nota (opcional)
            <input value={note} placeholder="Ej: núcleo central, duele al apoyar" onChange={(e) => setNote(e.target.value)} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 px-3" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} className="min-h-touch rounded-control bg-violeta-oscuro px-5 text-white">Guardar marca</button>
            {find(sel.side, sel.zone) && <button type="button" onClick={remove} className="min-h-touch rounded-control border border-red-800 px-5 text-red-900">Quitar marca</button>}
            <button type="button" onClick={() => setSel(null)} className="min-h-touch rounded-control px-5 underline">Cancelar</button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="font-semibold">Marcas ({list.length})</p>
        <ul className="mt-1 space-y-1">
          {list.map((m, i) => <li key={i}>{m.side === 'left' ? 'Izq.' : 'Der.'} · {m.zone}: {m.finding} ({SEV_LABEL[m.severity]}){m.note ? ` — ${m.note}` : ''}</li>)}
          {!list.length && <li>Sin marcas en esta vista.</li>}
        </ul>
      </div>
    </div>
  )
}

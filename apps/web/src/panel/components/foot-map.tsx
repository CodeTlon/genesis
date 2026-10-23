'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { FOOT_FINDINGS } from '@/panel/lib/templates'
import { FOOT_TYPE_HINT, FOOT_TYPE_LABEL, type FootMarker, type FootType } from '@/panel/lib/types'

type Side = 'left' | 'right'
type View = 'plantar' | 'dorsal'
type Sel = { side: Side; zone: string } | null
type Toe = { cx: number; cy: number; r: number }

const SEV_FILL = { 1: '#f5c84b', 2: '#f08a3c', 3: '#d64545' } as const
const SEV_LABEL = { 1: 'Leve', 2: 'Moderada', 3: 'Intensa' } as const
const STATE_LABEL = { a_tratar: 'A tratar', tratado: 'Tratado' } as const
const TREATED_FILL = '#3f9d6b'
const EMPTY_FILL = '#f3eef9'

// Silueta de un pie derecho visto desde la planta (viewBox 0 10 200 410; el dedo gordo queda a la izquierda).
// El pie izquierdo es el espejo. La curva interna de la izquierda es el arco.
const OUTLINE = 'M40 112 C30 150 40 190 58 235 C70 270 66 300 60 330 C56 375 80 408 112 408 C146 408 166 375 162 330 C160 290 176 250 184 200 C192 160 190 130 184 112 C150 90 90 86 40 112 Z'

// El tipo de pie cambia el largo relativo de los dedos (Dedo 1 = dedo gordo).
const TOES: Record<FootType, Record<string, Toe>> = {
  egipcio: { 'Dedo 1': { cx: 52, cy: 58, r: 26 }, 'Dedo 2': { cx: 96, cy: 62, r: 18 }, 'Dedo 3': { cx: 128, cy: 72, r: 16 }, 'Dedo 4': { cx: 153, cy: 85, r: 15 }, 'Dedo 5': { cx: 174, cy: 100, r: 14 } },
  griego: { 'Dedo 1': { cx: 52, cy: 70, r: 24 }, 'Dedo 2': { cx: 96, cy: 36, r: 18 }, 'Dedo 3': { cx: 128, cy: 52, r: 16 }, 'Dedo 4': { cx: 153, cy: 70, r: 15 }, 'Dedo 5': { cx: 174, cy: 92, r: 14 } },
  romano: { 'Dedo 1': { cx: 52, cy: 56, r: 25 }, 'Dedo 2': { cx: 96, cy: 52, r: 18 }, 'Dedo 3': { cx: 128, cy: 56, r: 16 }, 'Dedo 4': { cx: 153, cy: 72, r: 15 }, 'Dedo 5': { cx: 174, cy: 92, r: 14 } },
}
// Zonas del cuerpo del pie: franjas recortadas por la silueta. `at` es donde va el rótulo.
const BODY: Record<View, { zone: string; d: string; at: [number, number] }[]> = {
  plantar: [
    { zone: 'Metatarsos', d: 'M0 60 H200 V205 Q100 224 0 205 Z', at: [112, 160] },
    { zone: 'Arco', d: 'M0 205 Q100 224 200 205 V296 Q100 314 0 296 Z', at: [120, 258] },
    { zone: 'Talón', d: 'M0 296 Q100 314 200 296 V420 H0 Z', at: [112, 356] },
  ],
  dorsal: [
    { zone: 'Empeine', d: 'M0 60 H200 V296 Q100 314 0 296 Z', at: [112, 190] },
    { zone: 'Tobillo', d: 'M0 296 Q100 314 200 296 V420 H0 Z', at: [112, 356] },
  ],
}

const sideLabel = (s: Side) => (s === 'left' ? 'Pie izquierdo' : 'Pie derecho')

export function FootMap({ footType, onFootType, markers, onChange }: {
  footType: FootType | undefined; onFootType: (t: FootType) => void
  markers: FootMarker[]; onChange: (m: FootMarker[]) => void
}) {
  const type: FootType = footType ?? 'egipcio'
  const uid = useId().replace(/:/g, '')
  const [view, setView] = useState<View>('plantar')
  // En el celular se muestra un pie a la vez, bien grande; desde 768px los dos juntos.
  const [shown, setShown] = useState<Side>('right')
  const [sel, setSel] = useState<Sel>(null)
  const [finding, setFinding] = useState(FOOT_FINDINGS[0])
  const [severity, setSeverity] = useState<1 | 2 | 3>(1)
  const [state, setState] = useState<'a_tratar' | 'tratado'>('a_tratar')
  const [note, setNote] = useState('')
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => { if (sel) panel.current?.scrollIntoView({ block: 'center' }) }, [sel])

  const find = (side: Side, zone: string) => markers.find((m) => m.side === side && m.view === view && m.zone === zone)
  const same = (m: FootMarker, s: NonNullable<Sel>) => m.side === s.side && m.view === view && m.zone === s.zone

  function pick(side: Side, zone: string) {
    const m = find(side, zone)
    setSel({ side, zone })
    setFinding(m?.finding ?? FOOT_FINDINGS[0]); setSeverity(m?.severity ?? 1); setState(m?.state ?? 'a_tratar'); setNote(m?.note ?? '')
  }
  function save() {
    if (!sel) return
    onChange([...markers.filter((m) => !same(m, sel)), { side: sel.side, view, zone: sel.zone, finding, severity, state, note: note.trim() || undefined }])
    setSel(null)
  }
  function remove() {
    if (!sel) return
    onChange(markers.filter((m) => !same(m, sel)))
    setSel(null)
  }

  const zoneEl = (side: Side, zone: string, shape: (fill: string, stroke: string, sw: number) => React.ReactNode) => {
    const m = find(side, zone)
    const selected = sel?.side === side && sel.zone === zone
    const label = `${sideLabel(side)}, ${zone}${m ? `: ${m.finding}, ${SEV_LABEL[m.severity]}, ${STATE_LABEL[m.state]}` : ''}`
    const fill = m ? (m.state === 'tratado' ? TREATED_FILL : SEV_FILL[m.severity]) : EMPTY_FILL
    return (
      <g key={zone} role="button" tabIndex={0} aria-label={label} aria-pressed={selected} className="cursor-pointer outline-none [&:focus-visible_*]:stroke-[4]"
        onClick={() => pick(side, zone)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(side, zone) } }}>
        {shape(fill, selected ? '#3b1d6e' : '#6b5a85', selected ? 4 : 2)}
      </g>
    )
  }

  const foot = (side: Side) => {
    const clip = `${uid}-${side}`
    const mx = (x: number) => (side === 'left' ? 200 - x : x) // el espejo no puede invertir el texto: se calcula a mano
    const toes = Object.entries(TOES[type])
    return (
      <figure className={`text-center ${shown === side ? '' : 'max-md:hidden'}`} key={side}>
        <svg viewBox="0 10 200 410" className="mx-auto h-auto w-full max-w-[15rem] touch-manipulation md:max-w-[13rem]" role="group" aria-label={sideLabel(side)}>
          <defs><clipPath id={clip}><path d={OUTLINE} /></clipPath></defs>
          <g transform={side === 'left' ? 'translate(200 0) scale(-1 1)' : undefined}>
            {/* cuerpo: se pinta cada zona recortada por la silueta, y encima el contorno */}
            {BODY[view].map(({ zone, d }) => zoneEl(side, zone, (fill, stroke, sw) => <path d={d} clipPath={`url(#${clip})`} fill={fill} stroke={stroke} strokeWidth={sw} />))}
            <path d={OUTLINE} fill="none" stroke="#6b5a85" strokeWidth={2.5} pointerEvents="none" />
            {toes.map(([zone, t]) => zoneEl(side, zone, (fill, stroke, sw) => <circle cx={t.cx} cy={t.cy} r={t.r} fill={fill} stroke={stroke} strokeWidth={sw} />))}
          </g>
          <g pointerEvents="none" fill="#3b1d6e" textAnchor="middle" fontFamily="inherit">
            {BODY[view].map(({ zone, at }) => <text key={zone} x={mx(at[0])} y={at[1]} fontSize={15} fontWeight={600}>{zone}</text>)}
            {toes.map(([zone, t]) => <text key={zone} x={mx(t.cx)} y={t.cy + 6} fontSize={t.r > 20 ? 18 : 15} fontWeight={700}>{zone.slice(-1)}</text>)}
          </g>
        </svg>
        <figcaption className="mt-1 text-lg font-semibold">{sideLabel(side)}</figcaption>
      </figure>
    )
  }

  const list = markers.filter((m) => m.view === view)
  const btn = (on: boolean) => `min-h-touch rounded-control px-5 font-semibold ${on ? 'bg-violeta-oscuro text-white' : 'border border-violeta-oscuro text-violeta-oscuro'}`
  const choice = (on: boolean) => `flex min-h-touch cursor-pointer items-center gap-2 rounded-control border px-4 ${on ? 'border-violeta-oscuro bg-lila/50' : 'border-tinta/30'}`
  return (
    <div className="rounded-card bg-white p-4 shadow-soft">
      <fieldset className="mb-4">
        <legend className="font-semibold">1. Tipo de pie</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {(Object.keys(FOOT_TYPE_LABEL) as FootType[]).map((t) => (
            <label key={t} className={choice(type === t)}>
              <input type="radio" name="foot-type" checked={type === t} onChange={() => onFootType(t)} className="size-5" />{FOOT_TYPE_LABEL[t]}
            </label>
          ))}
        </div>
        <p className="mt-1 text-sm">{FOOT_TYPE_HINT[type]}</p>
      </fieldset>

      <p className="mb-2 font-semibold">2. Tocá el pie donde quieras anotar algo</p>
      <div role="tablist" aria-label="Vista del pie" className="mb-3 flex gap-2">
        {(['plantar', 'dorsal'] as const).map((v) => (
          <button key={v} type="button" role="tab" aria-selected={view === v} onClick={() => { setView(v); setSel(null) }} className={btn(view === v)}>{v === 'plantar' ? 'Planta (abajo)' : 'Dorso (arriba)'}</button>
        ))}
      </div>
      <div role="group" aria-label="Pie a mostrar" className="mb-3 flex gap-2 md:hidden">
        {(['right', 'left'] as const).map((s) => (
          <button key={s} type="button" aria-pressed={shown === s} onClick={() => { setShown(s); setSel(null) }} className={`${btn(shown === s)} flex-1`}>{sideLabel(s)}</button>
        ))}
      </div>
      <div className="grid gap-2 md:grid-cols-2">{foot('left')}{foot('right')}</div>
      <p className="mt-1 text-center text-sm">Con teclado: Tab para moverte y Enter para elegir una zona.</p>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Referencias de color">
        {([1, 2, 3] as const).map((s) => <li key={s} className="flex items-center gap-1"><span aria-hidden className="size-4 rounded-full border border-tinta/40" style={{ background: SEV_FILL[s] }} />{SEV_LABEL[s]} (a tratar)</li>)}
        <li className="flex items-center gap-1"><span aria-hidden className="size-4 rounded-full border border-tinta/40" style={{ background: TREATED_FILL }} />Tratado</li>
      </ul>

      {sel && (
        <div ref={panel} className="mt-4 space-y-3 rounded-card border-2 border-violeta-oscuro/60 bg-lila/20 p-4" role="group" aria-label="Detalle de la zona">
          <p className="text-lg font-semibold">{sideLabel(sel.side)} · {view === 'plantar' ? 'planta' : 'dorso'} · {sel.zone}</p>
          <label className="block font-semibold">Hallazgo
            <select value={finding} onChange={(e) => setFinding(e.target.value)} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-3 font-normal">
              {FOOT_FINDINGS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>
          <fieldset>
            <legend className="font-semibold">Gravedad</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {([1, 2, 3] as const).map((s) => (
                <label key={s} className={choice(severity === s)}>
                  <input type="radio" name="sev" checked={severity === s} onChange={() => setSeverity(s)} className="size-5" />
                  <span aria-hidden className="size-4 rounded-full border border-tinta/40" style={{ background: SEV_FILL[s] }} />{SEV_LABEL[s]}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-semibold">Estado</legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {(['a_tratar', 'tratado'] as const).map((s) => (
                <label key={s} className={choice(state === s)}>
                  <input type="radio" name="state" checked={state === s} onChange={() => setState(s)} className="size-5" />{STATE_LABEL[s]}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block font-semibold">Nota <span className="font-normal text-tinta/70">(opcional)</span>
            <input value={note} maxLength={300} placeholder="Ej: núcleo central, duele al apoyar" onChange={(e) => setNote(e.target.value)} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 px-3 font-normal" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} className="min-h-touch rounded-control bg-violeta-oscuro px-6 font-semibold text-white">Guardar marca</button>
            {find(sel.side, sel.zone) && <button type="button" onClick={remove} className="min-h-touch rounded-control border border-red-800 px-5 text-red-900">Quitar marca</button>}
            <button type="button" onClick={() => setSel(null)} className="min-h-touch rounded-control px-5 underline">Cancelar</button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="font-semibold">Marcas ({list.length})</p>
        <ul className="mt-1 space-y-1">
          {list.map((m, i) => <li key={i}>{m.side === 'left' ? 'Izq.' : 'Der.'} · {m.zone}: {m.finding} ({SEV_LABEL[m.severity]}) — {STATE_LABEL[m.state]}{m.note ? ` — ${m.note}` : ''}</li>)}
          {!list.length && <li>Sin marcas en esta vista.</li>}
        </ul>
      </div>
    </div>
  )
}

/** Versión de solo lectura para evoluciones firmadas y la historia impresa. */
export function MarkersSummary({ footType, markers }: { footType?: FootType; markers: FootMarker[] }) {
  if (!markers.length && !footType) return null
  return (
    <div>
      {footType && <p>Tipo de pie: <strong>{FOOT_TYPE_LABEL[footType]}</strong></p>}
      <ul className="mt-1 space-y-1">
        {markers.map((m, i) => <li key={i}>{m.side === 'left' ? 'Izq.' : 'Der.'} · {m.view === 'plantar' ? 'planta' : 'dorso'} · {m.zone}: {m.finding} ({SEV_LABEL[m.severity]}) — {STATE_LABEL[m.state]}{m.note ? ` — ${m.note}` : ''}</li>)}
      </ul>
    </div>
  )
}

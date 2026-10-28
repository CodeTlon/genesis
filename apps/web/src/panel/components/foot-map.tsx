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

// Silueta de un pie derecho visto desde la planta (viewBox 0 10 200 410; el dedo gordo queda a la izquierda).
// El pie izquierdo es el espejo. La curva interna de la izquierda es el arco.
const OUTLINE = 'M46 120 C34 154 38 196 56 236 C68 264 70 292 64 320 C58 362 74 404 112 408 C148 410 168 380 164 336 C162 300 176 264 184 214 C191 176 192 140 184 118 C152 92 94 90 46 120 Z'
// Giro de cada dedo (grados) para que abanique como un pie real.
const TILT = [-8, -3, 1, 6, 12]

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
  const dlg = useRef<HTMLDialogElement>(null)
  const viewTabs = useRef<(HTMLButtonElement | null)[]>([])
  const opener = useRef<Element | null>(null)

  // La zona se edita en un diálogo modal: Escape lo cierra, el foco queda atrapado adentro y vuelve a la zona al cerrar.
  useEffect(() => {
    const d = dlg.current
    if (!sel || !d) return
    opener.current = document.activeElement
    if (!d.open) d.showModal()
    return () => { if (d.open) d.close(); (opener.current as HTMLElement | null)?.focus?.() }
  }, [sel])

  function onViewKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const n = i === 0 ? 1 : 0
    viewTabs.current[n]?.focus()
    setView(n === 0 ? 'plantar' : 'dorsal')
  }

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

  const zoneEl = (side: Side, zone: string, shape: (fill: string, stroke: string, sw: number) => React.ReactNode, extra?: React.ReactNode) => {
    const m = find(side, zone)
    const selected = sel?.side === side && sel.zone === zone
    const label = `${sideLabel(side)}, ${zone}${m ? `: ${m.finding}, ${SEV_LABEL[m.severity]}, ${STATE_LABEL[m.state]}` : ''}`
    const fill = m ? (m.state === 'tratado' ? TREATED_FILL : SEV_FILL[m.severity]) : `url(#${uid}-skin)`
    return (
      <g key={zone} role="button" tabIndex={0} aria-label={label} aria-pressed={selected} className="cursor-pointer outline-none [&:focus-visible_*]:stroke-[4]"
        onClick={() => pick(side, zone)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(side, zone) } }}>
        {shape(fill, selected ? '#3b1d6e' : '#6b5a85', selected ? 4 : 2)}
        {extra}
      </g>
    )
  }

  const foot = (side: Side) => {
    const clip = `${uid}-${side}`
    const mx = (x: number) => (side === 'left' ? 200 - x : x) // el espejo no puede invertir el texto: se calcula a mano
    const toes = Object.entries(TOES[type])
    return (
      <figure className={`text-center ${shown === side ? '' : 'max-md:hidden'}`} key={side}>
        <svg viewBox="0 10 200 410" className="mx-auto h-auto w-full max-w-[18rem] touch-manipulation drop-shadow-[0_10px_12px_rgb(80_40_130/.18)] md:max-w-[15rem]" role="group" aria-label={sideLabel(side)}>
          <defs>
            <clipPath id={clip}><path d={OUTLINE} /></clipPath>
            <linearGradient id={`${uid}-skin`} x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#fffdff" /><stop offset="1" stopColor="#e9dcf6" /></linearGradient>
          </defs>
          <g transform={side === 'left' ? 'translate(200 0) scale(-1 1)' : undefined}>
            {/* cuerpo: se pinta cada zona recortada por la silueta, y encima el contorno */}
            {BODY[view].map(({ zone, d }) => zoneEl(side, zone, (fill, stroke, sw) => <path className="g-zone" d={d} clipPath={`url(#${clip})`} fill={fill} stroke={stroke} strokeWidth={sw} />))}
            {view === 'plantar' && <path d="M60 238 C74 266 74 294 66 322 C92 304 100 264 88 232 Z" fill="#7b3fb8" fillOpacity={0.07} pointerEvents="none" />}
            <path d={OUTLINE} fill="none" stroke="#6b5a85" strokeWidth={2.5} strokeLinejoin="round" pointerEvents="none" />
            {toes.map(([zone, t]) => zoneEl(side, zone, (fill, stroke, sw) => <ellipse className="g-zone" cx={t.cx} cy={t.cy} rx={t.r * 0.94} ry={t.r * 1.08} transform={`rotate(${TILT[Number(zone.slice(-1)) - 1]} ${t.cx} ${t.cy})`} fill={fill} stroke={stroke} strokeWidth={sw} />,
              <>
                {view === 'dorsal' && <ellipse cx={t.cx} cy={t.cy - t.r * 0.42} rx={t.r * 0.52} ry={t.r * 0.34} transform={`rotate(${TILT[Number(zone.slice(-1)) - 1]} ${t.cx} ${t.cy})`} fill="#fff" fillOpacity={0.6} stroke="#6b5a85" strokeWidth={1} pointerEvents="none" />}
                <circle cx={t.cx} cy={t.cy} r={t.r + 7} fill="transparent" />
              </>))} {/* área de toque ampliada (>= 44 px) */}
          </g>
          <g pointerEvents="none" fill="#3b1d6e" textAnchor="middle" fontFamily="inherit">
            {BODY[view].map(({ zone, at }) => <text key={zone} x={mx(at[0])} y={at[1]} fontSize={15} fontWeight={600}>{zone}</text>)}
            {toes.map(([zone, t]) => <text key={zone} x={mx(t.cx)} y={t.cy + 6} fontSize={t.r > 20 ? 18 : 15} fontWeight={700}>{zone.slice(-1)}</text>)}
          </g>
          {/* La gravedad no depende solo del color: cada marca lleva una insignia con el número (1 a 3) o una tilde si ya está tratada. */}
          <g pointerEvents="none">
            {[...BODY[view].map(({ zone, at }) => ({ zone, x: mx(at[0]), y: at[1] + 24 })), ...toes.map(([zone, t]) => ({ zone, x: mx(t.cx + (side === 'left' ? -1 : 1) * t.r * 0.75), y: t.cy - t.r * 0.75 }))].map(({ zone, x, y }) => {
              const m = find(side, zone)
              if (!m) return null
              return (
                <g key={`${zone}-${m.severity}-${m.state}`} className="g-pop">
                  <circle cx={x} cy={y} r={10} fill="#fff" stroke="#3b1d6e" strokeWidth={2} />
                  {m.state === 'tratado' ? <path d={`M${x - 5} ${y} l3.5 3.5 l6.5 -7`} fill="none" stroke="#1f6b43" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /> : <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill="#3b1d6e">{m.severity}</text>}
                </g>
              )
            })}
          </g>
        </svg>
        <figcaption className="mt-1 text-lg font-semibold">{sideLabel(side)}</figcaption>
      </figure>
    )
  }

  const list = markers.filter((m) => m.view === view)
  const btn = (on: boolean) => `min-h-touch rounded-control px-5 font-semibold ${on ? 'bg-violeta-oscuro text-white' : 'border border-violeta-oscuro text-violeta-oscuro'}`
  const choice = (on: boolean) => `flex min-h-touch cursor-pointer items-center gap-2 rounded-control border px-4 ${on ? 'border-violeta-oscuro bg-lila/50' : 'border-tinta/50'}`
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
        <p className="mt-1 text-base">{FOOT_TYPE_HINT[type]}</p>
      </fieldset>

      <p className="mb-2 font-semibold">2. Tocá el pie donde quieras anotar algo</p>
      <div role="tablist" aria-label="Vista del pie" className="mb-3 flex gap-2">
        {(['plantar', 'dorsal'] as const).map((v, i) => (
          <button key={v} ref={(el) => { viewTabs.current[i] = el }} id={`${uid}-tab-${v}`} type="button" role="tab" aria-selected={view === v} aria-controls={`${uid}-panel`} tabIndex={view === v ? 0 : -1}
            onClick={() => setView(v)} onKeyDown={(e) => onViewKey(e, i)} className={btn(view === v)}>{v === 'plantar' ? 'Planta (abajo)' : 'Dorso (arriba)'}</button>
        ))}
      </div>
      <div role="group" aria-label="Pie a mostrar" className="mb-3 flex gap-2 md:hidden">
        {(['right', 'left'] as const).map((s) => (
          <button key={s} type="button" aria-pressed={shown === s} onClick={() => setShown(s)} className={`${btn(shown === s)} flex-1`}>{sideLabel(s)}</button>
        ))}
      </div>
      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${view}`} className="g-enter grid gap-2 md:grid-cols-2" key={view}>{foot('left')}{foot('right')}</div>
      <p className="sr-only">Con teclado: Tab para moverte, Enter para elegir una zona y Escape para cerrar.</p>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-base" aria-label="Referencias de color">
        {([1, 2, 3] as const).map((s) => <li key={s} className="flex items-center gap-1"><span aria-hidden className="size-4 rounded-full border border-tinta/40" style={{ background: SEV_FILL[s] }} />{SEV_LABEL[s]} (a tratar)</li>)}
        <li className="flex items-center gap-1"><span aria-hidden className="size-4 rounded-full border border-tinta/40" style={{ background: TREATED_FILL }} />Tratado</li>
      </ul>

      {sel && (
        <dialog ref={dlg} aria-label={`${sideLabel(sel.side)}, ${sel.zone}`} onClose={() => setSel(null)} onClick={(e) => { if (e.target === dlg.current) setSel(null) }}
          className="g-sheet m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-t-card bg-white p-0 shadow-[0_-10px_40px_rgb(0_0_0/.25)] backdrop:bg-[rgb(40_25_55/.45)] md:m-auto md:w-[28rem] md:max-w-[calc(100vw-2rem)] md:rounded-card">
        <div className="space-y-3 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <span aria-hidden className="mx-auto block h-1.5 w-12 rounded-full bg-tinta/20 md:hidden" />
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
          <label className="block font-semibold">Nota <span className="font-normal text-tinta-suave">(opcional)</span>
            <input value={note} maxLength={300} placeholder="Ej: núcleo central, duele al apoyar" onChange={(e) => setNote(e.target.value)} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 px-3 font-normal" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} className="min-h-touch rounded-control bg-violeta-oscuro px-6 font-semibold text-white">Guardar marca</button>
            {find(sel.side, sel.zone) && <button type="button" onClick={remove} className="min-h-touch rounded-control border border-error-texto px-5 text-error-texto">Quitar marca</button>}
            <button type="button" onClick={() => setSel(null)} className="min-h-touch rounded-control border border-tinta/50 bg-white px-5 font-semibold hover:bg-lila/40">Cancelar</button>
          </div>
        </div>
        </dialog>
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

/** Pie en miniatura, solo lectura: colorea cada zona marcada y deja el número de gravedad (o tilde) para no depender del color. */
function MiniFoot({ side, view, type, markers }: { side: Side; view: View; type: FootType; markers: FootMarker[] }) {
  const uid = useId().replace(/:/g, '')
  const clip = `${uid}-mini`
  const mine = markers.filter((m) => m.side === side && m.view === view)
  const fillOf = (zone: string) => {
    const m = mine.find((x) => x.zone === zone)
    return m ? (m.state === 'tratado' ? TREATED_FILL : SEV_FILL[m.severity]) : `url(#${uid}-skin)`
  }
  return (
    <figure className="text-center">
      <svg viewBox="0 10 200 410" className="mx-auto h-auto w-20" role="img" aria-label={`${sideLabel(side)}, ${view === 'plantar' ? 'planta' : 'dorso'}: ${mine.length} ${mine.length === 1 ? 'marca' : 'marcas'}`}>
        <defs><clipPath id={clip}><path d={OUTLINE} /></clipPath><linearGradient id={`${uid}-skin`} x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#fffdff" /><stop offset="1" stopColor="#e9dcf6" /></linearGradient></defs>
        <g transform={side === 'left' ? 'translate(200 0) scale(-1 1)' : undefined}>
          {BODY[view].map(({ zone, d }) => <path key={zone} d={d} clipPath={`url(#${clip})`} fill={fillOf(zone)} stroke="#6b5a85" strokeWidth={2} />)}
          <path d={OUTLINE} fill="none" stroke="#6b5a85" strokeWidth={2.5} />
          {Object.entries(TOES[type]).map(([zone, t]) => <ellipse key={zone} cx={t.cx} cy={t.cy} rx={t.r * 0.94} ry={t.r * 1.08} transform={`rotate(${TILT[Number(zone.slice(-1)) - 1]} ${t.cx} ${t.cy})`} fill={fillOf(zone)} stroke="#6b5a85" strokeWidth={2} />)}
        </g>
      </svg>
      <figcaption className="text-base text-tinta-suave">{side === 'left' ? 'Izquierdo' : 'Derecho'}</figcaption>
    </figure>
  )
}

/** Versión de solo lectura para evoluciones firmadas y la historia impresa: dibujo + lista. */
export function MarkersSummary({ footType, markers }: { footType?: FootType; markers: FootMarker[] }) {
  if (!markers.length && !footType) return null
  const views = (['plantar', 'dorsal'] as const).filter((v) => markers.some((m) => m.view === v))
  return (
    <div>
      {footType && <p>Tipo de pie: <strong>{FOOT_TYPE_LABEL[footType]}</strong></p>}
      {views.length > 0 && (
        <div className="my-2 flex flex-wrap gap-x-6 gap-y-2">
          {views.map((v) => (
            <div key={v}>
              <p className="text-base font-semibold">{v === 'plantar' ? 'Planta' : 'Dorso'}</p>
              <div className="flex gap-3"><MiniFoot side="left" view={v} type={footType ?? 'egipcio'} markers={markers} /><MiniFoot side="right" view={v} type={footType ?? 'egipcio'} markers={markers} /></div>
            </div>
          ))}
        </div>
      )}
      <ul className="mt-1 space-y-1">
        {markers.map((m, i) => <li key={i}>{m.side === 'left' ? 'Izq.' : 'Der.'} · {m.view === 'plantar' ? 'planta' : 'dorso'} · {m.zone}: {m.finding} ({SEV_LABEL[m.severity]}) — {STATE_LABEL[m.state]}{m.note ? ` — ${m.note}` : ''}</li>)}
      </ul>
    </div>
  )
}

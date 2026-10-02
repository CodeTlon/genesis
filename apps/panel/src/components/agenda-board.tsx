'use client'
import { DndContext, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { useRef, useState, useTransition } from 'react'
import { moveAppointment } from '@/lib/actions'
import { hhmm, localToIso } from '@/lib/dates'
import { AlertBadges } from './alert-badges'
import { STATUS_LABEL, type Alert, type ApptStatus } from '@/lib/types'

export type AgendaAppt = {
  id: string; patient: string; service: string; resource: string; professionalId: string
  startMin: number; durationMin: number; status: ApptStatus; alerts: Alert[]
}
export type AgendaPro = { id: string; name: string; color: string }

const START = 8 * 60, END = 20 * 60, PPM = 1.2, SNAP = 15
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function Card({ a, color }: { a: AgendaAppt; color: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: a.id })
  return (
    <div
      ref={setNodeRef} {...listeners} {...attributes}
      aria-label={`${a.patient}, ${a.service}, ${hhmm(a.startMin)} a ${hhmm(a.startMin + a.durationMin)}. ${STATUS_LABEL[a.status]}. Arrastrá para mover.`}
      style={{ top: (a.startMin - START) * PPM, height: a.durationMin * PPM - 2, borderLeftColor: color, transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      className={`absolute inset-x-1 cursor-grab touch-none overflow-hidden rounded-control border-l-4 bg-white p-2 text-sm shadow-soft active:cursor-grabbing ${isDragging ? 'z-20 opacity-90 ring-2 ring-violeta-oscuro' : 'z-10'} ${a.status === 'cancelled' || a.status === 'no_show' ? 'opacity-50' : ''}`}
    >
      <p className="font-semibold leading-tight">{hhmm(a.startMin)} · {a.patient}</p>
      <p className="leading-tight">{a.service} · {a.resource}</p>
      <AlertBadges alerts={a.alerts} compact />
    </div>
  )
}

function Column({ pro, appts }: { pro: AgendaPro; appts: AgendaAppt[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: pro.id })
  const hours = Array.from({ length: (END - START) / 60 }, (_, i) => i)
  return (
    <div className="min-w-56 flex-1">
      <p className="mb-1 text-center font-semibold" style={{ color: pro.color }}>{pro.name}</p>
      <div ref={setNodeRef} className={`relative rounded-card border border-lila/60 ${isOver ? 'bg-lila/30' : 'bg-white/60'}`} style={{ height: (END - START) * PPM }}>
        {hours.map((h) => <div key={h} aria-hidden className="absolute inset-x-0 border-t border-lila/50" style={{ top: h * 60 * PPM }} />)}
        {appts.map((a) => <Card key={a.id} a={a} color={pro.color} />)}
      </div>
    </div>
  )
}

export function AgendaBoard({ day, pros, appts }: { day: string; pros: AgendaPro[]; appts: AgendaAppt[] }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor))
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null)
  const undo = useRef<{ id: string; startMin: number; professionalId: string } | null>(null)
  const [, start] = useTransition()
  const [manual, setManual] = useState<Record<string, { time: string; pro: string }>>({})

  function doMove(a: AgendaAppt, startMin: number, professionalId: string, isUndo = false) {
    start(async () => {
      const r = await moveAppointment(a.id, localToIso(day, hhmm(startMin)), professionalId)
      if (r.ok) {
        undo.current = isUndo ? null : { id: a.id, startMin: a.startMin, professionalId: a.professionalId }
        setMsg({ text: isUndo ? 'Movimiento deshecho.' : `Listo: ${a.patient} pasó a las ${hhmm(startMin)}.` })
      } else setMsg({ text: r.message, error: true })
    })
  }

  function onDragEnd(e: DragEndEvent) {
    const a = appts.find((x) => x.id === e.active.id)
    if (!a) return
    const deltaMin = Math.round(e.delta.y / PPM / SNAP) * SNAP
    const startMin = clamp(a.startMin + deltaMin, START, END - a.durationMin)
    const pro = (e.over?.id as string | undefined) ?? a.professionalId
    if (startMin === a.startMin && pro === a.professionalId) return
    doMove(a, startMin, pro)
  }

  return (
    <div>
      <div className="min-h-12" aria-live="polite">
        {msg && (
          <p role={msg.error ? 'alert' : 'status'} className={`mb-3 flex flex-wrap items-center gap-3 rounded-card p-3 ${msg.error ? 'bg-red-100 text-red-950' : 'bg-emerald-100 text-emerald-950'}`}>
            {msg.text}
            {!msg.error && undo.current && (
              <button className="min-h-touch rounded-control border border-current px-4" onClick={() => { const u = undo.current!; const a = appts.find((x) => x.id === u.id); if (a) doMove({ ...a, startMin: a.startMin }, u.startMin, u.professionalId, true) }}>Deshacer</button>
            )}
          </p>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        <div aria-hidden className="relative w-12 shrink-0" style={{ marginTop: 28, height: (END - START) * PPM }}>
          {Array.from({ length: (END - START) / 60 }, (_, i) => <span key={i} className="absolute -translate-y-2 text-xs" style={{ top: i * 60 * PPM }}>{hhmm(START + i * 60)}</span>)}
        </div>
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          {pros.map((p) => <Column key={p.id} pro={p} appts={appts.filter((a) => a.professionalId === p.id)} />)}
        </DndContext>
      </div>

      <details className="mt-8 rounded-card bg-white p-4 shadow-soft">
        <summary className="min-h-touch cursor-pointer py-2 font-semibold">Mover un turno escribiendo la hora (sin arrastrar)</summary>
        <ul className="mt-3 space-y-3">
          {appts.filter((a) => a.status !== 'cancelled').map((a) => {
            const m = manual[a.id] ?? { time: hhmm(a.startMin), pro: a.professionalId }
            return (
              <li key={a.id} className="flex flex-wrap items-end gap-3">
                <span className="min-w-52">{a.patient} · {a.service}</span>
                <label className="text-sm">Hora<input type="time" step={900} value={m.time} onChange={(e) => setManual({ ...manual, [a.id]: { ...m, time: e.target.value } })} className="mt-1 block min-h-touch rounded-control border border-tinta/40 px-3" /></label>
                <label className="text-sm">Profesional
                  <select value={m.pro} onChange={(e) => setManual({ ...manual, [a.id]: { ...m, pro: e.target.value } })} className="mt-1 block min-h-touch rounded-control border border-tinta/40 bg-white px-3">
                    {pros.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </label>
                <button className="min-h-touch rounded-control bg-violeta-oscuro px-5 text-white" onClick={() => { const [h, mm] = m.time.split(':').map(Number); doMove(a, h * 60 + mm, m.pro) }}>Mover</button>
              </li>
            )
          })}
        </ul>
      </details>
    </div>
  )
}

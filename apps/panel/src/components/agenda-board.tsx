'use client'
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { useRef, useState, useTransition } from 'react'
import { moveAppointment } from '@/lib/actions'
import { hhmm, localToIso } from '@/lib/dates'
import { AlertBadges } from './alert-badges'
import { useToast } from './toast'
import { STATUS_LABEL, type Alert, type ApptStatus } from '@/lib/types'

export type AgendaAppt = {
  id: string; patient: string; service: string; resource: string; professionalId: string
  startMin: number; durationMin: number; status: ApptStatus; alerts: Alert[]
}
export type AgendaPro = { id: string; name: string; color: string }

const START = 8 * 60, END = 20 * 60, PPM = 1.5, SNAP = 15, MIN_H = 44
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

function Card({ a, color, onOpen }: { a: AgendaAppt; color: string; onOpen: (a: AgendaAppt) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: a.id })
  const h = Math.max(a.durationMin * PPM - 2, MIN_H)
  const inactive = a.status === 'cancelled' || a.status === 'no_show'
  return (
    <div
      ref={setNodeRef} {...listeners} {...attributes}
      onClick={() => onOpen(a)}
      aria-label={`${a.patient}, ${a.service}, ${hhmm(a.startMin)} a ${hhmm(a.startMin + a.durationMin)}. ${STATUS_LABEL[a.status]}. Tocá para ver el detalle; arrastrá (en celular, mantené apretado) para mover.`}
      style={{ top: (a.startMin - START) * PPM, height: h, borderLeftColor: color, transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      className={`absolute inset-x-1 cursor-grab touch-manipulation select-none overflow-hidden rounded-control border-l-4 bg-white px-2 py-1 text-sm shadow-soft transition-shadow hover:shadow-md active:cursor-grabbing ${isDragging ? 'z-20 opacity-90 ring-2 ring-violeta-oscuro' : 'z-10'} ${inactive ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-1">
        <p className={`min-w-0 truncate font-semibold leading-6 ${inactive ? 'line-through' : ''}`}>{hhmm(a.startMin)} · {a.patient}</p>
        <AlertBadges alerts={a.alerts} compact />
      </div>
      {h >= 60 && <p className="truncate leading-tight">{a.service} · {a.resource}</p>}
    </div>
  )
}

function Column({ pro, appts, show, onOpen }: { pro: AgendaPro; appts: AgendaAppt[]; show: boolean; onOpen: (a: AgendaAppt) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: pro.id })
  const hours = Array.from({ length: (END - START) / 60 }, (_, i) => i)
  return (
    <div className={`min-w-40 flex-1 ${show ? '' : 'hidden md:block'}`}>
      <p className="mb-1 flex items-center justify-center gap-2 font-semibold"><span aria-hidden className="size-3 rounded-sm" style={{ background: pro.color }} />{pro.name}</p>
      <div ref={setNodeRef} className={`relative rounded-card border border-lila/60 ${isOver ? 'bg-lila/30' : 'bg-white/60'}`} style={{ height: (END - START) * PPM }}>
        {hours.map((h) => <div key={h} aria-hidden className="absolute inset-x-0 border-t border-lila/50" style={{ top: h * 60 * PPM }} />)}
        {appts.map((a) => <Card key={a.id} a={a} color={pro.color} onOpen={onOpen} />)}
      </div>
    </div>
  )
}

export function AgendaBoard({ day, pros, appts }: { day: string; pros: AgendaPro[]; appts: AgendaAppt[] }) {
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }), useSensor(KeyboardSensor))
  const { toast } = useToast()
  const [, start] = useTransition()
  const [mobilePro, setMobilePro] = useState(pros[0]?.id)
  const [view, setView] = useState<'grilla' | 'lista'>('grilla')
  const [detail, setDetail] = useState<AgendaAppt | null>(null)
  const dlg = useRef<HTMLDialogElement>(null)
  const lastDrag = useRef(0)
  // Después de arrastrar el navegador dispara un click: se ignora para no abrir el detalle sin querer.
  const open = (a: AgendaAppt) => { if (Date.now() - lastDrag.current > 300) { setDetail(a); dlg.current?.showModal() } }
  const [manual, setManual] = useState<Record<string, { time: string; pro: string }>>({})

  function doMove(a: AgendaAppt, startMin: number, professionalId: string, isUndo = false) {
    start(async () => {
      const r = await moveAppointment(a.id, localToIso(day, hhmm(startMin)), professionalId)
      if (!r.ok) return toast({ title: 'No se pudo mover el turno', description: r.message, error: true })
      toast(isUndo
        ? { title: 'Movimiento deshecho' }
        : { title: `${a.patient} pasó a las ${hhmm(startMin)}`, actionLabel: 'Deshacer', onAction: () => doMove(a, a.startMin, a.professionalId, true) })
    })
  }

  function onDragEnd(e: DragEndEvent) {
    lastDrag.current = Date.now()
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
      <section aria-label="Resumen del día" className="mb-5 grid gap-4 sm:grid-cols-2">
        {pros.map((pr) => {
          const mine = appts.filter((a) => a.professionalId === pr.id && a.status !== 'cancelled')
          const booked = mine.reduce((n, a) => n + a.durationMin, 0)
          const occ = Math.min(100, Math.round((booked / (END - START)) * 100))
          return (
            <div key={pr.id} className="rounded-card bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 font-semibold"><span aria-hidden className="size-3 rounded-sm" style={{ background: pr.color }} />{pr.name}</p>
                <p><strong className="text-xl font-normal">{mine.length}</strong> {mine.length === 1 ? 'turno' : 'turnos'}</p>
              </div>
              <div className="mt-2 h-3 rounded-full bg-lila/30" role="progressbar" aria-valuenow={occ} aria-valuemin={0} aria-valuemax={100} aria-label={`Ocupación de ${pr.name}`}><div className="h-3 rounded-full transition-[width] duration-700" style={{ width: `${occ}%`, background: pr.color }} /></div>
              <p className="mt-1 text-sm">{Math.round(booked / 60 * 10) / 10} h reservadas de {(END - START) / 60} h · {occ}% de ocupación</p>
            </div>
          )
        })}
      </section>

      <div role="group" aria-label="Vista de la agenda" className="mb-4 inline-flex overflow-hidden rounded-control border border-violeta-oscuro print:hidden">
        {(['grilla', 'lista'] as const).map((v) => <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={`min-h-touch px-5 capitalize transition-colors ${view === v ? 'bg-violeta-oscuro text-white' : 'bg-white text-violeta-oscuro hover:bg-lila/40'}`}>{v}</button>)}
      </div>

      {view === 'lista' ? (
        <div className="relative overflow-x-auto rounded-card bg-white shadow-soft">
          <table className="w-full min-w-[34rem] text-left">
            <caption className="sr-only">Turnos del día en lista</caption>
            <thead className="border-b border-lila/60 bg-lila/20"><tr>{['Hora', 'Paciente', 'Tratamiento', 'Profesional', 'Estado'].map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {[...appts].sort((x, y) => x.startMin - y.startMin).map((a) => {
                const pr = pros.find((x) => x.id === a.professionalId)
                return (
                  <tr key={a.id} onClick={() => open(a)} className="cursor-pointer border-b border-lila/30 transition-colors last:border-0 hover:bg-lila/20">
                    <td className="px-4 py-3 whitespace-nowrap">{hhmm(a.startMin)} a {hhmm(a.startMin + a.durationMin)}</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-2 font-semibold">{a.patient}<AlertBadges alerts={a.alerts} compact max={3} /></span></td>
                    <td className="px-4 py-3">{a.service} · {a.resource}</td>
                    <td className="px-4 py-3"><span className="flex items-center gap-2"><span aria-hidden className="size-2.5 rounded-sm" style={{ background: pr?.color }} />{pr?.name}</span></td>
                    <td className="px-4 py-3">{STATUS_LABEL[a.status]}</td>
                  </tr>
                )
              })}
              {!appts.length && <tr><td colSpan={5} className="px-4 py-6">No hay turnos este día.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <>
      <div role="tablist" aria-label="Profesional" className="mb-3 flex gap-2 md:hidden">
        {pros.map((p) => (
          <button key={p.id} type="button" role="tab" aria-selected={mobilePro === p.id} onClick={() => setMobilePro(p.id)}
            className={`min-h-touch flex-1 rounded-control px-3 ${mobilePro === p.id ? 'bg-violeta-oscuro text-white' : 'border border-violeta-oscuro text-violeta-oscuro'}`}>{p.name}</button>
        ))}
      </div>
      <p className="mb-2 text-sm md:hidden">Para pasar un turno a la otra profesional, abrí el desplegable de más abajo.</p>
      <div className="flex gap-2 overflow-x-auto">
        <div aria-hidden className="relative w-12 shrink-0" style={{ marginTop: 28, height: (END - START) * PPM }}>
          {Array.from({ length: (END - START) / 60 }, (_, i) => <span key={i} className="absolute -translate-y-2 text-xs" style={{ top: i * 60 * PPM }}>{hhmm(START + i * 60)}</span>)}
        </div>
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          {pros.map((p) => <Column key={p.id} pro={p} show={p.id === mobilePro} onOpen={open} appts={appts.filter((a) => a.professionalId === p.id)} />)}
        </DndContext>
      </div>

        </>
      )}

      <dialog ref={dlg} className="g-modal" aria-labelledby="ag-title" onClose={() => setDetail(null)} onClick={(e) => { if (e.target === dlg.current) dlg.current?.close() }}>
        {detail && (
          <div>
            <h2 id="ag-title" className="text-xl font-semibold">{detail.patient}</h2>
            <p className="mt-1">{hhmm(detail.startMin)} a {hhmm(detail.startMin + detail.durationMin)} · {detail.durationMin} min</p>
            <p>{detail.service} · {detail.resource}</p>
            <p className="mt-2"><span className="rounded-full bg-lila/50 px-3 py-1 text-sm">{STATUS_LABEL[detail.status]}</span></p>
            {detail.alerts.length > 0 ? (
              <div className="mt-4">
                <p className="font-semibold">Alertas clínicas</p>
                <div className="mt-1"><AlertBadges alerts={detail.alerts} /></div>
              </div>
            ) : <p className="mt-4">Sin alertas clínicas.</p>}
            <div className="mt-6 flex justify-end"><button type="button" autoFocus onClick={() => dlg.current?.close()} className="min-h-touch rounded-control bg-violeta-oscuro px-6 text-white hover:bg-tinta">Cerrar</button></div>
          </div>
        )}
      </dialog>

      <details className="mt-8 rounded-card bg-white p-4 shadow-soft">
        <summary className="min-h-touch cursor-pointer py-2 font-semibold">Mover un turno escribiendo la hora (sin arrastrar)</summary>
        <ul className="mt-3 space-y-3">
          {appts.filter((a) => a.status !== 'cancelled').map((a) => {
            const m = manual[a.id] ?? { time: hhmm(a.startMin), pro: a.professionalId }
            return (
              <li key={a.id} className="flex flex-wrap items-end gap-3">
                <span className="min-w-52">{a.patient} · {a.service}</span>
                <label className="text-sm">Hora<input type="time" step={900} value={m.time} onChange={(e) => setManual({ ...manual, [a.id]: { ...m, time: e.target.value } })} className="mt-1 block min-h-touch rounded-control border border-tinta/60 px-3" /></label>
                <label className="text-sm">Profesional
                  <select value={m.pro} onChange={(e) => setManual({ ...manual, [a.id]: { ...m, pro: e.target.value } })} className="mt-1 block min-h-touch rounded-control border border-tinta/60 bg-white px-3">
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

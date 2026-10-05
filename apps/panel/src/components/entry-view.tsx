'use client'
import { useState, useTransition } from 'react'
import { addendum } from '@/lib/actions'
import { TEMPLATES } from '@/lib/templates'
import { fmtDate } from '@/lib/dates'
import type { Entry, FootMarker } from '@/lib/types'
import { Term } from './term'

function show(v: unknown): string {
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—'
  if (typeof v === 'boolean') return v ? 'Sí' : 'No'
  return v === undefined || v === null || v === '' ? '—' : String(v)
}

export function EntryView({ entry }: { entry: Entry }) {
  const t = TEMPLATES[entry.templateCode]
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()
  const markers = (entry.payload.markers ?? []) as FootMarker[]

  return (
    <article className="rounded-card bg-white p-5 shadow-soft">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">{t.name} <span className="text-sm font-normal">(plantilla {t.code}, v{entry.templateVersion})</span></h3>
        <p className="text-sm">{fmtDate(entry.createdAt.slice(0, 10))} · {entry.author} · {entry.status === 'signed' ? 'Firmada' : 'Borrador'}</p>
      </header>
      <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {t.fields.filter((f) => f.type !== 'footmap' && entry.payload[f.id] !== undefined).map((f) => (
          <div key={f.id}><dt className="text-sm text-tinta/70">{f.label}</dt><dd>{show(entry.payload[f.id])}{f.unit ? ` ${f.unit}` : ''}</dd></div>
        ))}
      </dl>
      {markers.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-tinta/70">Marcas en el mapa de pies</p>
          <ul className="mt-1 list-disc pl-5">
            {markers.map((m, i) => <li key={i}>{m.side === 'left' ? 'Pie izquierdo' : 'Pie derecho'} · {m.view} · {m.zone}: {m.finding} (gravedad {m.severity}){m.note ? ` — ${m.note}` : ''}</li>)}
          </ul>
        </div>
      )}
      {entry.addenda.map((a) => (
        <div key={a.id} className="mt-3 rounded-control bg-lila/40 p-3">
          <p className="text-sm font-semibold">Adenda · {a.author} · {fmtDate(a.at.slice(0, 10))}</p>
          <p className="text-sm">Motivo: {a.reason}</p>
          <p>{a.text}</p>
        </div>
      ))}
      {entry.status === 'signed' && (
        <div className="mt-3">
          <p className="text-sm text-tinta/70">Entrada firmada: no se puede editar. Para corregirla, agregá una <Term k="adenda">adenda</Term>.</p>
          {!open ? (
            <button onClick={() => setOpen(true)} className="mt-2 min-h-touch rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro">Agregar adenda</button>
          ) : (
            <form className="mt-2 space-y-2" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await addendum(entry.id, entry.patientId, reason, text); if (r.ok) { setOpen(false); setReason(''); setText(''); setMsg('') } else setMsg(r.message ?? '') }) }}>
              <label className="block">Motivo de la corrección<input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/40 px-3" /></label>
              <label className="block">Texto<textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className="mt-1 block w-full rounded-control border border-tinta/40 px-3 py-2" /></label>
              {msg && <p role="alert" className="text-red-800">{msg}</p>}
              <button disabled={pending} className="min-h-touch rounded-control bg-violeta-oscuro px-5 text-white">Guardar adenda</button>
            </form>
          )}
        </div>
      )}
    </article>
  )
}

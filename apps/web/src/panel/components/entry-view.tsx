'use client'
import { useState } from 'react'
import { addendum } from '@/panel/lib/actions'
import { formatDigits, TEMPLATE } from '@/panel/lib/templates'
import type { Entry, FootMarker } from '@/panel/lib/types'
import { MarkersSummary } from './foot-map'

const fmt = (iso: string) => new Date(iso).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba', dateStyle: 'short', timeStyle: 'short' })
const show = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? formatDigits(v) : Array.isArray(v) ? v.join(', ') : v === true ? 'Sí' : v === false ? 'No' : v === undefined || v === '' ? '—' : String(v))

export function EntryView({ entry }: { entry: Entry }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const signed = entry.status === 'signed'
  const fields = TEMPLATE.fields.filter((f) => f.type !== 'footmap' && entry.payload[f.id] !== undefined && entry.payload[f.id] !== '' && (f.type !== 'digits' || formatDigits(entry.payload[f.id]) !== '—') && !(Array.isArray(entry.payload[f.id]) && (entry.payload[f.id] as unknown[]).length === 0))

  async function submit() {
    setBusy(true)
    const r = await addendum(entry.id, entry.patientId, reason, text)
    setBusy(false)
    if (r.ok) { setOpen(false); setReason(''); setText(''); setMsg('') } else setMsg(r.message)
  }

  return (
    <article className="rounded-card bg-white p-5 shadow-soft">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg">{fmt(entry.createdAt)} · {entry.author}</h3>
        <span className={`rounded-full px-3 py-0.5 text-base ring-1 ${signed ? 'bg-emerald-100 text-emerald-950 ring-emerald-700/40' : 'bg-amber-100 text-amber-950 ring-amber-700/40'}`}>{signed ? `Firmada ${fmt(entry.signedAt!)}` : 'Borrador'}</span>
      </header>
      <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {fields.map((f) => <div key={f.id}><dt className="text-base text-tinta-suave">{f.label}</dt><dd>{show(entry.payload[f.id])}{f.unit ? ` ${f.unit}` : ''}</dd></div>)}
      </dl>
      <div className="mt-3"><MarkersSummary footType={entry.payload.footType} markers={(entry.payload.markers ?? []) as FootMarker[]} /></div>

      {entry.addenda.length > 0 && (
        <section className="mt-4 space-y-2 border-t border-lila/50 pt-3" aria-label="Adendas">
          <h4 className="font-semibold">Adendas</h4>
          {entry.addenda.map((a) => <p key={a.id} className="rounded-control bg-lila/30 p-3"><span className="block text-base text-tinta-suave">{fmt(a.at)} · {a.author} · {a.reason}</span>{a.text}</p>)}
        </section>
      )}

      {signed && (
        <div className="mt-4 print:hidden">
          {!open ? (
            <button onClick={() => setOpen(true)} className="min-h-touch rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">Agregar adenda</button>
          ) : (
            <div className="space-y-2 rounded-card border border-violeta-oscuro/40 p-4">
              <label className="block">Motivo<input value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 px-3" /></label>
              <label className="block">Corrección o agregado<textarea value={text} rows={3} maxLength={4000} onChange={(e) => setText(e.target.value)} className="mt-1 block w-full rounded-control border border-tinta/60 px-3 py-2" /></label>
              {msg && <p role="alert" className="text-red-800">{msg}</p>}
              <div className="flex gap-2">
                <button disabled={busy} onClick={submit} className="min-h-touch rounded-control bg-violeta-oscuro px-5 text-white disabled:opacity-60">Guardar adenda</button>
                <button onClick={() => setOpen(false)} className="min-h-touch px-5 underline">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

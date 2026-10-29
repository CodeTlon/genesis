'use client'
import { useState } from 'react'
import { addendum } from '@/panel/lib/actions'
import { formatDigits, TEMPLATE } from '@/panel/lib/templates'
import type { Entry, FootMarker } from '@/panel/lib/types'
import { MarkersSummary } from './foot-map'

const fmt = (iso: string) => new Date(iso).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba', dateStyle: 'short', timeStyle: 'short' })
const show = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? formatDigits(v) : Array.isArray(v) ? v.join(', ') : v === true ? 'Sí' : v === false ? 'No' : v === undefined || v === '' ? '—' : String(v))

export function EntryView({ entry, defaultOpen = false }: { entry: Entry; defaultOpen?: boolean }) {
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

  const motivo = typeof entry.payload.motivo === 'string' ? entry.payload.motivo : ''
  const nMarks = ((entry.payload.markers ?? []) as FootMarker[]).length
  return (
    <li className="relative pl-7">
      <span aria-hidden className={`absolute -left-[7px] top-6 size-3 rounded-full ring-4 ring-marmol ${signed ? 'bg-ok-texto' : 'bg-aviso-texto'}`} />
      <details open={defaultOpen} className="g-acc rounded-card border border-tinta/10 bg-white shadow-soft">
        <summary className="flex min-h-touch items-center justify-between gap-3 px-4 py-3">
          <span className="min-w-0">
            <span className="block text-base font-semibold">{fmt(entry.createdAt)} · {entry.author}</span>
            <span className="block truncate text-tinta-suave">{motivo || 'Sin motivo'}{nMarks > 0 ? ` · ${nMarks} ${nMarks === 1 ? 'marca' : 'marcas'} en el mapa` : ''}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 font-semibold ${signed ? 'bg-ok-fondo text-ok-texto' : 'bg-aviso-fondo text-aviso-texto'}`}>{signed ? 'Firmada' : 'Borrador'}</span>
            <svg aria-hidden viewBox="0 0 24 24" className="g-chev size-5 text-tinta-suave" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </summary>
        <div className="border-t border-tinta/10 px-4 pb-4 pt-3">
          {signed && <p className="text-tinta-suave">Firmada el {fmt(entry.signedAt!)}</p>}
      <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {fields.map((f) => <div key={f.id}><dt className="text-base text-tinta-suave">{f.label}</dt><dd>{show(entry.payload[f.id])}{f.unit ? ` ${f.unit}` : ''}</dd></div>)}
      </dl>
      <div className="mt-3"><MarkersSummary footType={entry.payload.footType} markers={(entry.payload.markers ?? []) as FootMarker[]} /></div>

      {entry.addenda.length > 0 && (
        <section className="mt-4 space-y-2 border-t border-tinta/10 pt-3" aria-label="Adendas">
          <h4 className="font-semibold">Adendas</h4>
          {entry.addenda.map((a) => <p key={a.id} className="rounded-control bg-lila/30 p-3"><span className="block text-base text-tinta-suave">{fmt(a.at)} · {a.author} · {a.reason}</span>{a.text}</p>)}
        </section>
      )}

      {signed && (
        <div className="mt-4 print:hidden">
          {!open ? (
            <button onClick={() => setOpen(true)} className="min-h-touch rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">Agregar adenda</button>
          ) : (
            <div className="g-reveal space-y-2 rounded-card border border-violeta-oscuro/40 p-4">
              <label className="block">Motivo<input value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} className="mt-1 block min-h-touch w-full rounded-control border border-tinta/60 px-3" /></label>
              <label className="block">Corrección o agregado<textarea value={text} rows={3} maxLength={4000} onChange={(e) => setText(e.target.value)} className="mt-1 block w-full rounded-control border border-tinta/60 px-3 py-2" /></label>
              {msg && <p role="alert" className="text-red-800">{msg}</p>}
              <div className="flex gap-2">
                <button disabled={busy} onClick={submit} className="min-h-touch rounded-control bg-violeta-oscuro px-5 text-white disabled:opacity-60">Guardar adenda</button>
                <button onClick={() => setOpen(false)} className="min-h-touch rounded-control border border-tinta/50 bg-white px-5 font-semibold hover:bg-lila/40">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
      </details>
    </li>
  )
}

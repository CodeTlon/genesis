'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import HoldButton from '@genesis/ui/vendor/HoldButton'
import { FootMap } from './foot-map'
import { Term } from './term'
import StatusMark from '@genesis/ui/vendor/StatusMark'
import { useToast } from './toast'
import { bookNext, saveAttention } from '@/panel/lib/actions'
import type { Field, Template } from '@/panel/lib/templates'
import type { EntryPayload, FootMarker } from '@/panel/lib/types'

type Values = Record<string, unknown>
type NextInfo = { serviceId: string; professionalId: string; resource: string; time: string } | null

const input = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4'

export function TemplateForm({ patientId, patientName, template, initial, prefilledFrom, next }: {
  patientId: string; patientName: string; template: Template; initial: EntryPayload; prefilledFrom?: string; next: NextInfo
}) {
  const [values, setValues] = useState<Values>(initial)
  const [advanced, setAdvanced] = useState(false)
  const [entryId, setEntryId] = useState<string>()
  const [savedAt, setSavedAt] = useState('')
  const [error, setError] = useState('')
  const [signed, setSigned] = useState(false)
  const dirty = useRef(false)
  const idRef = useRef<string | undefined>(undefined)
  // Cola de guardados: firmar espera al autoguardado en vuelo, así no se duplica la entrada.
  const queue = useRef<Promise<unknown>>(Promise.resolve())

  const set = (id: string, v: unknown) => { dirty.current = true; setValues((p) => ({ ...p, [id]: v })) }
  const changed = (id: string) => prefilledFrom !== undefined && JSON.stringify(values[id]) !== JSON.stringify(initial[id])

  // Autoguardado de borrador (solo después de que la profesional toca algo)
  useEffect(() => {
    if (!dirty.current || signed) return
    const t = setTimeout(() => {
      queue.current = queue.current.then(async () => {
        const r = await saveAttention({ id: idRef.current, patientId, templateCode: template.code, payload: values as EntryPayload, sign: false })
        if (r.ok) { idRef.current = r.entryId; setEntryId(r.entryId); setSavedAt(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Argentina/Cordoba' })); setError('') }
        else setError('No pudimos guardar. Probá de nuevo; tu texto está a salvo en pantalla.')
      })
    }, 1500)
    return () => clearTimeout(t)
  }, [values, signed, patientId, template.code])

  async function sign() {
    await queue.current
    const r = await saveAttention({ id: idRef.current, patientId, templateCode: template.code, payload: values as EntryPayload, sign: true })
    if (r.ok) { setSigned(true); setEntryId(r.entryId); setError('') }
    else setError(r.message ?? 'No pudimos firmar. Probá de nuevo; tu texto está a salvo.')
  }

  if (signed) return <Signed patientId={patientId} patientName={patientName} template={template} next={next} entryId={entryId} />

  const fields = template.fields.filter((f) => advanced || !f.advanced)
  const hasAdvanced = template.fields.some((f) => f.advanced)

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <p role="note" className="rounded-card bg-lila/50 p-3 text-sm">Plantilla propuesta a validar con la profesional. No es un protocolo oficial.</p>
      {prefilledFrom && <p className="rounded-card bg-sky-100 p-3 text-sky-950">Cargamos los valores de la última visita ({prefilledFrom}). <strong>Cambiá solo lo que sea distinto</strong>; lo modificado se marca.</p>}

      {fields.map((f) => (
        <div key={f.id} className={changed(f.id) ? 'rounded-card border-l-4 border-violeta-oscuro bg-lila/20 pl-3' : ''}>
          <FieldInput field={f} value={values[f.id]} onChange={(v) => set(f.id, v)} markers={(values.markers ?? []) as FootMarker[]} onMarkers={(m) => set('markers', m)} />
        </div>
      ))}

      {hasAdvanced && (
        <button type="button" onClick={() => setAdvanced((a) => !a)} aria-expanded={advanced} className="min-h-touch rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">
          {advanced ? 'Ver menos' : 'Ver más campos'}
        </button>
      )}

      <div className="sticky bottom-0 -mx-4 border-t border-lila/50 bg-marmol/95 px-4 py-4 backdrop-blur">
        <p className="mb-2 text-sm" aria-live="polite">{error ? <span role="alert" className="text-red-800">{error}</span> : savedAt ? `Borrador guardado a las ${savedAt}.` : 'Se guarda solo mientras escribís.'}</p>
        <HoldButton size="lg" holdTime={700} backgroundColor="#7b3fb8" fillColor="#4a2578" textColor="#ffffff" fillTextColor="#ffffff" doneLabel="Firmada" onHold={sign}>
          Mantené apretado para firmar y cerrar
        </HoldButton>
        <p className="mt-2 text-sm">Una atención firmada ya no se puede editar: se corrige con una <Term k="adenda">adenda</Term>.</p>
      </div>
    </form>
  )
}

function Signed({ patientId, patientName, template, next, entryId }: { patientId: string; patientName: string; template: Template; next: NextInfo; entryId?: string }) {
  const [days, setDays] = useState(template.followupDays ?? 30)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [booked, setBooked] = useState(false)
  const { toast } = useToast()
  return (
    <div className="space-y-6">
      <div role="status" className="g-enter flex items-center gap-4 rounded-card bg-emerald-100 p-5 text-lg text-emerald-950"><StatusMark status="done" size={44} color="#065f46" doneColor="#047857" /><p>Atención firmada y guardada en la historia clínica de {patientName}.</p></div>
      {next && (
        <section className="rounded-card bg-white p-5 shadow-soft" aria-labelledby="prox">
          <h2 id="prox" className="text-xl font-normal uppercase tracking-[0.06em]">Próximo turno</h2>
          <label className="mt-3 block">Dentro de cuántos días
            <input type="number" min={1} placeholder="Ej: 30" value={days} onChange={(e) => setDays(Math.max(1, Math.round(Number(e.target.value)) || 1))} className={`${input} max-w-40`} />
          </label>
          <button disabled={busy || booked} onClick={async () => {
            setBusy(true)
            const r = await bookNext(patientId, next.serviceId, next.professionalId, next.resource, days, next.time)
            setBusy(false)
            if (r.ok) { setBooked(true); toast({ title: 'Próximo turno agendado', description: `${r.day.split('-').reverse().join('/')} a las ${r.time}` }) }
            setMsg(r.ok ? `Listo: turno pendiente el ${r.day.split('-').reverse().join('/')} a las ${r.time}.` : r.message)
          }} className="mt-3 min-h-touch rounded-control bg-violeta-oscuro px-6 text-white">{booked ? 'Turno agendado' : 'Agendar próximo turno'}</button>
          {msg && <p role="status" className="mt-3">{msg}</p>}
        </section>
      )}
      <div className="flex flex-wrap gap-3">
        <Link href={`/panel/pacientes/${patientId}`} className="inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">Volver a la ficha</Link>
        <Link href="/panel/hoy" className="inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">Ir a Hoy</Link>
      </div>
      <span className="sr-only">{entryId}</span>
    </div>
  )
}

function FieldInput({ field: f, value, onChange, markers, onMarkers }: {
  field: Field; value: unknown; onChange: (v: unknown) => void; markers: FootMarker[]; onMarkers: (m: FootMarker[]) => void
}) {
  const id = `f-${f.id}`
  const label = <span className="font-semibold">{f.label}{f.unit ? ` (${f.unit})` : ''}</span>
  const hint = f.hint ? <span className="block text-sm">{f.hint}</span> : null

  switch (f.type) {
    case 'footmap':
      return <div><p className="font-semibold">{f.label}</p>{hint}<div className="mt-2"><FootMap markers={markers} onChange={onMarkers} /></div></div>
    case 'longtext':
      return <div><label htmlFor={id}>{label}</label>{hint}<textarea id={id} rows={3} placeholder={`Escribí ${f.label.toLowerCase()}…`} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={`${input} py-3`} /></div>
    case 'number':
      return <div><label htmlFor={id}>{label}</label><input id={id} type="number" inputMode="decimal" placeholder={f.unit ? `En ${f.unit}` : 'Ej: 10'} value={(value as number | string) ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} className={`${input} max-w-48`} /></div>
    case 'date':
      return <div><label htmlFor={id}>{label}</label><input id={id} type="date" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={`${input} max-w-60`} /></div>
    case 'bool':
      return (
        <fieldset><legend>{label}</legend>
          <div className="mt-1 flex gap-2">
            {[['Sí', true], ['No', false]].map(([t, v]) => (
              <label key={String(t)} className={`flex min-h-touch cursor-pointer items-center gap-2 rounded-control border px-5 ${value === v ? 'border-violeta-oscuro bg-lila/50' : 'border-tinta/30'}`}>
                <input type="radio" name={id} checked={value === v} onChange={() => onChange(v)} />{String(t)}
              </label>
            ))}
          </div>
        </fieldset>
      )
    case 'select':
      return (
        <div><label htmlFor={id}>{label}</label>
          <select id={id} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={input}>
            <option value="">Elegir…</option>
            {f.options?.map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      )
    case 'multi': {
      const cur = (value as string[]) ?? []
      return (
        <fieldset><legend>{label}</legend>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {f.options?.map((o) => {
              const on = cur.includes(o)
              return (
                <label key={o} className={`flex min-h-touch cursor-pointer items-center gap-3 rounded-control border px-4 ${on ? 'border-violeta-oscuro bg-lila/50' : 'border-tinta/30'}`}>
                  <input type="checkbox" className="size-5" checked={on} onChange={() => onChange(on ? cur.filter((x) => x !== o) : [...cur, o])} />{o}
                </label>
              )
            })}
          </div>
        </fieldset>
      )
    }
    default:
      return <div><label htmlFor={id}>{label}</label>{hint}<input id={id} placeholder={`Completá: ${f.label.toLowerCase()}`} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={input} /></div>
  }
}

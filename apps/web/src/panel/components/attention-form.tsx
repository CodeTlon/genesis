'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import HoldButton from '@genesis/ui/vendor/HoldButton'
import { FootMap } from './foot-map'
import { saveAttention } from '@/panel/lib/actions'
import type { Field, Template } from '@/panel/lib/templates'
import type { EntryPayload, FootMarker, FootType } from '@/panel/lib/types'

type Values = EntryPayload
const input = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4'

export function AttentionForm({ patientId, patientName, caseId, caseTitle, template, initial }: {
  patientId: string; patientName: string; caseId: string; caseTitle: string; template: Template; initial: Values
}) {
  const [values, setValues] = useState<Values>(initial)
  const [advanced, setAdvanced] = useState(false)
  const [savedAt, setSavedAt] = useState('')
  const [error, setError] = useState('')
  const [signed, setSigned] = useState(false)
  const dirty = useRef(false)
  const idRef = useRef<string | undefined>(undefined)
  // Cola de guardados: firmar espera al autoguardado en vuelo, así no se duplica la evolución.
  const queue = useRef<Promise<unknown>>(Promise.resolve())

  const set = (id: string, v: unknown) => { dirty.current = true; setValues((p) => ({ ...p, [id]: v })) }

  useEffect(() => {
    if (!dirty.current || signed) return
    const t = setTimeout(() => {
      queue.current = queue.current.then(async () => {
        const r = await saveAttention({ id: idRef.current, patientId, caseId, payload: values, sign: false })
        if (r.ok) { idRef.current = r.entryId; setSavedAt(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Argentina/Cordoba' })); setError('') }
        else setError(r.message)
      })
    }, 1500)
    return () => clearTimeout(t)
  }, [values, signed, patientId, caseId])

  async function sign() {
    await queue.current
    const r = await saveAttention({ id: idRef.current, patientId, caseId, payload: values, sign: true })
    if (r.ok) { setSigned(true); setError('') } else setError(r.message)
  }

  if (signed) {
    return (
      <div className="space-y-6">
        <p role="status" className="rounded-card bg-emerald-100 p-5 text-lg text-emerald-950">Evolución firmada y guardada en la historia clínica de {patientName}.</p>
        <Link href={`/panel/pacientes/${patientId}/casos/${caseId}`} className="inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">Volver al caso</Link>
      </div>
    )
  }

  const fields = template.fields.filter((f) => advanced || !f.advanced)
  const hasAdvanced = template.fields.some((f) => f.advanced)
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <p role="note" className="rounded-card bg-lila/50 p-3 text-sm">Caso: <strong>{caseTitle}</strong>. Los campos son una propuesta a validar con la profesional.</p>
      {fields.map((f) => (
        <div key={f.id}>
          <FieldInput field={f} value={values[f.id]} onChange={(v) => set(f.id, v)}
            footType={values.footType} onFootType={(t) => set('footType', t)}
            markers={(values.markers ?? []) as FootMarker[]} onMarkers={(m) => set('markers', m)} />
        </div>
      ))}
      {hasAdvanced && (
        <button type="button" onClick={() => setAdvanced((a) => !a)} aria-expanded={advanced} className="min-h-touch rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">
          {advanced ? 'Ver menos' : 'Ver más campos'}
        </button>
      )}
      <div className="sticky bottom-0 -mx-4 border-t border-lila/50 bg-marmol/95 px-4 py-4 backdrop-blur">
        <p className="mb-2 text-sm" aria-live="polite">{error ? <span role="alert" className="text-red-800">{error}</span> : savedAt ? `Borrador guardado a las ${savedAt}.` : 'Se guarda solo mientras escribís.'}</p>
        <HoldButton onHold={sign} doneLabel="Firmada" holdTime={900} size="lg">Mantené presionado para firmar</HoldButton>
        <p className="mt-2 text-sm">Una evolución firmada ya no se puede editar: se corrige con una adenda.</p>
      </div>
    </form>
  )
}

function FieldInput({ field: f, value, onChange, footType, onFootType, markers, onMarkers }: {
  field: Field; value: unknown; onChange: (v: unknown) => void
  footType: FootType | undefined; onFootType: (t: FootType) => void; markers: FootMarker[]; onMarkers: (m: FootMarker[]) => void
}) {
  const id = `f-${f.id}`
  const label = <span className="font-semibold">{f.label}{f.unit ? ` (${f.unit})` : ''}</span>
  const hint = f.hint ? <span className="block text-sm">{f.hint}</span> : null
  switch (f.type) {
    case 'footmap':
      return <div><p className="font-semibold">{f.label}</p>{hint}<div className="mt-2"><FootMap footType={footType} onFootType={onFootType} markers={markers} onChange={onMarkers} /></div></div>
    case 'longtext':
      return <div><label htmlFor={id}>{label}</label>{hint}<textarea id={id} rows={3} maxLength={4000} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={`${input} py-3`} /></div>
    case 'number':
      return <div><label htmlFor={id}>{label}</label><input id={id} type="number" inputMode="decimal" value={(value as number | string) ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} className={`${input} max-w-48`} /></div>
    case 'date':
      return <div><label htmlFor={id}>{label}</label><input id={id} type="date" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={`${input} max-w-60`} /></div>
    case 'bool':
      return (
        <fieldset><legend>{label}</legend>
          <div className="mt-1 flex gap-2">
            {([['Sí', true], ['No', false]] as const).map(([t, v]) => (
              <label key={t} className={`flex min-h-touch cursor-pointer items-center gap-2 rounded-control border px-5 ${value === v ? 'border-violeta-oscuro bg-lila/50' : 'border-tinta/30'}`}>
                <input type="radio" name={id} checked={value === v} onChange={() => onChange(v)} />{t}
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
      return <div><label htmlFor={id}>{label}</label>{hint}<input id={id} maxLength={4000} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={input} /></div>
  }
}

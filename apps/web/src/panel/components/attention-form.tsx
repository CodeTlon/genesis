'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import HoldButton from '@genesis/ui/vendor/HoldButton'
import { FootMap } from './foot-map'
import { saveAttention } from '@/panel/lib/actions'
import type { Field, Template } from '@/panel/lib/templates'
import type { EntryPayload, FootMarker, FootType } from '@/panel/lib/types'

type Values = EntryPayload
const input = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4 placeholder:text-tinta-suave'

export function AttentionForm({ patientId, patientName, caseId, caseTitle, template, initial }: {
  patientId: string; patientName: string; caseId: string; caseTitle: string; template: Template; initial: Values
}) {
  const [values, setValues] = useState<Values>(initial)
  const [advanced, setAdvanced] = useState(false)
  const [savedAt, setSavedAt] = useState('')
  const [error, setError] = useState('')
  const [signed, setSigned] = useState(false)
  const [unsaved, setUnsaved] = useState(false)
  const [signing, setSigning] = useState(false)
  const confirmRef = useRef<HTMLDialogElement>(null)
  const leaveRef = useRef<HTMLDialogElement>(null)
  const leaveTo = useRef('')
  const router = useRouter()
  const confirmTitle = useId()
  const dirty = useRef(false)
  const idRef = useRef<string | undefined>(undefined)
  // Cola de guardados: firmar espera al autoguardado en vuelo, así no se duplica la evolución.
  const queue = useRef<Promise<unknown>>(Promise.resolve())

  const set = (id: string, v: unknown) => { dirty.current = true; setUnsaved(true); setValues((p) => ({ ...p, [id]: v })) }

  // Salir por un enlace de la app con cambios sin guardar: modal propio. Cerrar la pestaña no se puede personalizar,
  // así que ahí queda el aviso del navegador (solo mientras haya algo sin guardar, normalmente un par de segundos).
  useEffect(() => {
    if (!unsaved || signed) return
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a[href]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank' || a.origin !== location.origin || e.defaultPrevented || e.metaKey || e.ctrlKey) return
      e.preventDefault(); e.stopPropagation()
      leaveTo.current = a.pathname + a.search
      leaveRef.current?.showModal()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [unsaved, signed])

  useEffect(() => {
    if (!unsaved || signed) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [unsaved, signed])

  useEffect(() => {
    if (!dirty.current || signed) return
    const t = setTimeout(() => {
      queue.current = queue.current.then(async () => {
        const r = await saveAttention({ id: idRef.current, patientId, caseId, payload: values, sign: false })
        if (r.ok) { idRef.current = r.entryId; setUnsaved(false); setSavedAt(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Argentina/Cordoba' })); setError('') }
        else setError(r.message)
      })
    }, 1500)
    return () => clearTimeout(t)
  }, [values, signed, patientId, caseId])

  async function sign() {
    setSigning(true)
    await queue.current
    const r = await saveAttention({ id: idRef.current, patientId, caseId, payload: values, sign: true })
    setSigning(false)
    confirmRef.current?.close()
    if (r.ok) { setSigned(true); setUnsaved(false); setError('') } else setError(r.message)
  }

  if (signed) {
    return (
      <div className="space-y-6">
        <p role="status" className="rounded-card bg-ok-fondo p-5 text-lg text-ok-texto">Evolución firmada y guardada en la historia clínica de {patientName}.</p>
        <Link href={`/panel/pacientes/${patientId}/casos/${caseId}`} className="inline-flex min-h-touch items-center rounded-control border border-violeta-oscuro px-5 font-semibold text-violeta-oscuro hover:bg-lila/40">Volver al caso</Link>
      </div>
    )
  }

  const fields = template.fields.filter((f) => advanced || !f.advanced)
  const hasAdvanced = template.fields.some((f) => f.advanced)
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <p role="note" className="rounded-card bg-lila/50 p-3">Caso: <strong>{caseTitle}</strong>. Escribí solo lo que haga falta: se guarda solo y firmás al final.</p>
      {fields.map((f) => (
        <div key={f.id} className={f.advanced ? 'g-reveal' : undefined}>
          <FieldInput field={f} value={values[f.id]} onChange={(v) => set(f.id, v)}
            footType={values.footType} onFootType={(t) => set('footType', t)}
            markers={(values.markers ?? []) as FootMarker[]} onMarkers={(m) => set('markers', m)} />
        </div>
      ))}
      {hasAdvanced && (
        <button type="button" onClick={() => setAdvanced((a) => !a)} aria-expanded={advanced} className="min-h-touch rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">
          {advanced ? 'Ver menos campos' : 'Ver más campos (examen completo)'}
        </button>
      )}
      <p className="text-base">Una evolución firmada ya no se puede editar: se corrige con una adenda.</p>
      <div className="sticky bottom-[var(--tabbar-h)] z-20 -mx-4 border-t border-lila/50 bg-marmol/95 px-4 py-3 backdrop-blur md:bottom-0">
        <p className="mb-2 text-base" aria-live="polite">{error ? <span role="alert" className="font-semibold text-error-texto">{error}</span> : savedAt ? `Borrador guardado a las ${savedAt}.` : 'Se guarda solo mientras escribís.'}</p>
        <div className="flex flex-wrap items-center gap-3">
          <HoldButton onHold={sign} doneLabel="Firmada" holdTime={900} size="lg">Mantené presionado para firmar</HoldButton>
          <button type="button" onClick={() => confirmRef.current?.showModal()} className="min-h-touch rounded-control border border-violeta-oscuro px-6 font-semibold text-violeta-oscuro hover:bg-lila/40">Firmar</button>
        </div>
      </div>
      <dialog ref={leaveRef} className="g-modal" aria-labelledby="salir-titulo" onClick={(e) => { if (e.target === leaveRef.current) leaveRef.current?.close() }}>
        <h2 id="salir-titulo" className="text-xl font-semibold">Hay cambios sin guardar</h2>
        <p className="mt-2">Se están guardando solos. Si salís ahora, lo último que escribiste podría perderse.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" autoFocus onClick={() => leaveRef.current?.close()} className="min-h-touch rounded-control bg-violeta-oscuro px-5 font-semibold text-white hover:bg-tinta">Quedarme</button>
          <button type="button" onClick={() => { leaveRef.current?.close(); router.push(leaveTo.current) }} className="min-h-touch rounded-control border border-tinta/60 px-5 hover:bg-lila/40">Salir igual</button>
        </div>
      </dialog>
      <dialog ref={confirmRef} className="g-modal" aria-labelledby={confirmTitle} onClick={(e) => { if (e.target === confirmRef.current) confirmRef.current?.close() }}>
        <h2 id={confirmTitle} className="text-xl font-semibold">¿Firmar esta evolución?</h2>
        <p className="mt-2">Una vez firmada ya no se puede editar: cualquier corrección se hace con una adenda.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" autoFocus onClick={() => confirmRef.current?.close()} className="min-h-touch rounded-control border border-tinta/60 px-5 hover:bg-lila/40">Seguir editando</button>
          <button type="button" disabled={signing} onClick={sign} className="min-h-touch rounded-control bg-violeta-oscuro px-5 font-semibold text-white hover:bg-tinta">{signing ? 'Firmando...' : 'Firmar y cerrar'}</button>
        </div>
      </dialog>
    </form>
  )
}

function FieldInput({ field: f, value, onChange, footType, onFootType, markers, onMarkers }: {
  field: Field; value: unknown; onChange: (v: unknown) => void
  footType: FootType | undefined; onFootType: (t: FootType) => void; markers: FootMarker[]; onMarkers: (m: FootMarker[]) => void
}) {
  const id = `f-${f.id}`
  const label = <span className="text-lg font-semibold">{f.label}{f.unit ? ` (${f.unit})` : ''}</span>
  const hint = f.hint ? <span className="block text-base">{f.hint}</span> : null
  const ph = f.placeholder
  switch (f.type) {
    case 'footmap':
      return <div><p className="text-lg font-semibold">{f.label}</p>{hint}<div className="mt-2"><FootMap footType={footType} onFootType={onFootType} markers={markers} onChange={onMarkers} /></div></div>
    case 'digits': {
      const rec = ((value as Record<string, string[]>) ?? {})
      const setDigit = (side: 'der' | 'izq', i: number, t: string) => {
        const cur = [...(rec[side] ?? ['', '', '', '', ''])]
        cur[i] = t
        onChange({ ...rec, [side]: cur })
      }
      return (
        <fieldset><legend>{label}</legend>{hint}
          <div className="mt-1 grid gap-3 sm:grid-cols-2">
            {([['der', 'Pie derecho'], ['izq', 'Pie izquierdo']] as const).map(([side, name]) => (
              <div key={side} className="rounded-control border border-tinta/50 p-3">
                <p className="font-semibold">{name}</p>
                <div className="mt-1 grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <input key={i} aria-label={`${f.label}, ${name}, dedo ${i + 1}`} placeholder={`${i + 1}°`} maxLength={100} value={rec[side]?.[i] ?? ''} onChange={(e) => setDigit(side, i, e.target.value)} className="min-h-touch w-full rounded-control border border-tinta/60 bg-white px-2" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      )
    }
    case 'longtext':
      return <div><label htmlFor={id}>{label}</label>{hint}<textarea id={id} rows={3} maxLength={4000} placeholder={ph} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={`${input} py-3`} /></div>
    case 'number':
      return <div><label htmlFor={id}>{label}</label><input id={id} type="number" inputMode="decimal" placeholder={ph} value={(value as number | string) ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} className={`${input} max-w-48`} /></div>
    case 'date':
      return <div><label htmlFor={id}>{label}</label><input id={id} type="date" value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={`${input} max-w-60`} /></div>
    case 'bool':
      return (
        <fieldset><legend>{label}</legend>
          <div className="mt-1 flex gap-2">
            {([['Sí', true], ['No', false]] as const).map(([t, v]) => (
              <label key={t} className={`flex min-h-touch cursor-pointer items-center gap-2 rounded-control border px-5 ${value === v ? 'border-violeta-oscuro bg-lila/50' : 'border-tinta/50'}`}>
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
                <label key={o} className={`flex min-h-touch cursor-pointer items-center gap-3 rounded-control border px-4 ${on ? 'border-violeta-oscuro bg-lila/50' : 'border-tinta/50'}`}>
                  <input type="checkbox" className="size-5" checked={on} onChange={() => onChange(on ? cur.filter((x) => x !== o) : [...cur, o])} />{o}
                </label>
              )
            })}
          </div>
        </fieldset>
      )
    }
    default:
      return <div><label htmlFor={id}>{label}</label>{hint}<input id={id} maxLength={4000} placeholder={ph} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} className={input} /></div>
  }
}

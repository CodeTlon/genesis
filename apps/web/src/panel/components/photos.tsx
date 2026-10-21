'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deletePhoto, grantConsent, revokeConsent } from '@/panel/lib/actions'
import { CONSENT_LABEL, PHOTO_KIND_LABEL, type Consent, type Photo, type PhotoKind } from '@/panel/lib/types'

const input = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4'
const day = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')

export function PhotoUpload({ patientId, caseId, hasConsent }: { patientId: string; caseId?: string; hasConsent: boolean }) {
  const router = useRouter()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  if (!hasConsent) return <p role="note" className="rounded-card bg-amber-100 p-4 text-amber-950">Para subir fotos primero registrá el consentimiento de fotos del paciente (sección Consentimientos).</p>

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const file = fd.get('foto')
    if (!(file instanceof File) || file.size === 0) { setMsg({ ok: false, text: 'Elegí una foto.' }); return }
    if (file.size > 8 * 1024 * 1024) { setMsg({ ok: false, text: 'La foto pesa más de 8 MB.' }); return }
    fd.set('patientId', patientId)
    if (caseId) fd.set('caseId', caseId)
    setBusy(true); setMsg(null)
    try {
      const r = await fetch('/api/clinico/fotos', { method: 'POST', body: fd })
      const j = (await r.json()) as { ok: boolean; message?: string }
      if (j.ok) { form.reset(); setMsg({ ok: true, text: 'Foto guardada.' }); router.refresh() } else setMsg({ ok: false, text: j.message ?? 'No pudimos guardar la foto.' })
    } catch { setMsg({ ok: false, text: 'No pudimos conectar. Probá de nuevo.' }) }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-card bg-white p-4 shadow-soft">
      <label className="block">Foto (JPG, PNG o WebP, hasta 8 MB)<input name="foto" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" required className={`${input} py-2`} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">Tipo
          <select name="kind" defaultValue="evolucion" className={input}>{(Object.keys(PHOTO_KIND_LABEL) as PhotoKind[]).map((k) => <option key={k} value={k}>{PHOTO_KIND_LABEL[k]}</option>)}</select>
        </label>
        <label className="block">Fecha en que se sacó<input name="takenAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={input} /></label>
      </div>
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={msg.ok ? 'text-emerald-900' : 'text-red-800'}>{msg.text}</p>}
      <button disabled={busy} className="min-h-touch rounded-control bg-violeta-oscuro px-6 text-white disabled:opacity-60">{busy ? 'Subiendo…' : 'Subir foto'}</button>
    </form>
  )
}

export function PhotoGrid({ photos, deletable }: { photos: Photo[]; deletable: string[] }) {
  const router = useRouter()
  const [err, setErr] = useState('')
  if (!photos.length) return <p>Todavía no hay fotos.</p>
  const initial = photos.find((p) => p.kind === 'inicial')
  const final = [...photos].reverse().find((p) => p.kind === 'final') ?? (photos.length > 1 ? photos[photos.length - 1] : undefined)
  return (
    <div className="space-y-4">
      {initial && final && initial.id !== final.id && (
        <section aria-label="Comparación inicial y final" className="grid gap-3 sm:grid-cols-2">
          {[initial, final].map((p, i) => (
            <figure key={p.id} className="rounded-card bg-white p-2 shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element -- imagen privada servida con sesión; no pasa por el optimizador */}
              <img src={`/panel-media/${p.id}`} alt={`Foto ${i === 0 ? 'inicial' : 'final'}, ${day(p.takenAt)}`} className="aspect-square w-full rounded-control object-cover" />
              <figcaption className="mt-1 text-center font-semibold">{i === 0 ? 'Inicial' : 'Final'} · {day(p.takenAt)}</figcaption>
            </figure>
          ))}
        </section>
      )}
      {err && <p role="alert" className="text-red-800">{err}</p>}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((p) => (
          <li key={p.id} className="rounded-card bg-white p-2 shadow-soft">
            <a href={`/panel-media/${p.id}`} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element -- ver arriba */}
              <img src={`/panel-media/${p.id}?t=thumb`} alt={`${PHOTO_KIND_LABEL[p.kind]}, ${day(p.takenAt)}`} loading="lazy" className="aspect-square w-full rounded-control object-cover" />
            </a>
            <p className="mt-1 text-sm">{PHOTO_KIND_LABEL[p.kind]} · {day(p.takenAt)}</p>
            {deletable.includes(p.id) && (
              <button onClick={async () => { if (!confirm('¿Borrar esta foto?')) return; const r = await deletePhoto(p.id); if (r.ok) router.refresh(); else setErr(r.message) }} className="mt-1 min-h-touch text-sm text-red-900 underline">Borrar</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Consents({ patientId, consents }: { patientId: string; consents: Consent[] }) {
  const router = useRouter()
  const [err, setErr] = useState('')
  const [refs, setRefs] = useState<Record<string, string>>({})
  const kinds = Object.keys(CONSENT_LABEL) as Consent['kind'][]
  return (
    <ul className="space-y-3">
      {kinds.map((k) => {
        const active = consents.find((c) => c.kind === k && !c.revokedAt)
        return (
          <li key={k} className="rounded-card bg-white p-4 shadow-soft">
            <p className="font-semibold">{CONSENT_LABEL[k]}: {active ? <span className="text-emerald-900">vigente desde {day(active.grantedAt)}</span> : <span className="text-amber-900">pendiente</span>}</p>
            {active?.documentRef && <p className="text-sm">Documento: {active.documentRef}</p>}
            {active ? (
              <button onClick={async () => { if (!confirm('¿Revocar este consentimiento?')) return; const r = await revokeConsent(patientId, active.id); if (r.ok) router.refresh(); else setErr(r.message) }} className="mt-2 min-h-touch rounded-control border border-red-800 px-4 text-red-900">Revocar</button>
            ) : (
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <label className="block text-sm">Referencia del documento firmado (ej: ficha en papel, escaneo)
                  <input value={refs[k] ?? ''} maxLength={200} onChange={(e) => setRefs((p) => ({ ...p, [k]: e.target.value }))} className="mt-1 block min-h-touch w-64 max-w-full rounded-control border border-tinta/60 px-3" />
                </label>
                <button onClick={async () => { const r = await grantConsent(patientId, k, refs[k] ?? ''); if (r.ok) router.refresh(); else setErr(r.message) }} className="min-h-touch rounded-control bg-violeta-oscuro px-5 text-white">Registrar consentimiento</button>
              </div>
            )}
          </li>
        )
      })}
      {err && <li role="alert" className="text-red-800">{err}</li>}
    </ul>
  )
}

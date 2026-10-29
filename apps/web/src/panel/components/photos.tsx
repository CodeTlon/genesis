'use client'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { deletePhoto } from '@/panel/lib/actions'
import { CompareSlider } from './compare-slider'
import { PHOTO_KIND_LABEL, type Photo, type PhotoKind } from '@/panel/lib/types'

const PHOTOS_PAGE = 12
const input = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/60 bg-white px-4'
const day = (iso: string) => iso.slice(0, 10).split('-').reverse().join('/')

export function PhotoUpload({ patientId, caseId }: { patientId: string; caseId?: string }) {
  const router = useRouter()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

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
  const [idx, setIdx] = useState(0)
  const [asking, setAsking] = useState<string | null>(null)
  const [visible, setVisible] = useState(PHOTOS_PAGE)
  const viewer = useRef<HTMLDialogElement>(null)
  const confirmDlg = useRef<HTMLDialogElement>(null)
  const opener = useRef<Element | null>(null)
  const cur = photos[Math.min(idx, photos.length - 1)]

  function open(id: string) {
    const i = photos.findIndex((p) => p.id === id)
    if (i < 0) return
    opener.current = document.activeElement
    setIdx(i)
    viewer.current?.showModal()
  }
  const go = (d: number) => setIdx((i) => (i + d + photos.length) % photos.length)
  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
  }
  async function remove() {
    if (!asking) return
    const r = await deletePhoto(asking)
    confirmDlg.current?.close(); setAsking(null)
    if (r.ok) { viewer.current?.close(); router.refresh() } else setErr(r.message)
  }

  if (!photos.length) return <p>Todavía no hay fotos.</p>
  const initial = photos.find((p) => p.kind === 'inicial')
  const final = [...photos].reverse().find((p) => p.kind === 'final') ?? (photos.length > 1 ? photos[photos.length - 1] : undefined)
  return (
    <div className="space-y-4">
      {initial && final && initial.id !== final.id && (
        <section aria-label="Comparación inicial y final" className="space-y-2">
          <CompareSlider before={{ src: `/panel-media/${initial.id}`, label: `Foto inicial, ${day(initial.takenAt)}` }} after={{ src: `/panel-media/${final.id}`, label: `Foto final, ${day(final.takenAt)}` }} />
          <div className="flex flex-wrap items-center justify-between gap-2 text-tinta-suave">
            <span>Inicial {day(initial.takenAt)} · Final {day(final.takenAt)}</span>
            <span className="flex gap-2">
              <button type="button" onClick={() => open(initial.id)} className="min-h-touch rounded-control border border-tinta/25 bg-white px-4 font-semibold text-tinta hover:bg-lila/30">Ampliar inicial</button>
              <button type="button" onClick={() => open(final.id)} className="min-h-touch rounded-control border border-tinta/25 bg-white px-4 font-semibold text-tinta hover:bg-lila/30">Ampliar final</button>
            </span>
          </div>
        </section>
      )}
      {err && <p role="alert" className="text-red-800">{err}</p>}
      <ul className="g-stagger grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.slice(0, visible).map((p) => (
          <li key={p.id} className="g-lift overflow-hidden rounded-card border border-tinta/10 bg-white shadow-soft">
            <button type="button" onClick={() => open(p.id)} aria-label={`Ampliar foto: ${PHOTO_KIND_LABEL[p.kind]}, ${day(p.takenAt)}`} className="group relative block w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- ver arriba */}
              <img src={`/panel-media/${p.id}?t=thumb`} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <span aria-hidden className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pb-2 pt-8 text-left text-sm font-semibold text-white">{PHOTO_KIND_LABEL[p.kind]} · {day(p.takenAt)}</span>
            </button>
          </li>
        ))}
      </ul>
      {photos.length > visible && (
        <div className="text-center">
          <p className="text-base text-tinta-suave">Mostrando {visible} de {photos.length} fotos</p>
          <button type="button" onClick={() => setVisible((v) => v + PHOTOS_PAGE)} className="mt-2 min-h-touch rounded-control border border-violeta-oscuro px-6 font-semibold text-violeta-oscuro hover:bg-lila/40">Ver más fotos</button>
        </div>
      )}

      <dialog ref={viewer} className="g-viewer" aria-label="Vista previa de la foto" onKeyDown={onKey} onClose={() => (opener.current as HTMLElement | null)?.focus?.()}
        onClick={(e) => { if (e.target === viewer.current) viewer.current?.close() }}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 p-3 md:p-4">
            <p className="min-w-0 truncate font-semibold">{PHOTO_KIND_LABEL[cur.kind]} · {day(cur.takenAt)} <span className="font-normal text-white/80">({Math.min(idx, photos.length - 1) + 1} de {photos.length})</span></p>
            <div className="flex shrink-0 gap-2">
              {deletable.includes(cur.id) && <button type="button" onClick={() => { setAsking(cur.id); confirmDlg.current?.showModal() }} className="min-h-touch rounded-control bg-white/15 px-4 font-semibold hover:bg-white/25">Borrar</button>}
              <button type="button" autoFocus onClick={() => viewer.current?.close()} aria-label="Cerrar vista previa" className="grid size-touch place-items-center rounded-control bg-white/15 hover:bg-white/25">
                <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 md:px-16">
            {photos.length > 1 && (
              <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="absolute left-2 z-10 grid size-touch place-items-center rounded-full bg-white/15 hover:bg-white/30 md:left-4">
                <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element -- ver arriba */}
            <img key={cur.id} src={`/panel-media/${cur.id}`} alt={`${PHOTO_KIND_LABEL[cur.kind]}, ${day(cur.takenAt)}`} className="g-viewer-img max-h-full max-w-full rounded-control object-contain shadow-2xl" />
            {photos.length > 1 && (
              <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className="absolute right-2 z-10 grid size-touch place-items-center rounded-full bg-white/15 hover:bg-white/30 md:right-4">
                <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            )}
          </div>
        </div>
      </dialog>

      <dialog ref={confirmDlg} className="g-modal text-tinta" aria-labelledby="borrar-foto" onClose={() => setAsking(null)} onClick={(e) => { if (e.target === confirmDlg.current) confirmDlg.current?.close() }}>
        <h2 id="borrar-foto" className="text-xl font-semibold">¿Borrar esta foto?</h2>
        <p className="mt-2">Deja de verse en la historia clínica. Queda registrado en la auditoría.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" autoFocus onClick={() => confirmDlg.current?.close()} className="min-h-touch rounded-control border border-tinta/60 px-5 hover:bg-lila/40">Cancelar</button>
          <button type="button" onClick={remove} className="min-h-touch rounded-control bg-error-texto px-5 font-semibold text-white hover:bg-tinta">Borrar foto</button>
        </div>
      </dialog>
    </div>
  )
}

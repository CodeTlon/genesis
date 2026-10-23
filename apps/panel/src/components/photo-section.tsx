import { fmtDate } from '@/lib/dates'
import { registerImageConsent, uploadPhoto } from '@/lib/photo-actions'
import type { PhotoMeta } from '@/lib/store'
import type { Entry, Patient } from '@/lib/types'
import { TEMPLATES } from '@/lib/templates'

const KIND = { primera_consulta: 'Primera consulta', evolucion: 'Evolución' } as const
const ERR: Record<string, string> = {
  consentimiento: 'Falta el consentimiento de imagen clínica de este paciente. Registralo antes de subir fotos.',
  tipo: 'Elegí si es de primera consulta o de evolución.',
  vacia: 'Elegí una foto para subir.',
  tamano: 'La foto pesa más de 4 MB. Probá con una más liviana.',
  invalida: 'El archivo no es una imagen válida (JPG, PNG o WebP).',
}

/** REQ-FOT-001..003: fotos de la primera consulta y de la evolución, ordenadas por fecha. Solo se piden con sesión (/fotos/[id]). */
export function PhotoSection({ patient, photos, entries, status }: { patient: Patient; photos: PhotoMeta[]; entries: Entry[]; status: { ok: boolean; error?: string } }) {
  const field = 'mt-1 block min-h-touch w-full rounded-control border border-tinta/40 bg-white px-3'
  const vigente = patient.consent.imageClinical === 'vigente'
  return (
    <section id="fotos" className="mt-10 print:hidden" aria-labelledby="fotos-t">
      <h2 id="fotos-t" className="text-xl font-light uppercase tracking-[0.12em]">Fotos clínicas</h2>
      {status.ok && <p role="status" className="mt-3 rounded-card bg-emerald-100 p-3 text-emerald-950">Foto guardada.</p>}
      {status.error && <p role="alert" className="mt-3 rounded-card bg-red-100 p-3 text-red-900">{ERR[status.error] ?? 'No se pudo subir la foto.'}</p>}
      {!vigente && (
        <form action={registerImageConsent} className="mt-3 flex flex-wrap items-center gap-3 rounded-card bg-amber-100 p-4 text-amber-950">
          <input type="hidden" name="patientId" value={patient.id} />
          <p className="flex-1">Consentimiento de imagen clínica pendiente{patient.guardian ? ' (lo firma el responsable)' : ''}.</p>
          <button className="min-h-touch rounded-control border border-amber-900 px-4">Registrar consentimiento firmado</button>
        </form>
      )}
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {photos.map((f) => (
          <li key={f.id} className="rounded-card bg-white p-3 shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element -- ruta privada con sesión: no puede pasar por el optimizador */}
            <img src={`/fotos/${f.id}`} alt={`${KIND[f.kind]}, ${fmtDate(f.createdAt.slice(0, 10))}`} className="aspect-square w-full rounded-control object-cover" loading="lazy" />
            <p className="mt-2 font-semibold">{KIND[f.kind]}</p>
            <p className="text-sm text-tinta/70">{fmtDate(f.createdAt.slice(0, 10))} · {f.author}</p>
            {f.note && <p className="text-sm">{f.note}</p>}
          </li>
        ))}
        {!photos.length && <li>Todavía no hay fotos.</li>}
      </ul>
      <form action={uploadPhoto} className="mt-4 grid gap-3 rounded-card bg-white p-4 shadow-soft sm:grid-cols-2">
        <input type="hidden" name="patientId" value={patient.id} />
        <div><label htmlFor="kind" className="font-semibold">Tipo</label>
          <select id="kind" name="kind" className={field} defaultValue="evolucion"><option value="primera_consulta">Primera consulta</option><option value="evolucion">Evolución</option></select></div>
        <div><label htmlFor="entryId" className="font-semibold">Atención (opcional)</label>
          <select id="entryId" name="entryId" className={field}><option value="">Sin atención asociada</option>
            {entries.map((e) => <option key={e.id} value={e.id}>{fmtDate(e.createdAt.slice(0, 10))} · {TEMPLATES[e.templateCode].name}</option>)}</select></div>
        <div><label htmlFor="file" className="font-semibold">Foto</label>
          <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp" className={field + ' py-2'} /></div>
        <div><label htmlFor="note" className="font-semibold">Nota (opcional)</label>
          <input id="note" name="note" className={field} /></div>
        <button className="min-h-touch rounded-control bg-violeta-oscuro px-5 text-white sm:col-span-2">Subir foto</button>
      </form>
    </section>
  )
}

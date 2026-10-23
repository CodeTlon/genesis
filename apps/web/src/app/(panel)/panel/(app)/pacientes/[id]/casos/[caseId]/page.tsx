import Link from 'next/link'
import { BackBar } from '@/panel/components/back-link'
import { notFound } from 'next/navigation'
import { AlertBadges } from '@/panel/components/alert-badges'
import { CloseCaseForm } from '@/panel/components/forms'
import { EntryView } from '@/panel/components/entry-view'
import { PhotoGrid, PhotoUpload } from '@/panel/components/photos'
import { requireUser } from '@/panel/lib/auth-server'
import { reopenCase } from '@/panel/lib/actions'
import * as repo from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

export default async function Caso({ params }: { params: Promise<{ id: string; caseId: string }> }) {
  const user = await requireUser()
  const { id, caseId } = await params
  const [p, c] = await Promise.all([repo.getPatient(id), repo.getCase(caseId)])
  if (!p || !c || c.patientId !== id) notFound() // el caso tiene que ser de ESE paciente (evita acceder por IDs cruzados)
  const [entries, photos] = await Promise.all([repo.listEntries(id, caseId), repo.listPhotos(id, caseId)])
  const open = c.status === 'open'
  return (
    <div className="space-y-8">
      <div>
        <BackBar trail={[{ href: '/panel/pacientes', label: 'Pacientes' }, { href: `/panel/pacientes/${id}`, label: `${p.firstName} ${p.lastName}` }]} />
        <h1 className="mt-4 text-3xl">{c.title}</h1>
        <p>{open ? 'Caso abierto' : 'Caso cerrado'}</p>
        <div className="mt-2"><AlertBadges alerts={p.alerts} /></div>
        {c.reason && <p className="mt-2"><strong>Motivo:</strong> {c.reason}</p>}
      </div>

      {open && <Link href={`/panel/pacientes/${id}/casos/${caseId}/atencion`} className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 text-white">Nueva evolución</Link>}

      <section aria-labelledby="fotos" className="space-y-3">
        <h2 id="fotos" className="text-xl uppercase tracking-[0.06em]">Fotos</h2>
        {open && <PhotoUpload patientId={id} caseId={caseId} />}
        <PhotoGrid photos={photos} deletable={photos.filter((ph) => user.role === 'admin' || ph.createdBy === user.id).map((ph) => ph.id)} />
      </section>

      <section aria-labelledby="evo" className="space-y-3">
        <h2 id="evo" className="text-xl uppercase tracking-[0.06em]">Evoluciones</h2>
        {entries.length === 0 ? <p>Todavía no hay evoluciones en este caso.</p> : entries.map((e) => <EntryView key={e.id} entry={e} />)}
      </section>

      <section aria-labelledby="cierre" className="space-y-3">
        <h2 id="cierre" className="text-xl uppercase tracking-[0.06em]">Conclusión y sugerencias</h2>
        {open ? (
          <details className="rounded-card bg-white p-4 shadow-soft"><summary className="min-h-touch cursor-pointer font-semibold">Cerrar el caso</summary><div className="mt-3"><CloseCaseForm c={c} /></div></details>
        ) : (
          <div className="space-y-2 rounded-card bg-white p-5 shadow-soft">
            <p><strong>Conclusión:</strong> {c.conclusion}</p>
            {c.suggestions && <p><strong>Sugerencias:</strong> {c.suggestions}</p>}
            <form action={async () => { 'use server'; await reopenCase(caseId) }}><button className="min-h-touch rounded-control border border-violeta-oscuro px-5 text-violeta-oscuro">Reabrir caso</button></form>
          </div>
        )}
      </section>
    </div>
  )
}

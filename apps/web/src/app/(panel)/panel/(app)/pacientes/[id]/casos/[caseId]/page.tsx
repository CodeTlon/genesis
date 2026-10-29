import Link from 'next/link'
import { BackBar } from '@/panel/components/back-link'
import { notFound } from 'next/navigation'
import { ClampText } from '@/panel/components/clamp-text'
import { AlertCard } from '@/panel/components/alert-card'
import { CloseCaseForm } from '@/panel/components/forms'
import { EntryView } from '@/panel/components/entry-view'
import { Pagination, parsePage } from '@/panel/components/pagination'
import { PhotoGrid, PhotoUpload } from '@/panel/components/photos'
import { requireUser } from '@/panel/lib/auth-server'
import { reopenCase } from '@/panel/lib/actions'
import * as repo from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

const PAGE = 10

export default async function Caso({ params, searchParams }: { params: Promise<{ id: string; caseId: string }>; searchParams: Promise<{ page?: string }> }) {
  const user = await requireUser()
  const { id, caseId } = await params
  const [p, c] = await Promise.all([repo.getPatient(id), repo.getCase(caseId)])
  if (!p || !c || c.patientId !== id) notFound() // el caso tiene que ser de ESE paciente (evita acceder por IDs cruzados)
  const totalEntries = await repo.countEntries(id, caseId)
  const page = parsePage((await searchParams).page, Math.ceil(totalEntries / PAGE))
  const [entries, photos] = await Promise.all([repo.listEntries(id, caseId, { limit: PAGE, offset: (page - 1) * PAGE }), repo.listPhotos(id, caseId)])
  const open = c.status === 'open'
  return (
    <div className="space-y-8">
      <div>
        <BackBar trail={[{ href: '/panel/pacientes', label: 'Pacientes' }, { href: `/panel/pacientes/${id}`, label: `${p.firstName} ${p.lastName}` }]} />
        <h1 className="mt-4 text-3xl">{c.title}</h1>
        <p className={`mt-1 inline-block rounded-full px-3 py-0.5 text-base font-semibold ${open ? 'bg-ok-fondo text-ok-texto' : 'bg-white text-tinta-suave ring-1 ring-tinta/30'}`}>{open ? 'Caso abierto' : 'Caso cerrado'}</p>
        <div className="mt-3 max-w-xl"><AlertCard alerts={p.alerts} /></div>
        {c.reason && <div className="mt-3 max-w-prose rounded-card bg-white p-4 shadow-soft"><span className="block text-base text-tinta-suave">Motivo de consulta</span><ClampText>{c.reason}</ClampText></div>}
      </div>

      {open && <Link href={`/panel/pacientes/${id}/casos/${caseId}/atencion`} className="inline-flex min-h-touch items-center rounded-control bg-violeta-oscuro px-6 font-semibold text-white hover:bg-tinta">Nueva evolución</Link>}

      <section aria-labelledby="evo" className="space-y-3">
        <h2 id="evo" className="text-xl uppercase tracking-[0.06em]">Evoluciones</h2>
        {entries.length === 0 ? <p>Todavía no hay evoluciones en este caso.</p> : <ol className="relative ml-1.5 space-y-3 border-l-2 border-tinta/10">{entries.map((e, i) => <EntryView key={e.id} entry={e} defaultOpen={i === 0 && page === 1} />)}</ol>}
        <Pagination base={`/panel/pacientes/${id}/casos/${caseId}`} page={page} total={totalEntries} pageSize={PAGE} noun={totalEntries === 1 ? 'evolución' : 'evoluciones'} />
      </section>

      <section aria-labelledby="fotos" className="space-y-3">
        <h2 id="fotos" className="text-xl uppercase tracking-[0.06em]">Fotos{photos.length > 0 && <span className="ml-2 rounded-full bg-lila/50 px-2.5 py-0.5 align-middle text-base normal-case tracking-normal text-violeta-oscuro">{photos.length}</span>}</h2>
        <PhotoGrid photos={photos} deletable={photos.filter((ph) => user.role === 'admin' || ph.createdBy === user.id).map((ph) => ph.id)} />
        {open && (
          <details className="g-acc rounded-card border border-lila/70 bg-white">
            <summary className="flex min-h-touch items-center justify-between gap-3 px-4 py-2 text-lg font-semibold text-violeta-oscuro">Agregar una foto<svg aria-hidden viewBox="0 0 24 24" className="g-chev size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg></summary>
            <div className="px-4 pb-4"><PhotoUpload patientId={id} caseId={caseId} /></div>
          </details>
        )}
      </section>

      <section aria-labelledby="cierre" className="space-y-3">
        <h2 id="cierre" className="text-xl uppercase tracking-[0.06em]">Cierre del caso</h2>
        {open ? (
          <details className="g-acc rounded-card bg-white p-4 shadow-soft"><summary className="flex min-h-touch items-center justify-between font-semibold">Cerrar el caso<svg aria-hidden viewBox="0 0 24 24" className="g-chev size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg></summary><div className="mt-3"><CloseCaseForm c={c} /></div></details>
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

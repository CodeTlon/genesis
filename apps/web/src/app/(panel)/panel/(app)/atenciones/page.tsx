import Link from 'next/link'
import { Tabs } from '@/panel/components/tabs'
import { requireUser } from '@/panel/lib/auth-server'
import { fullDate } from '@/panel/lib/format'
import { Pagination, parsePage } from '@/panel/components/pagination'
import { countAttentions, dashboard, listAttentions } from '@/panel/lib/repo'

export const dynamic = 'force-dynamic'

const PAGE = 25
const TABS = ['sin-firmar', 'firmadas'] as const

export default async function Atenciones({ searchParams }: { searchParams: Promise<{ tab?: string; page?: string }> }) {
  await requireUser()
  const sp = await searchParams
  const tab = (TABS as readonly string[]).includes(sp.tab ?? '') ? (sp.tab as (typeof TABS)[number]) : 'sin-firmar'
  const status = tab === 'sin-firmar' ? 'draft' : 'signed'
  const [d, total] = await Promise.all([dashboard(), countAttentions(status, tab === 'firmadas')])
  const page = parsePage(sp.page, Math.ceil(total / PAGE))
  const shown = await listAttentions(status, { limit: PAGE, offset: (page - 1) * PAGE, thisMonth: tab === 'firmadas' })
  const empty = tab === 'sin-firmar' ? ['Todo al día', 'No hay evoluciones sin firmar.'] : ['Todavía no hay firmas este mes', 'Acá aparecen las evoluciones que firmes durante el mes.']
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl">Atenciones</h1>
        <p className="mt-1 text-tinta-suave">{tab === 'sin-firmar' ? 'Evoluciones que quedaron en borrador. Abrí el caso para retomarlas y firmarlas.' : 'Evoluciones firmadas este mes. Ya no se editan: se corrigen con una adenda.'}</p>
      </header>
      <Tabs base="/panel/atenciones" current={tab} items={[{ id: 'sin-firmar', label: 'Sin firmar', badge: d.drafts }, { id: 'firmadas', label: 'Firmadas este mes', badge: d.signedThisMonth }]} />
      <div key={tab} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="g-enter outline-offset-4">
        {shown.length === 0 ? (
          <div className="rounded-card bg-white p-8 text-center shadow-soft">
            <p className="text-xl font-semibold">{empty[0]}</p>
            <p className="mt-1 text-tinta-suave">{empty[1]}</p>
          </div>
        ) : (
          <>
            <ul className="g-stagger divide-y divide-lila/50 rounded-card bg-white shadow-soft">
              {shown.map((p) => (
                <li key={p.entryId}>
                  <Link href={p.caseId ? `/panel/pacientes/${p.patientId}/casos/${p.caseId}` : `/panel/pacientes/${p.patientId}`} className="flex min-h-20 items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-lila/30">
                    <span className="min-w-0">
                      <span className="block truncate text-xl font-semibold">{p.patient}</span>
                      <span className="block truncate text-base text-tinta-suave">{p.caseTitle ?? 'Sin caso'}</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-3 py-0.5 text-base font-semibold ${tab === 'sin-firmar' ? 'bg-aviso-fondo text-aviso-texto' : 'bg-ok-fondo text-ok-texto'}`}>{tab === 'sin-firmar' ? 'Borrador del ' : 'Firmada el '}{fullDate(p.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4"><Pagination base="/panel/atenciones" params={{ tab }} page={page} total={total} pageSize={PAGE} noun={tab === 'sin-firmar' ? 'sin firmar' : 'firmadas'} /></div>
          </>
        )}
      </div>
    </div>
  )
}

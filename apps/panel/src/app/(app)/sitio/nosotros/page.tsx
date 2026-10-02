import { getContent } from '@genesis/db/content'
import { Notice, PageHead, Save, Text } from '@/components/cms'
import { ListEditor } from '@/components/list-editor'
import { saveNosotros } from '@/lib/cms-actions'

export const dynamic = 'force-dynamic'

export default async function Nosotros({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams
  const [about, team] = await Promise.all([getContent('about'), getContent('team')])
  return (
    <main>
      <PageHead title="Nosotros" back={{ href: '/sitio', label: 'Sitio web' }} view="/nosotros" />
      <Notice ok={sp.ok} error={sp.error} />
      <form action={saveNosotros} className="max-w-2xl space-y-6">
        <Text name="title" label="Título" defaultValue={about.title} />
        <Text name="lead" label="Frase principal" defaultValue={about.lead} textarea />
        <Text name="body" label="Texto" defaultValue={about.body} textarea rows={4} />
        <Text name="howTitle" label="Título de “cómo trabajamos”" defaultValue={about.howTitle} />
        <Text name="how" label="Texto de “cómo trabajamos”" defaultValue={about.how} textarea />
        <div>
          <p className="mb-1 font-semibold">Equipo</p>
          <p className="mb-2 text-sm">La matrícula profesional se muestra junto al nombre. Dejala vacía si todavía no la tenés.</p>
          <ListEditor name="team" itemLabel="Integrante" addLabel="+ Agregar integrante" initial={team.map((m) => ({ ...m }))}
            fields={[{ key: 'name', label: 'Nombre' }, { key: 'role', label: 'Rol o especialidad' }, { key: 'license', label: 'Matrícula profesional' }]} />
        </div>
        <Save />
      </form>
    </main>
  )
}

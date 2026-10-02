import { getContent } from '@genesis/db/content'
import { Notice, PageHead, Save, Text } from '@/components/cms'
import { ListEditor } from '@/components/list-editor'
import { saveContacto } from '@/lib/cms-actions'

export const dynamic = 'force-dynamic'

export default async function Contacto({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams
  const c = await getContent('contact')
  return (
    <main>
      <PageHead title="Contacto y horarios" back={{ href: '/sitio', label: 'Sitio web' }} view="/contacto" />
      <Notice ok={sp.ok} error={sp.error} />
      <form action={saveContacto} className="max-w-2xl space-y-6">
        <Text name="address" label="Dirección" defaultValue={c.address} />
        <Text name="mapsUrl" label="Link de Google Maps (“Cómo llegar”)" defaultValue={c.mapsUrl} hint="Pegá el link que sale al compartir el lugar desde Google Maps." />
        <div>
          <p className="mb-2 font-semibold">Horarios</p>
          <ListEditor name="hours" itemLabel="Línea" addLabel="+ Agregar línea de horario" initial={c.hours.map((text) => ({ text }))} fields={[{ key: 'text', label: 'Por ejemplo: Lunes a viernes de 9 a 18 h' }]} />
        </div>
        <Text name="phone" label="Teléfono (opcional)" defaultValue={c.phone} />
        <Text name="email" label="Email (opcional)" defaultValue={c.email} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="instagram" label="Link de Instagram" defaultValue={c.instagram} />
          <Text name="instagramHandle" label="Usuario de Instagram" defaultValue={c.instagramHandle} />
        </div>
        <Save />
      </form>
    </main>
  )
}

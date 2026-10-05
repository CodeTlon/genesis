import { getContent } from '@genesis/db/content'
import { Check, Notice, PageHead, Save, Text } from '@/components/cms'
import { saveGeneral } from '@/lib/cms-actions'

export const dynamic = 'force-dynamic'

export default async function General({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams
  const [notice, seo, disclaimer] = await Promise.all([getContent('notice'), getContent('seo'), getContent('disclaimer')])
  return (
    <main>
      <PageHead title="Avisos y buscadores" back={{ href: '/sitio', label: 'Sitio web' }} view="/" />
      <Notice ok={sp.ok} error={sp.error} />
      <form action={saveGeneral} className="max-w-2xl space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-normal uppercase tracking-[0.06em]">Aviso en la parte de arriba</h2>
          <p>Una franja que se ve en todas las páginas. Sirve para avisar, por ejemplo, “Cerrado por feriado el lunes”.</p>
          <Check name="noticeActive" label="Mostrar el aviso" defaultChecked={notice.active} />
          <Text name="noticeText" label="Texto del aviso" defaultValue={notice.text} />
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-normal uppercase tracking-[0.06em]">Cómo aparece en Google</h2>
          <Text name="seoTitle" label="Título" defaultValue={seo.title} hint="Lo que se lee en el resultado de búsqueda. Ideal: menos de 60 letras." />
          <Text name="seoDescription" label="Descripción" defaultValue={seo.description} textarea hint="Ideal: entre 120 y 160 letras." />
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-normal uppercase tracking-[0.06em]">Aviso de resultados</h2>
          <Text name="disclaimer" label="Texto que aparece al pie de los servicios y la galería" defaultValue={disclaimer} textarea />
        </section>
        <Save />
      </form>
    </main>
  )
}

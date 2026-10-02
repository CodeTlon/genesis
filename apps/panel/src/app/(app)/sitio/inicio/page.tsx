import { getContent } from '@genesis/db/content'
import { Notice, PageHead, Save, Text, ImageField } from '@/components/cms'
import { ListEditor } from '@/components/list-editor'
import { saveInicio } from '@/lib/cms-actions'

export const dynamic = 'force-dynamic'

export default async function Inicio({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams
  const [hero, section, steps] = await Promise.all([getContent('hero'), getContent('groupsSection'), getContent('steps')])
  return (
    <main>
      <PageHead title="Inicio" back={{ href: '/sitio', label: 'Sitio web' }} view="/" intro="Lo primero que ve la gente al entrar al sitio." />
      <Notice ok={sp.ok} error={sp.error} />
      <form action={saveInicio} className="max-w-2xl space-y-6">
        <Text name="eyebrow" label="Línea chica de arriba" defaultValue={hero.eyebrow} />
        <Text name="title" label="Título principal" defaultValue={hero.title} />
        <Text name="text" label="Texto de bienvenida" defaultValue={hero.text} textarea />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="primaryCta" label="Texto del botón principal" defaultValue={hero.primaryCta} />
          <Text name="secondaryCta" label="Texto del botón secundario" defaultValue={hero.secondaryCta} />
        </div>
        <ImageField name="heroImage" label="Imagen de la portada" current={hero.image} hint="Por ahora se muestra el logo; podés poner una foto con consentimiento." />
        <Text name="sectionTitle" label="Título de la sección de servicios" defaultValue={section.title} />
        <Text name="sectionText" label="Texto de la sección de servicios" defaultValue={section.text} textarea />
        <div>
          <p className="mb-2 font-semibold">Pasos “cómo funciona”</p>
          <ListEditor name="steps" itemLabel="Paso" addLabel="+ Agregar paso" initial={steps} fields={[{ key: 'title', label: 'Título' }, { key: 'text', label: 'Texto', textarea: true }]} />
        </div>
        <Save />
      </form>
    </main>
  )
}

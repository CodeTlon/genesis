import { getGallery } from '@genesis/db/content'
import { Check, ImageField, Notice, PageHead, Save, Text } from '@/components/cms'
import { addGalleryItem, moveItem, removeGalleryItem, updateGalleryItem } from '@/lib/cms-actions'
import { previewUrl } from '@/lib/cms'

export const dynamic = 'force-dynamic'

const Hidden = ({ v }: { v: Record<string, string> }) => <>{Object.entries(v).map(([k, val]) => <input key={k} type="hidden" name={k} value={val} />)}</>

export default async function Galeria({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const sp = await searchParams
  const items = await getGallery({ all: true })
  return (
    <main className="max-w-3xl">
      <PageHead title="Galería" back={{ href: '/sitio', label: 'Sitio web' }} view="/galeria"
        intro="Solo se publican fotos sin personas, o con el consentimiento de uso público de quien aparece. El sistema no deja publicar una foto sin esa confirmación." />
      <Notice ok={sp.ok} error={sp.error} />

      <ul className="space-y-4">
        {items.map((it, i) => (
          <li key={it.id} className="rounded-card bg-white p-4 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl(it.image)} alt={it.alt} className="aspect-[4/3] w-full rounded-control object-cover" />
              <form action={updateGalleryItem} className="space-y-3">
                <Hidden v={{ id: it.id, image: it.image }} />
                <Text name="alt" label="Descripción de la foto" defaultValue={it.alt} />
                <Check name="consent" label="Confirmo que no hay personas, o tengo su consentimiento de uso público" defaultChecked={it.consent_public} />
                <Check name="published" label="Visible en la galería" defaultChecked={it.published} />
                <Save>Guardar</Save>
              </form>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-lila/50 pt-3">
              {(['up', 'down'] as const).map((dir) => (
                <form key={dir} action={moveItem}>
                  <Hidden v={{ table: 'gallery_items', id: it.id, dir, return: '/sitio/galeria' }} />
                  <button disabled={(dir === 'up' && i === 0) || (dir === 'down' && i === items.length - 1)} className="min-h-touch rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro disabled:opacity-40">{dir === 'up' ? '↑ Subir' : '↓ Bajar'}</button>
                </form>
              ))}
              <form action={removeGalleryItem}>
                <Hidden v={{ id: it.id, image: it.image }} />
                <button className="min-h-touch rounded-control border border-red-800 px-4 text-red-900">Eliminar foto</button>
              </form>
            </div>
          </li>
        ))}
        {!items.length && <li>Todavía no hay fotos.</li>}
      </ul>

      <form action={addGalleryItem} encType="multipart/form-data" className="mt-8 space-y-4 rounded-card bg-lila/30 p-5">
        <h2 className="text-lg font-semibold">Subir una foto</h2>
        <ImageField name="image" label="Foto" hint="Se achica y se le borran los datos ocultos (ubicación, cámara) automáticamente." />
        <Text name="alt" label="Descripción de la foto" placeholder="Por ejemplo: Camilla de la cabina de estética" />
        <Check name="consent" label="Confirmo que no hay personas, o tengo su consentimiento de uso público" />
        <Check name="published" label="Publicarla ahora" hint="Solo se publica si confirmaste el consentimiento." />
        <Save>Subir foto</Save>
      </form>
    </main>
  )
}

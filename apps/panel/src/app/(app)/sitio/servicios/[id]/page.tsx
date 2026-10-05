import { notFound } from 'next/navigation'
import { getGroups } from '@genesis/db/content'
import { Check, ImageField, Notice, PageHead, Save, Text } from '@/components/cms'
import { ListEditor } from '@/components/list-editor'
import { moveItem, removeGroup, removeService, updateGroup, upsertService } from '@/lib/cms-actions'

export const dynamic = 'force-dynamic'

const Hidden = ({ v }: { v: Record<string, string> }) => <>{Object.entries(v).map(([k, val]) => <input key={k} type="hidden" name={k} value={val} />)}</>

export default async function Grupo({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; error?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const g = (await getGroups({ all: true })).find((x) => x.id === id)
  if (!g) notFound()
  const here = `/sitio/servicios/${g.id}`

  return (
    <main className="max-w-3xl">
      <PageHead title={g.name} back={{ href: '/sitio/servicios', label: 'Servicios' }} view={`/servicios/${g.slug}`} />
      <Notice ok={sp.ok} error={sp.error} />

      <form action={updateGroup} className="space-y-6">
        <Hidden v={{ id: g.id }} />
        <h2 className="text-xl font-normal uppercase tracking-[0.06em]">Página del grupo</h2>
        <Text name="name" label="Nombre" defaultValue={g.name} />
        <Text name="slug" label="Dirección de la página" defaultValue={g.slug} hint="Es la parte final del link. Si la cambiás, el link anterior deja de funcionar." />
        <Text name="tagline" label="Frase corta" defaultValue={g.tagline} />
        <Text name="intro" label="Introducción" defaultValue={g.intro} textarea />
        <ImageField name="image" label="Foto del grupo" current={g.image} hint="Usá fotos de equipos o productos, o fotos con consentimiento de uso público." />
        <div>
          <p className="mb-2 font-semibold">Preguntas frecuentes</p>
          <ListEditor name="faq" itemLabel="Pregunta" addLabel="+ Agregar pregunta" initial={g.faq.map((f) => ({ ...f }))} fields={[{ key: 'q', label: 'Pregunta' }, { key: 'a', label: 'Respuesta', textarea: true }]} />
        </div>
        <Check name="published" label="Visible en el sitio" defaultChecked={g.published} hint="Si lo destildás, la página y su tarjeta se ocultan." />
        <div className="flex flex-wrap gap-3"><Save>Guardar grupo</Save></div>
      </form>

      <h2 className="mt-12 text-xl font-normal uppercase tracking-[0.06em]">Tratamientos</h2>
      <p className="mt-1 mb-4">Abrí un tratamiento para editarlo. Las sesiones y el precio son opcionales: si los dejás vacíos, no se muestran.</p>
      <ul className="space-y-3">
        {g.services.map((s, i) => (
          <li key={s.id}>
            <details className="rounded-card bg-white shadow-soft">
              <summary className="flex min-h-touch cursor-pointer items-center justify-between gap-3 p-4 font-semibold">
                <span>{s.name}</span><span className="text-sm font-normal">{s.published ? 'Visible' : 'Oculto'}</span>
              </summary>
              <div className="space-y-4 border-t border-lila/50 p-4">
                <form action={upsertService} className="space-y-4">
                  <Hidden v={{ id: s.id, groupId: g.id }} />
                  <Text name="name" label="Nombre" defaultValue={s.name} />
                  <Text name="hook" label="Pregunta o frase gancho" defaultValue={s.hook} />
                  <Text name="summary" label="Descripción" defaultValue={s.summary} textarea rows={4} hint="Redacción prudente: sin prometer resultados." />
                  <ImageField name="image" label="Foto del tratamiento" current={s.image} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Text name="sessions" label="Cantidad de sesiones (opcional)" defaultValue={s.sessions} />
                    <Text name="price" label="Precio (opcional)" defaultValue={s.price} />
                  </div>
                  <Text name="notice" label="Aclaración (opcional)" defaultValue={s.notice} />
                  <Check name="published" label="Visible en el sitio" defaultChecked={s.published} />
                  <Save>Guardar tratamiento</Save>
                </form>
                <div className="flex flex-wrap gap-2 border-t border-lila/50 pt-3">
                  {(['up', 'down'] as const).map((dir) => (
                    <form key={dir} action={moveItem}>
                      <Hidden v={{ table: 'site_services', id: s.id, dir, return: here }} />
                      <button disabled={(dir === 'up' && i === 0) || (dir === 'down' && i === g.services.length - 1)} className="min-h-touch rounded-control border border-violeta-oscuro px-4 text-violeta-oscuro disabled:opacity-40">{dir === 'up' ? '↑ Subir' : '↓ Bajar'}</button>
                    </form>
                  ))}
                  <form action={removeService}>
                    <Hidden v={{ id: s.id, groupId: g.id, image: s.image }} />
                    <button className="min-h-touch rounded-control border border-red-800 px-4 text-red-900">Eliminar tratamiento</button>
                  </form>
                </div>
              </div>
            </details>
          </li>
        ))}
        {!g.services.length && <li>Este grupo todavía no tiene tratamientos.</li>}
      </ul>

      <form action={upsertService} className="mt-6 space-y-3 rounded-card bg-lila/30 p-5">
        <Hidden v={{ groupId: g.id, published: 'on' }} />
        <h3 className="text-lg font-semibold">Agregar un tratamiento</h3>
        <Text name="name" label="Nombre" placeholder="Por ejemplo: Masaje descontracturante" />
        <Text name="summary" label="Descripción" textarea />
        <Save>Agregar tratamiento</Save>
        <p className="text-sm">Después de agregarlo podés completar la foto, el gancho, las sesiones y el precio.</p>
      </form>

      <form action={removeGroup} className="mt-12 border-t border-lila/60 pt-6">
        <Hidden v={{ id: g.id, image: g.image }} />
        <p className="mb-2 text-sm">Eliminar el grupo borra también todos sus tratamientos. Si solo querés sacarlo del sitio, destildá “Visible en el sitio”.</p>
        <button className="min-h-touch rounded-control border border-red-800 px-5 text-red-900">Eliminar grupo “{g.name}”</button>
      </form>
    </main>
  )
}

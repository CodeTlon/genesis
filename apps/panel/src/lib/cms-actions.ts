'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  deleteGalleryItem, deleteGroup, deleteMediaByUrl, deleteService, move, saveGalleryItem, saveGroup, saveService, setContent, setRequestStatus,
  type Faq,
} from '@genesis/db/content'
import { publishSite, resolveImage, jsonList, str, UserError } from './cms'

const back = (path: string, kind: 'ok' | 'error', msg = '1') => redirect(`${path}${path.includes('?') ? '&' : '?'}${kind}=${encodeURIComponent(msg)}`)

/** Ejecuta un guardado: si falla por algo esperado muestra un mensaje claro; si falla por otra cosa, un error genérico sin perder el formulario. */
async function run(path: string, fn: () => Promise<void>, okPath = path) {
  try {
    await fn()
  } catch (e) {
    if (e instanceof UserError) back(path, 'error', e.message)
    const code = (e as { code?: string }).code
    if (code === '23505') back(path, 'error', 'Ya existe un elemento con ese nombre. Elegí otro.')
    if (code === '23514') back(path, 'error', 'Para publicar la foto confirmá que no hay personas o que tenés su consentimiento.')
    back(path, 'error', 'No pudimos guardar. Probá de nuevo; no se perdió nada.')
  }
  await publishSite()
  revalidatePath('/sitio', 'layout')
  back(okPath, 'ok')
}

// ---------- Inicio ----------
export async function saveInicio(fd: FormData) {
  await run('/sitio/inicio', async () => {
    const image = await resolveImage(fd, 'heroImage')
    await setContent('hero', { eyebrow: str(fd, 'eyebrow'), title: str(fd, 'title'), text: str(fd, 'text'), primaryCta: str(fd, 'primaryCta') || 'Pedir turno', secondaryCta: str(fd, 'secondaryCta') || 'Ver servicios', image })
    await setContent('groupsSection', { title: str(fd, 'sectionTitle'), text: str(fd, 'sectionText') })
    await setContent('steps', jsonList<{ title: string; text: string }>(fd, 'steps').filter((s) => s.title?.trim()))
  })
}

// ---------- Nosotros ----------
export async function saveNosotros(fd: FormData) {
  await run('/sitio/nosotros', async () => {
    await setContent('about', { title: str(fd, 'title'), lead: str(fd, 'lead'), body: str(fd, 'body'), howTitle: str(fd, 'howTitle'), how: str(fd, 'how') })
    await setContent('team', jsonList<{ name: string; role: string; license: string; photo: string }>(fd, 'team').filter((m) => m.name?.trim()).map((m) => ({ name: m.name, role: m.role ?? '', license: m.license ?? '', photo: m.photo ?? '' })))
  })
}

// ---------- Contacto ----------
export async function saveContacto(fd: FormData) {
  await run('/sitio/contacto', async () => {
    await setContent('contact', {
      address: str(fd, 'address'), mapsUrl: str(fd, 'mapsUrl'), instagram: str(fd, 'instagram'), instagramHandle: str(fd, 'instagramHandle'),
      phone: str(fd, 'phone'), email: str(fd, 'email'),
      hours: jsonList<{ text: string }>(fd, 'hours').map((h) => h.text?.trim()).filter(Boolean),
    })
  })
}

// ---------- Avisos y SEO ----------
export async function saveGeneral(fd: FormData) {
  await run('/sitio/general', async () => {
    await setContent('notice', { active: fd.get('noticeActive') === 'on', text: str(fd, 'noticeText') })
    await setContent('seo', { title: str(fd, 'seoTitle'), description: str(fd, 'seoDescription') })
    await setContent('disclaimer', str(fd, 'disclaimer'))
  })
}

// ---------- Servicios ----------
export async function createGroup(fd: FormData) {
  const name = str(fd, 'name')
  if (!name) back('/sitio/servicios', 'error', 'Escribí el nombre del grupo.')
  let id = ''
  try {
    id = await saveGroup({ name, tagline: '', intro: '', image: '', faq: [], published: false })
  } catch (e) {
    back('/sitio/servicios', 'error', (e as { code?: string }).code === '23505' ? 'Ya existe un grupo con ese nombre.' : 'No pudimos crear el grupo.')
  }
  await publishSite()
  revalidatePath('/sitio', 'layout')
  back(`/sitio/servicios/${id}`, 'ok', 'Grupo creado. Completalo y publicalo cuando esté listo.')
}

export async function updateGroup(fd: FormData) {
  const id = str(fd, 'id')
  await run(`/sitio/servicios/${id}`, async () => {
    const image = await resolveImage(fd, 'image')
    await saveGroup({
      id, name: str(fd, 'name'), slug: str(fd, 'slug'), tagline: str(fd, 'tagline'), intro: str(fd, 'intro'), image,
      faq: jsonList<Faq>(fd, 'faq').filter((f) => f.q?.trim() && f.a?.trim()), published: fd.get('published') === 'on',
    })
  })
}

export async function removeGroup(fd: FormData) {
  const id = str(fd, 'id')
  await run('/sitio/servicios', async () => {
    const image = str(fd, 'image')
    await deleteGroup(id)
    if (image) await deleteMediaByUrl(image)
  })
}

export async function moveItem(fd: FormData) {
  const table = str(fd, 'table') as 'service_groups' | 'site_services' | 'gallery_items'
  if (!['service_groups', 'site_services', 'gallery_items'].includes(table)) return
  await move(table, str(fd, 'id'), str(fd, 'dir') === 'up' ? 'up' : 'down')
  await publishSite()
  revalidatePath('/sitio', 'layout')
  redirect(str(fd, 'return'))
}

export async function upsertService(fd: FormData) {
  const groupId = str(fd, 'groupId')
  const path = `/sitio/servicios/${groupId}`
  if (!str(fd, 'name')) back(path, 'error', 'Escribí el nombre del tratamiento.')
  await run(path, async () => {
    const image = await resolveImage(fd, 'image')
    await saveService({
      id: str(fd, 'id') || undefined, groupId, slug: str(fd, 'slug'), name: str(fd, 'name'), hook: str(fd, 'hook'), summary: str(fd, 'summary'),
      image, sessions: str(fd, 'sessions'), price: str(fd, 'price'), notice: str(fd, 'notice'), published: fd.get('published') === 'on',
    })
  })
}

export async function removeService(fd: FormData) {
  const path = `/sitio/servicios/${str(fd, 'groupId')}`
  await run(path, async () => {
    await deleteService(str(fd, 'id'))
    const image = str(fd, 'image')
    if (image) await deleteMediaByUrl(image)
  })
}

// ---------- Galería ----------
export async function addGalleryItem(fd: FormData) {
  await run('/sitio/galeria', async () => {
    const image = await resolveImage(fd, 'image')
    if (!image) throw new UserError('Elegí una imagen para subir.')
    if (!str(fd, 'alt')) throw new UserError('Escribí una descripción corta de la foto (la leen los lectores de pantalla).')
    await saveGalleryItem({ image, alt: str(fd, 'alt'), consent_public: fd.get('consent') === 'on', published: fd.get('published') === 'on' })
  })
}

export async function updateGalleryItem(fd: FormData) {
  await run('/sitio/galeria', async () => {
    await saveGalleryItem({ id: str(fd, 'id'), image: str(fd, 'image'), alt: str(fd, 'alt'), consent_public: fd.get('consent') === 'on', published: fd.get('published') === 'on' })
  })
}

export async function removeGalleryItem(fd: FormData) {
  await run('/sitio/galeria', async () => {
    await deleteGalleryItem(str(fd, 'id'))
    const image = str(fd, 'image')
    if (image) await deleteMediaByUrl(image)
  })
}

// ---------- Solicitudes ----------
export async function markRequest(fd: FormData) {
  const status = str(fd, 'status')
  if (status !== 'new' && status !== 'done' && status !== 'discarded') return
  await setRequestStatus(str(fd, 'id'), status)
  revalidatePath('/sitio', 'layout')
  redirect('/sitio/solicitudes')
}

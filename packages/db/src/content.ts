import { DEFAULT_CONTENT, DEFAULT_GALLERY, DEFAULT_GROUPS, type ContentKey, type Faq, type SiteContent } from '@genesis/content/defaults'
import { query, TENANT_ID } from './client'

export type { ContentKey, Faq, SiteContent }

export type Service = { id: string; slug: string; name: string; hook: string; summary: string; image: string; sessions: string; price: string; notice: string; position: number; published: boolean }
export type Group = { id: string; slug: string; name: string; tagline: string; intro: string; image: string; faq: Faq[]; position: number; published: boolean; services: Service[] }
export type GalleryItem = { id: string; image: string; alt: string; consent_public: boolean; position: number; published: boolean }
export type TurnoRequest = { id: string; name: string; phone: string; service_slug: string | null; note: string | null; status: string; created_at: string }

// ---------- Lectura (con respaldo a los textos por defecto si la base no responde o está vacía) ----------

export async function getContent<K extends ContentKey>(key: K): Promise<SiteContent[K]> {
  const def = DEFAULT_CONTENT[key]
  try {
    const rows = await query<{ value: unknown }>('SELECT value FROM site_content WHERE tenant_id=$1 AND key=$2', [TENANT_ID, key])
    if (!rows.length) return def
    const v = rows[0].value
    return (Array.isArray(def) || typeof def !== 'object' ? v : { ...(def as object), ...(v as object) }) as SiteContent[K]
  } catch {
    return def
  }
}

export async function setContent<K extends ContentKey>(key: K, value: SiteContent[K]): Promise<void> {
  await query(
    `INSERT INTO site_content (tenant_id, key, value) VALUES ($1,$2,$3)
     ON CONFLICT (tenant_id, key) DO UPDATE SET value = EXCLUDED.value`,
    [TENANT_ID, key, JSON.stringify(value)],
  )
}

const fallbackGroups = (): Group[] =>
  DEFAULT_GROUPS.map((g, i) => ({
    id: g.slug, slug: g.slug, name: g.name, tagline: g.tagline, intro: g.intro, image: g.image, faq: g.faq, position: i, published: true,
    services: g.services.map((s, j) => ({ ...s, id: `${g.slug}/${s.slug}`, position: j, published: true })),
  }))

export async function getGroups(opts: { all?: boolean } = {}): Promise<Group[]> {
  try {
    const gs = await query<Omit<Group, 'services'>>(
      `SELECT id, slug, name, tagline, intro, image, faq, position, published FROM service_groups
       WHERE tenant_id=$1 ${opts.all ? '' : 'AND published'} ORDER BY position, name`, [TENANT_ID])
    if (!gs.length) return opts.all ? [] : fallbackGroups()
    const ss = await query<Service & { group_id: string }>(
      `SELECT id, group_id, slug, name, hook, summary, image, sessions, price, notice, position, published FROM site_services
       WHERE tenant_id=$1 ${opts.all ? '' : 'AND published'} ORDER BY position, name`, [TENANT_ID])
    return gs.map((g) => ({ ...g, services: ss.filter((s) => s.group_id === g.id) }))
  } catch {
    return fallbackGroups()
  }
}

export async function getGroup(slug: string, opts: { all?: boolean } = {}): Promise<Group | undefined> {
  return (await getGroups(opts)).find((g) => g.slug === slug)
}

export async function getGallery(opts: { all?: boolean } = {}): Promise<GalleryItem[]> {
  const fallback: GalleryItem[] = DEFAULT_GALLERY.map((g, i) => ({ id: `d${i}`, ...g, consent_public: true, position: i, published: true }))
  try {
    const rows = await query<GalleryItem>(
      `SELECT id, image, alt, consent_public, position, published FROM gallery_items
       WHERE tenant_id=$1 ${opts.all ? '' : 'AND published AND consent_public'} ORDER BY position, id`, [TENANT_ID])
    return rows.length || opts.all ? rows : fallback
  } catch {
    return fallback
  }
}

// ---------- Escritura (la usa el panel) ----------

export const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)

export async function saveGroup(g: { id?: string; slug?: string; name: string; tagline: string; intro: string; image: string; faq: Faq[]; published: boolean }): Promise<string> {
  const slug = slugify(g.slug || g.name)
  if (!slug) throw new Error('El nombre no puede quedar vacío.')
  if (g.id) {
    await query(`UPDATE service_groups SET slug=$3, name=$4, tagline=$5, intro=$6, image=$7, faq=$8, published=$9, updated_at=now() WHERE id=$1 AND tenant_id=$2`,
      [g.id, TENANT_ID, slug, g.name, g.tagline, g.intro, g.image, JSON.stringify(g.faq), g.published])
    return g.id
  }
  const [r] = await query<{ id: string }>(
    `INSERT INTO service_groups (tenant_id, slug, name, tagline, intro, image, faq, published, position)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,(SELECT COALESCE(MAX(position)+1,0) FROM service_groups WHERE tenant_id=$1)) RETURNING id`,
    [TENANT_ID, slug, g.name, g.tagline, g.intro, g.image, JSON.stringify(g.faq), g.published])
  return r.id
}

export async function deleteGroup(id: string) {
  await query('DELETE FROM service_groups WHERE id=$1 AND tenant_id=$2', [id, TENANT_ID])
}

export async function saveService(s: { id?: string; groupId: string; slug?: string; name: string; hook: string; summary: string; image: string; sessions: string; price: string; notice: string; published: boolean }): Promise<string> {
  const slug = slugify(s.slug || s.name)
  if (!slug) throw new Error('El nombre no puede quedar vacío.')
  if (s.id) {
    await query(`UPDATE site_services SET group_id=$3, slug=$4, name=$5, hook=$6, summary=$7, image=$8, sessions=$9, price=$10, notice=$11, published=$12, updated_at=now() WHERE id=$1 AND tenant_id=$2`,
      [s.id, TENANT_ID, s.groupId, slug, s.name, s.hook, s.summary, s.image, s.sessions, s.price, s.notice, s.published])
    return s.id
  }
  const [r] = await query<{ id: string }>(
    `INSERT INTO site_services (tenant_id, group_id, slug, name, hook, summary, image, sessions, price, notice, published, position)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,(SELECT COALESCE(MAX(position)+1,0) FROM site_services WHERE group_id=$2)) RETURNING id`,
    [TENANT_ID, s.groupId, slug, s.name, s.hook, s.summary, s.image, s.sessions, s.price, s.notice, s.published])
  return r.id
}

export async function deleteService(id: string) {
  await query('DELETE FROM site_services WHERE id=$1 AND tenant_id=$2', [id, TENANT_ID])
}

/** Intercambia la posición con el vecino anterior/siguiente. */
export async function move(table: 'service_groups' | 'site_services' | 'gallery_items', id: string, dir: 'up' | 'down') {
  const scope = table === 'site_services' ? 'AND group_id = (SELECT group_id FROM site_services WHERE id=$1)' : ''
  const rows = await query<{ id: string; position: number }>(
    `SELECT id, position FROM ${table} WHERE tenant_id=$2 ${scope} ORDER BY position, id`, [id, TENANT_ID])
  // Normaliza a posiciones 0..n-1 y luego intercambia, para que dos filas con la misma posición no queden trabadas
  const order = rows.map((r) => r.id)
  const i = order.indexOf(id)
  const j = dir === 'up' ? i - 1 : i + 1
  if (i < 0 || j < 0 || j >= order.length) return
  ;[order[i], order[j]] = [order[j], order[i]]
  for (let k = 0; k < order.length; k++) await query(`UPDATE ${table} SET position=$1 WHERE id=$2`, [k, order[k]])
}

export async function saveGalleryItem(g: { id?: string; image: string; alt: string; consent_public: boolean; published: boolean }) {
  const published = g.published && g.consent_public // no se publica sin confirmar el consentimiento
  if (g.id) {
    await query(`UPDATE gallery_items SET image=$3, alt=$4, consent_public=$5, published=$6 WHERE id=$1 AND tenant_id=$2`, [g.id, TENANT_ID, g.image, g.alt, g.consent_public, published])
    return
  }
  await query(
    `INSERT INTO gallery_items (tenant_id, image, alt, consent_public, published, position)
     VALUES ($1,$2,$3,$4,$5,(SELECT COALESCE(MAX(position)+1,0) FROM gallery_items WHERE tenant_id=$1))`,
    [TENANT_ID, g.image, g.alt, g.consent_public, published])
}

export async function deleteGalleryItem(id: string) {
  await query('DELETE FROM gallery_items WHERE id=$1 AND tenant_id=$2', [id, TENANT_ID])
}

// ---------- Medios ----------

export async function saveMedia(m: { filename: string; mime: string; bytes: Buffer; width?: number; height?: number }): Promise<string> {
  const [r] = await query<{ id: string }>(
    'INSERT INTO media (tenant_id, filename, mime, bytes, width, height) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
    [TENANT_ID, m.filename, m.mime, m.bytes, m.width ?? null, m.height ?? null])
  return r.id
}

export async function getMedia(id: string): Promise<{ mime: string; bytes: Buffer } | undefined> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return undefined
  const rows = await query<{ mime: string; bytes: Buffer }>('SELECT mime, bytes FROM media WHERE id=$1 AND tenant_id=$2', [id, TENANT_ID])
  return rows[0]
}

/** Borra el archivo si la URL apunta a un medio subido (las rutas estáticas /img/... no se tocan). */
export async function deleteMediaByUrl(url: string) {
  const m = url.match(/^\/media\/([0-9a-f-]{36})$/)
  if (m) await query('DELETE FROM media WHERE id=$1 AND tenant_id=$2', [m[1], TENANT_ID])
}

// ---------- Solicitudes de turno (formulario del sitio) ----------

export async function createRequest(r: { name: string; phone: string; service_slug?: string; note?: string }) {
  await query('INSERT INTO appointment_requests (tenant_id, name, phone, service_slug, note) VALUES ($1,$2,$3,$4,$5)', [TENANT_ID, r.name, r.phone, r.service_slug || null, r.note || null])
}

export async function listRequests(): Promise<TurnoRequest[]> {
  try {
    return await query<TurnoRequest>(
      `SELECT id, name, phone, service_slug, note, status, created_at FROM appointment_requests WHERE tenant_id=$1 ORDER BY (status='new') DESC, created_at DESC LIMIT 200`, [TENANT_ID])
  } catch {
    return []
  }
}

export async function setRequestStatus(id: string, status: 'new' | 'done' | 'discarded') {
  await query(`UPDATE appointment_requests SET status=$3::text, handled_at=CASE WHEN $3::text='new' THEN NULL ELSE now() END WHERE id=$1 AND tenant_id=$2`, [id, TENANT_ID, status])
}

export async function countNewRequests(): Promise<number> {
  try {
    const [r] = await query<{ n: string }>(`SELECT count(*) AS n FROM appointment_requests WHERE tenant_id=$1 AND status='new'`, [TENANT_ID])
    return Number(r.n)
  } catch {
    return 0
  }
}

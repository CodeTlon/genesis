// Carga el contenido inicial del sitio (grupos, servicios, galería) para poder editarlo desde el panel. Idempotente.
import { DEFAULT_GALLERY, DEFAULT_GROUPS } from '@genesis/content/defaults'
import { pool, query, TENANT_ID } from './client'

const [{ n }] = await query<{ n: string }>('SELECT count(*) AS n FROM service_groups WHERE tenant_id=$1', [TENANT_ID])
if (Number(n) > 0) {
  console.log('seed: ya hay contenido, no se toca nada')
} else {
  let gi = 0
  for (const g of DEFAULT_GROUPS) {
    const [row] = await query<{ id: string }>(
      `INSERT INTO service_groups (tenant_id, slug, name, tagline, intro, image, faq, position) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [TENANT_ID, g.slug, g.name, g.tagline, g.intro, g.image, JSON.stringify(g.faq), gi++])
    let si = 0
    for (const s of g.services) {
      await query(
        `INSERT INTO site_services (tenant_id, group_id, slug, name, hook, summary, image, sessions, price, notice, position) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [TENANT_ID, row.id, s.slug, s.name, s.hook, s.summary, s.image, s.sessions, s.price, s.notice, si++])
    }
  }
  let pi = 0
  for (const g of DEFAULT_GALLERY) {
    await query(`INSERT INTO gallery_items (tenant_id, image, alt, consent_public, published, position) VALUES ($1,$2,$3,true,true,$4)`, [TENANT_ID, g.image, g.alt, pi++])
  }
  console.log(`seed: ${DEFAULT_GROUPS.length} grupos, ${DEFAULT_GROUPS.reduce((a, g) => a + g.services.length, 0)} servicios, ${DEFAULT_GALLERY.length} fotos de galería`)
}
await pool().end()

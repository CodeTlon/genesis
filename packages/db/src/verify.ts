// Verifica contra un Postgres real las garantías del esquema. Corre dentro de una transacción que se revierte.
import pg from 'pg'

const url = process.env.DATABASE_URL ?? 'postgres://genesis:genesis@localhost:5432/genesis'
const c = new pg.Client({ connectionString: url })
await c.connect()

let failed = 0
const check = (name: string, ok: boolean, detail = '') => { console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`); if (!ok) failed++ }

async function rejects(name: string, sql: string, params: unknown[] = [], expect?: RegExp) {
  await c.query('SAVEPOINT s')
  try { await c.query(sql, params); check(name, false, 'se permitió y no debía'); }
  catch (e) { const m = (e as Error).message; check(name, !expect || expect.test(m), m); }
  await c.query('ROLLBACK TO SAVEPOINT s')
}

await c.query('BEGIN')
try {
  const id = async (sql: string, p: unknown[] = []) => (await c.query(sql, p)).rows[0].id as string
  const t = await id(`INSERT INTO tenants (name) VALUES ('t') RETURNING id`)
  const area = await id(`INSERT INTO areas (tenant_id, name) VALUES ($1,'Podología') RETURNING id`, [t])
  const pr1 = await id(`INSERT INTO professionals (tenant_id, full_name, area_id) VALUES ($1,'Inés',$2) RETURNING id`, [t, area])
  const pr2 = await id(`INSERT INTO professionals (tenant_id, full_name, area_id) VALUES ($1,'Valentina',$2) RETURNING id`, [t, area])
  const res = await id(`INSERT INTO resources (tenant_id, name) VALUES ($1,'Cabina 1') RETURNING id`, [t])
  const svc = await id(`INSERT INTO services (tenant_id, slug, name, area_id, duration_min) VALUES ($1,'s','S',$2,45) RETURNING id`, [t, area])
  const pat = await id(`INSERT INTO patients (tenant_id, first_name, last_name, dni) VALUES ($1,'María','González','00.000.001') RETURNING id`, [t])

  const appt = (pro: string, resource: string | null, from: string, to: string, status = 'confirmed') =>
    c.query(`INSERT INTO appointments (tenant_id, patient_id, service_id, professional_id, resource_id, during, status) VALUES ($1,$2,$3,$4,$5,tstzrange($6,$7),$8)`, [t, pat, svc, pro, resource, from, to, status])
  const A = '2026-10-05T10:00:00-03', B = '2026-10-05T10:45:00-03', C = '2026-10-05T10:30:00-03', D = '2026-10-05T11:15:00-03'

  await appt(pr1, res, A, B)
  check('turno válido se guarda', true)
  await rejects('misma profesional, horario superpuesto → rechazado', `INSERT INTO appointments (tenant_id, patient_id, service_id, professional_id, during) VALUES ($1,$2,$3,$4,tstzrange($5,$6))`, [t, pat, svc, pr1, C, D], /conflicting key|exclusion|appointments_/i)
  await rejects('otra profesional pero mismo recurso superpuesto → rechazado', `INSERT INTO appointments (tenant_id, patient_id, service_id, professional_id, resource_id, during) VALUES ($1,$2,$3,$4,$5,tstzrange($6,$7))`, [t, pat, svc, pr2, res, C, D], /conflicting key|exclusion|appointments_/i)
  await appt(pr2, null, C, D); check('otra profesional, sin recurso, mismo horario → permitido', true)
  await appt(pr1, res, B, D); check('turnos consecutivos (sin superposición) → permitido', true)
  await c.query(`UPDATE appointments SET status='cancelled' WHERE professional_id=$1 AND during=tstzrange($2,$3)`, [pr1, A, B])
  await appt(pr1, res, A, B); check('un turno cancelado libera el horario', true)

  const tpl = await id(`INSERT INTO form_templates (tenant_id, code, name) VALUES ($1,'B','Podología') RETURNING id`, [t])
  const ver = await id(`INSERT INTO form_template_versions (template_id, version, schema) VALUES ($1,1,'{}') RETURNING id`, [tpl])
  const entry = async (status: string) => id(`INSERT INTO clinical_entries (tenant_id, patient_id, professional_id, template_version_id, payload, status) VALUES ($1,$2,$3,$4,'{"a":1}',$5) RETURNING id`, [t, pat, pr1, ver, status])
  const draft = await entry('draft')
  await c.query(`UPDATE clinical_entries SET payload='{"a":2}' WHERE id=$1`, [draft]); check('un borrador sí se edita', true)
  await c.query(`UPDATE clinical_entries SET status='signed', signed_at=now() WHERE id=$1`, [draft]); check('un borrador se puede firmar', true)
  await rejects('entrada firmada: UPDATE rechazado', `UPDATE clinical_entries SET payload='{"a":3}' WHERE id=$1`, [draft], /firmada/i)
  await rejects('entrada firmada: DELETE rechazado', `DELETE FROM clinical_entries WHERE id=$1`, [draft], /firmada/i)
  await c.query(`INSERT INTO clinical_addenda (entry_id, author_id, reason, payload) VALUES ($1,$2,'corrección','{}')`, [draft, pr1]); check('la corrección va como adenda', true)

  const hits = async (q: string) => (await c.query(`SELECT 1 FROM patients WHERE search_text ILIKE '%'||immutable_unaccent(lower($1))||'%'`, [q])).rowCount
  check('búsqueda "gonzalez" encuentra "González"', (await hits('gonzalez')) === 1)
  check('búsqueda por DNI', (await hits('00.000.001')) === 1)
  const sim = await c.query(`SELECT word_similarity(immutable_unaccent(lower($1)), search_text) AS s FROM patients`, ['gonsalez'])
  check('búsqueda con error de tipeo ("gonsalez") por similitud', Number(sim.rows[0].s) > 0.4, `similitud ${Number(sim.rows[0].s).toFixed(2)}`)
} finally {
  await c.query('ROLLBACK')
  await c.end()
}
console.log(failed ? `\n${failed} verificación(es) fallaron` : '\nTodas las verificaciones pasaron')
process.exit(failed ? 1 : 0)

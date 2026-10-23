import test from 'node:test'
import assert from 'node:assert/strict'
import pg from 'pg'

const DB = process.env.DATABASE_URL ?? 'postgres://genesis:genesis@localhost:5432/genesis'
const TENANT = '00000000-0000-0000-0000-000000000001'

test('[REQ-SEG-005] el registro de accesos admite altas pero no se edita, borra ni vacía', async () => {
  const c = new pg.Client({ connectionString: DB })
  await c.connect()
  try {
    const { rows } = await c.query(`INSERT INTO hc_audit (tenant_id, user_name, action, detail) VALUES ($1,'Prueba','test','contrato') RETURNING id`, [TENANT])
    const id = rows[0].id
    await assert.rejects(c.query('UPDATE hc_audit SET user_name=$2 WHERE id=$1', [id, 'Otro']), /no se modifica ni se borra/)
    await assert.rejects(c.query('DELETE FROM hc_audit WHERE id=$1', [id]), /no se modifica ni se borra/)
    await assert.rejects(c.query('TRUNCATE hc_audit'), /no se modifica ni se borra/)
  } finally {
    await c.end()
  }
})

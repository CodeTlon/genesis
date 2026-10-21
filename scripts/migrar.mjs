// Aplica las migraciones SQL pendientes (packages/db/migrations). Falla cerrado: si una migración falla, sale con código 1
// y el contenedor NO arranca. Cada migración corre en su propia transacción. Uso: DATABASE_URL=... node scripts/migrar.mjs
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const url = process.env.DATABASE_URL ?? 'postgres://genesis:genesis@localhost:5433/genesis'
const dir = process.env.MIGRATIONS_DIR ?? join(dirname(fileURLToPath(import.meta.url)), '..', 'packages', 'db', 'migrations')

const client = new pg.Client({ connectionString: url })
try {
  await client.connect()
  await client.query('CREATE TABLE IF NOT EXISTS _migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
  const done = new Set((await client.query('SELECT name FROM _migrations')).rows.map((r) => r.name))
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    if (done.has(file)) continue
    await client.query('BEGIN')
    try {
      await client.query(readFileSync(join(dir, file), 'utf8'))
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log('migración aplicada:', file)
    } catch (e) {
      await client.query('ROLLBACK')
      throw new Error(`Migración ${file} falló: ${e.message}`)
    }
  }
} catch (e) {
  console.error('MIGRACIONES: ERROR —', e.message)
  process.exit(1)
} finally {
  await client.end().catch(() => {})
}

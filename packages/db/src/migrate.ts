import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const url = process.env.DATABASE_URL ?? 'postgres://genesis:genesis@localhost:5432/genesis'
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations')

const client = new pg.Client({ connectionString: url })
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
    console.log('aplicada', file)
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  }
}
await client.end()

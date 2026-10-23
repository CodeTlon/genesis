// Alta de un profesional: npm run user:add -- <usuario> "<Nombre visible>" [contraseña]
// Sin contraseña, genera una al azar y la muestra una sola vez. Usa DATABASE_URL.
import { randomBytes } from 'node:crypto'
import pg from 'pg'
import { hashPassword } from '../apps/panel/src/lib/auth-core.ts'

const [username, name, given] = process.argv.slice(2)
if (!username || !name) { console.error('Uso: npm run user:add -- <usuario> "<Nombre visible>" [contraseña]'); process.exit(1) }
const password = given ?? randomBytes(9).toString('base64url')
const c = new pg.Client({ connectionString: process.env.DATABASE_URL ?? 'postgres://genesis:genesis@localhost:5432/genesis' })
await c.connect()
await c.query(
  `INSERT INTO hc_users (id, tenant_id, username, display_name, password_hash) VALUES ($1,'00000000-0000-0000-0000-000000000001',$2,$3,$4)
   ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, display_name = EXCLUDED.display_name`,
  [`u-${username.toLowerCase()}`, username.toLowerCase(), name, hashPassword(password)])
await c.end()
console.log(`Usuario: ${username.toLowerCase()}\nContraseña: ${password}${given ? '' : '\n(Guardala ahora: no se vuelve a mostrar.)'}`)

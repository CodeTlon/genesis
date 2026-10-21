// Alta de un usuario del panel (no hay registro público). Uso, dentro del contenedor o en local:
//   DATABASE_URL=... node scripts/crear-usuario.mjs "Nombre Apellido" correo@dominio.com [admin|profesional] [matrícula]
// La contraseña se pide por la terminal (no queda en el historial ni en argumentos del proceso).
import { randomBytes, randomUUID } from 'node:crypto'
import { createInterface } from 'node:readline/promises'
import pg from 'pg'
import { hashPassword } from 'better-auth/crypto'

const [name, email, role = 'profesional', license = null] = process.argv.slice(2)
if (!name || !email || !['admin', 'profesional'].includes(role)) {
  console.error('Uso: node scripts/crear-usuario.mjs "Nombre" correo@dominio.com [admin|profesional] [matrícula]')
  process.exit(1)
}
const url = process.env.DATABASE_URL
if (!url) { console.error('Falta DATABASE_URL'); process.exit(1) }

let password = process.env.USER_PASSWORD
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  password = await rl.question('Contraseña (mínimo 12 caracteres, vacío = generar una): ')
  rl.close()
}
let generated = false
if (!password) { password = randomBytes(15).toString('base64url'); generated = true }
if (password.length < 12) { console.error('La contraseña debe tener al menos 12 caracteres'); process.exit(1) }

const c = new pg.Client({ connectionString: url })
await c.connect()
try {
  await c.query('BEGIN')
  const id = randomUUID().replaceAll('-', '')
  await c.query('INSERT INTO "user" (id, name, email, email_verified, role, license_no) VALUES ($1,$2,$3,true,$4,$5)', [id, name, email.toLowerCase(), role, license])
  await c.query(`INSERT INTO account (id, account_id, provider_id, user_id, password) VALUES ($1,$2,'credential',$2,$3)`, [randomUUID().replaceAll('-', ''), id, await hashPassword(password)])
  await c.query('COMMIT')
  console.log(`Usuario creado: ${email} (${role})`)
  if (generated) console.log(`Contraseña generada (guardala ahora, no se vuelve a mostrar): ${password}`)
} catch (e) {
  await c.query('ROLLBACK')
  console.error(e.code === '23505' ? 'Ya existe un usuario con ese correo' : e.message)
  process.exit(1)
} finally {
  await c.end()
}

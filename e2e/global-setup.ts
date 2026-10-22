import { resetDemo } from '../apps/panel/src/lib/store'
import { pool } from '@genesis/db/client'

// Las historias ahora persisten en Postgres: cada corrida arranca desde los datos ficticios de la demo.
export default async function globalSetup() {
  process.env.GENESIS_ALLOW_RESET = '1'
  await resetDemo()
  await pool().end()
}

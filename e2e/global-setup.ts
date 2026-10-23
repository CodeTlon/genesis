import { resetDemo } from '../apps/panel/src/lib/store'
import { pool } from '@genesis/db/client'
import { TEST_ENV } from './env'

// Las historias persisten en Postgres y van cifradas: cada corrida arranca desde los datos ficticios, con la clave de prueba.
export default async function globalSetup() {
  Object.assign(process.env, TEST_ENV, { GENESIS_ALLOW_RESET: '1' })
  await resetDemo()
  await pool().end()
}

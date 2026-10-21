import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

export const TENANT_ID = '00000000-0000-0000-0000-000000000001'

const g = globalThis as unknown as { __genesisPool?: pg.Pool }

/** Pool único por proceso. En producción DATABASE_URL es obligatoria: nunca se cae a una base local por defecto. */
export function pool(): pg.Pool {
  const url = process.env.DATABASE_URL
  if (!url && process.env.NODE_ENV === 'production') throw new Error('DATABASE_URL no configurada')
  return (g.__genesisPool ??= new pg.Pool({
    connectionString: url ?? 'postgres://genesis:genesis@localhost:5433/genesis',
    connectionTimeoutMillis: url ? 5000 : 1500,
    max: 10,
  }))
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await pool().query<T>(text, params)).rows
}

/** Acceso tipado (Drizzle) sobre el mismo pool. */
export const db = () => drizzle(pool(), { schema })
export { schema }

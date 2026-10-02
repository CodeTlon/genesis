import pg from 'pg'

export const TENANT_ID = '00000000-0000-0000-0000-000000000001'

const g = globalThis as unknown as { __genesisPool?: pg.Pool }

/** Pool único por proceso. Timeout corto: si la base no responde, el sitio cae a los textos por defecto. */
export function pool(): pg.Pool {
  return (g.__genesisPool ??= new pg.Pool({
    connectionString: process.env.DATABASE_URL ?? 'postgres://genesis:genesis@localhost:5432/genesis',
    connectionTimeoutMillis: 1500,
    max: 5,
  }))
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await pool().query<T>(text, params)).rows
}

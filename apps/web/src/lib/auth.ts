import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db, schema } from '@genesis/db/client'

const prod = process.env.NODE_ENV === 'production'

function create() {
  const secret = process.env.BETTER_AUTH_SECRET
  if (prod && (!secret || secret.length < 32)) throw new Error('BETTER_AUTH_SECRET obligatoria en producción (>= 32 caracteres)')
  return betterAuth({
    database: drizzleAdapter(db(), {
      provider: 'pg',
      schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
    }),
    secret: secret ?? 'solo-desarrollo-local-no-usar-en-produccion',
    baseURL: process.env.BETTER_AUTH_URL,
    // Sin registro público: los usuarios los da de alta el administrador (scripts/crear-usuario.mjs).
    emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 12, maxPasswordLength: 128 },
    user: {
      additionalFields: {
        role: { type: 'string', required: false, defaultValue: 'profesional', input: false },
        licenseNo: { type: 'string', required: false, input: false },
      },
    },
    session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 30 },
    advanced: { useSecureCookies: prod },
    rateLimit: { enabled: true, window: 60, max: 60, customRules: { '/sign-in/email': { window: 60, max: 5 } } },
    plugins: [nextCookies()],
  })
}

type Auth = ReturnType<typeof create>
const g = globalThis as unknown as { __genesisAuth?: Auth }
/** Diferido: importar este módulo no abre la base (el build no la necesita). */
export const getAuth = (): Auth => (g.__genesisAuth ??= create())

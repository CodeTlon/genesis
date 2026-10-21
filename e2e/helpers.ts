import { execFileSync } from 'node:child_process'
import { expect, type Page } from '@playwright/test'

export const DB = process.env.DATABASE_URL ?? 'postgres://genesis:genesis@localhost:5433/genesis'
export const USER = { name: 'Inés de Prueba', email: 'ines.e2e@example.test', password: 'clave-e2e-segura-123' }

/** Crea el usuario de pruebas (idempotente: si ya existe, sigue). */
export function ensureUser(role: 'admin' | 'profesional' = 'admin', email = USER.email, name = USER.name) {
  try {
    execFileSync('node', ['scripts/crear-usuario.mjs', name, email, role], { env: { ...process.env, DATABASE_URL: DB, USER_PASSWORD: USER.password }, stdio: 'pipe' })
  } catch (e) {
    if (!String((e as { stderr?: Buffer }).stderr).includes('Ya existe')) throw e
  }
}

export async function login(page: Page, email = USER.email) {
  await page.goto('/panel/login')
  await page.getByLabel('Correo').fill(email)
  await page.getByLabel('Contraseña').fill(USER.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/panel\/pacientes/)
}

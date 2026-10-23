import { expect, type Page } from '@playwright/test'

export const PANEL = 'http://localhost:3001'

/** Entra como Inés (usuario ficticio de la demo). */
export async function login(page: Page, user = 'ines') {
  await page.goto(PANEL + '/login')
  await page.getByLabel('Usuario').fill(user)
  await page.getByLabel('Contraseña').fill('demo123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/hoy/)
}

/** PNG de 1x1 píxel, suficiente para probar la subida. */
export const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')

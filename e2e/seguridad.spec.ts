import { test, expect } from '@playwright/test'
import { login, PANEL } from './helpers'

test('[REQ-SEG-003] cada profesional entra con su usuario y la historia queda a su nombre', async ({ page }) => {
  await login(page, 'valentina')
  await expect(page.getByText('Sesión: Valentina (Estética)')).toBeVisible()
  await page.getByRole('button', { name: 'Salir' }).click()
  await expect(page).toHaveURL(/\/login/)
  await page.goto(PANEL + '/pacientes')
  await expect(page).toHaveURL(/\/login/) // la sesión se cerró
})

test('[REQ-SEG-007] tras 5 intentos fallidos el usuario se bloquea', async ({ page }) => {
  await page.goto(PANEL + '/login')
  const enviar = async () => { await Promise.all([page.waitForResponse((r) => r.request().method() === 'POST'), page.getByRole('button', { name: 'Entrar' }).click()]); await page.waitForLoadState('networkidle') }
  for (let i = 0; i < 5; i++) {
    await page.getByLabel('Usuario').fill('intruso')
    await page.getByLabel('Contraseña').fill('mala' + i)
    await enviar()
    await expect(page.locator('p[role=alert]')).toContainText('no son correctos')
  }
  await page.getByLabel('Usuario').fill('intruso')
  await page.getByLabel('Contraseña').fill('otra')
  await enviar()
  await expect(page.locator('p[role=alert]')).toContainText('Demasiados intentos')
})

test('[REQ-SEG-005] el registro de accesos muestra quién abrió la ficha y cuándo', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/pacientes/p1')
  await page.goto(PANEL + '/auditoria')
  const fila = page.locator('tbody tr').filter({ hasText: 'Abrió la historia' }).first()
  await expect(fila).toContainText('Inés (Podología)')
  await expect(fila).toContainText('p1')
})

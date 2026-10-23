import { test, expect, request } from '@playwright/test'
import { login, PANEL, PNG } from './helpers'

test.describe.configure({ mode: 'serial' })

const subir = async (page: import('@playwright/test').Page, tipo: string) => {
  await page.getByLabel('Tipo').selectOption(tipo)
  await page.getByLabel('Foto', { exact: true }).setInputFiles({ name: 'pie.png', mimeType: 'image/png', buffer: PNG })
  await page.getByRole('button', { name: 'Subir foto' }).click()
}

test('[REQ-FOT-002] sin consentimiento de imagen no se sube la foto', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/pacientes/p8')
  await subir(page, 'primera_consulta')
  await expect(page.locator('p[role=alert]')).toContainText('Falta el consentimiento de imagen clínica')
  await expect(page.getByText('Todavía no hay fotos.')).toBeVisible()
})

test('[REQ-FOT-001] primera consulta y evolución se listan por fecha con su etiqueta', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/pacientes/p5')
  await subir(page, 'primera_consulta')
  await expect(page.getByRole('status')).toContainText('Foto guardada')
  await subir(page, 'evolucion')
  await expect(page.getByRole('status')).toContainText('Foto guardada')
  const items = page.locator('#fotos ul li').filter({ has: page.locator('img') })
  await expect(items).toHaveCount(2)
  await expect(items.nth(0)).toContainText('Primera consulta')
  await expect(items.nth(1)).toContainText('Evolución')
})

test('[REQ-FOT-003] la foto no se sirve sin sesión y no está en una carpeta pública', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/pacientes/p5')
  const src = await page.locator('#fotos img').first().getAttribute('src')
  expect(src).toMatch(/^\/fotos\//)
  expect((await page.request.get(PANEL + src!)).status()).toBe(200) // con sesión
  const anon = await request.newContext()
  const r = await anon.get(PANEL + src!, { maxRedirects: 0 })
  expect(r.status()).toBe(307)
  expect(r.headers()['location']).toContain('/login')
  const pub = await anon.get(PANEL + '/uploads/' + src!.split('/').pop(), { maxRedirects: 0 })
  expect(pub.status()).not.toBe(200)
})

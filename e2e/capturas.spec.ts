import { test, expect } from '@playwright/test'
import { ensureUser, login } from './helpers'

// Genera las capturas de screenshots/ (movil y escritorio). Solo corre con CAPTURAS=1: `CAPTURAS=1 npx playwright test capturas`.
test.skip(!process.env.CAPTURAS, 'solo bajo demanda')
test.describe.configure({ mode: 'serial' })
test.beforeAll(() => ensureUser())

for (const [nombre, size] of [['movil', { width: 390, height: 844 }], ['escritorio', { width: 1440, height: 900 }]] as const) {
  test(`capturas ${nombre}`, async ({ page }) => {
    await page.setViewportSize(size)
    await login(page)
    const shot = (n: string) => page.screenshot({ path: `screenshots/${nombre}-${n}.png` })
    await page.goto('/panel/pacientes/nuevo')
    await page.getByLabel('Nombre', { exact: true }).fill('María')
    await page.getByLabel('Apellido', { exact: true }).fill(`Ficticia ${nombre}`)
    await page.getByLabel('Teléfono').fill('351 555 0101')
    await page.getByRole('button', { name: 'Crear paciente' }).click()
    await expect(page).toHaveURL(/\/panel\/pacientes\/[0-9a-f-]{36}$/)
    const url = page.url()
    await page.goto('/panel/pacientes'); await shot('lista')
    await page.goto(url); await shot('ficha-casos')
    await page.goto(`${url}?tab=antecedentes`); await shot('ficha-antecedentes')
    await page.getByRole('button', { name: 'Editar antecedentes' }).click(); await shot('ficha-antecedentes-edicion')
    await page.goto(url)
    await page.getByText('Abrir un caso nuevo').click()
    await page.getByLabel(/Título del caso/).fill('Uñero pie derecho')
    await page.getByRole('button', { name: 'Abrir caso' }).click()
    await expect(page).toHaveURL(/\/casos\/[0-9a-f-]{36}$/)
    await page.getByRole('link', { name: 'Nueva evolución' }).click()
    await page.getByLabel('Motivo de la visita').fill('Control')
    await page.getByRole('button', { name: /^Pie derecho, Dedo 1/ }).scrollIntoViewIfNeeded()
    await shot('mapa')
    await page.getByRole('button', { name: /^Pie derecho, Dedo 1/ }).click()
    await page.waitForTimeout(400); await shot('mapa-hoja')
    await page.getByRole('button', { name: 'Guardar marca' }).click()
    await page.waitForTimeout(400); await shot('mapa-marcado')
  })
}

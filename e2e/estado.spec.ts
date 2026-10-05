import { expect, test } from '@playwright/test'

const PANEL = 'http://localhost:3000/panel'

// El estado de cada visitante viaja en cookies (en Vercel los pedidos caen en instancias distintas): debe sobrevivir a las recargas.
test('los cambios del panel se conservan al recargar y "Reiniciar demo" los borra', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('genesis-tour', 'off'))
  await page.goto(PANEL + '/login')
  const clave = page.getByLabel('Contraseña de la demo')
  await page.getByRole('button', { name: /Entrar como profesional de Podología/ }).waitFor()
  if (await clave.count()) await clave.fill('demo123')
  await page.getByRole('button', { name: /Entrar como profesional de Podología/ }).click()
  await expect(page).toHaveURL(/\/hoy/)

  const aConfirmar = page.locator('section[aria-label="Resumen"] div', { hasText: 'a confirmar' }).first()
  await expect(aConfirmar).toContainText('4')
  await page.getByRole('button', { name: 'Confirmar' }).first().click()
  await expect(page.getByText(/Turno: confirmado/)).toBeVisible()
  for (let i = 0; i < 3; i++) { await page.reload(); await expect(aConfirmar).toContainText('3') }

  await page.getByRole('button', { name: 'Reiniciar demo' }).click()
  await page.getByRole('button', { name: 'Sí, reiniciar' }).click()
  await expect(aConfirmar).toContainText('4')
})

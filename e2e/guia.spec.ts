import { expect, test } from '@playwright/test'

const WEB = 'http://localhost:3000'

test('demo guiada: empieza en el sitio, recorre las páginas y sigue en el panel con ?tour=1', async ({ page }) => {
  await page.goto(WEB + '/')
  const guia = page.getByRole('dialog', { name: 'Demo guiada' })
  await expect(guia).toBeVisible()
  await expect(guia.getByText('Bienvenida a la demo')).toBeVisible()

  await guia.getByRole('button', { name: /Siguiente/ }).click()
  await expect(page).toHaveURL(/\/servicios$/)
  await guia.getByRole('button', { name: /Siguiente/ }).click()
  await expect(page).toHaveURL(/\/nosotros$/)
  await guia.getByRole('button', { name: /Siguiente/ }).click()
  await expect(page).toHaveURL(/\/pedir-turno$/)
  await guia.getByRole('button', { name: /Siguiente/ }).click()

  const seguir = guia.getByRole('link', { name: /Seguir en el panel/ })
  await expect(seguir).toHaveAttribute('href', '/panel/login?tour=1')
  await seguir.click()

  // En el panel: entra con un perfil y la guía arranca desde el paso 1
  const clave = page.getByLabel('Contraseña de la demo') // los e2e corren con DEMO_PASSWORD; en la demo real no hay
  await page.getByRole('button', { name: /Entrar como profesional de Podología/ }).waitFor()
  if (await clave.count()) await clave.fill('demo123')
  await page.getByRole('button', { name: /Entrar como profesional de Podología/ }).click()
  await expect(page).toHaveURL(/\/hoy/)
  const tour = page.getByRole('dialog', { name: 'Guía de la demo' })
  await expect(tour.getByText('Tu día de un vistazo')).toBeVisible()
  await expect(page).not.toHaveURL(/tour=1/)
})

test('la guía se puede minimizar sin saltearla y vuelve al mismo paso', async ({ page }) => {
  await page.goto(WEB + '/')
  const guia = page.getByRole('dialog', { name: 'Demo guiada' })
  await guia.getByRole('button', { name: /Siguiente/ }).click()
  await expect(page).toHaveURL(/\/servicios$/)
  await guia.getByRole('button', { name: /Minimizar la guía/ }).click()
  await expect(guia).toBeHidden()
  const pill = page.getByRole('button', { name: 'Abrir la demo guiada' })
  await expect(pill).toContainText('paso 2 de 5')
  await page.goto(WEB + '/nosotros') // sigue minimizada al navegar
  await expect(pill).toBeVisible()
  await pill.click()
  await expect(guia.getByText('Servicios', { exact: true }).first()).toBeVisible() // vuelve al paso en el que estaba
})

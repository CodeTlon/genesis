import { test, expect } from '@playwright/test'
import { ensureUser, login } from './helpers'

test.describe.configure({ mode: 'serial' })
test.beforeAll(() => ensureUser())

const RUN = Date.now().toString(36)
let patientUrl = ''

async function newPatient(page: import('@playwright/test').Page, first: string, last: string) {
  await page.goto('/panel/pacientes/nuevo')
  await page.getByLabel('Nombre', { exact: true }).fill(first)
  await page.getByLabel('Apellido', { exact: true }).fill(last)
  await page.getByRole('button', { name: 'Crear paciente' }).click()
  await expect(page).toHaveURL(/\/panel\/pacientes\/[0-9a-f-]{36}$/)
  return page.url()
}

test('[REQ-PAC-006] la ficha muestra una pestaña por vez y la guarda en la URL', async ({ page }) => {
  await login(page)
  patientUrl = await newPatient(page, 'Pestañas', `Ux ${RUN}`)
  await expect(page.getByRole('tab', { name: /^Casos/ })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('tabpanel').getByText('Abrir un caso nuevo')).toBeVisible()
  await page.goto(`${patientUrl}?tab=antecedentes`)
  await expect(page.getByRole('tab', { name: 'Antecedentes' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('button', { name: 'Editar antecedentes' })).toBeVisible()
  await expect(page.getByText('Abrir un caso nuevo')).toHaveCount(0)
  // flechas del teclado cambian de pestaña y actualizan la URL
  await page.getByRole('tab', { name: 'Antecedentes' }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/tab=datos/)
  await expect(page.getByRole('button', { name: 'Editar datos' })).toBeVisible()
})

test('[REQ-PAC-007] la lista filtra mientras se escribe', async ({ page }) => {
  await login(page)
  await newPatient(page, 'Busqueda', `Alfa${RUN}`)
  await newPatient(page, 'Busqueda', `Beta${RUN}`)
  await page.goto('/panel/pacientes')
  await page.getByRole('searchbox').fill(`Alfa${RUN}`)
  await expect(page).toHaveURL(new RegExp(`q=Alfa${RUN}`))
  await expect(page.getByRole('link', { name: new RegExp(`Alfa${RUN}`) })).toBeVisible()
  await expect(page.getByRole('link', { name: new RegExp(`Beta${RUN}`) })).toHaveCount(0)
})

test('[REQ-EVO-006][REQ-EVO-007] mapa operable con teclado y firma de un toque con confirmación', async ({ page }) => {
  await login(page)
  await page.goto(patientUrl)
  await page.getByText('Abrir un caso nuevo').click()
  await page.getByLabel(/Título del caso/).fill('Control ux')
  await page.getByRole('button', { name: 'Abrir caso' }).click()
  await expect(page).toHaveURL(/\/casos\/[0-9a-f-]{36}$/)
  await page.getByRole('link', { name: 'Nueva evolución' }).click()
  await page.getByLabel('Motivo de la visita').fill('Control con teclado')

  const zona = page.getByRole('button', { name: /^Pie derecho, Dedo 2/ })
  await zona.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: /Pie derecho, Dedo 2/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(zona).toBeFocused() // el foco vuelve a la zona

  await page.getByRole('button', { name: 'Firmar', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '¿Firmar esta evolución?' })).toBeVisible()
  await page.getByRole('button', { name: 'Firmar y cerrar' }).click()
  await expect(page.getByRole('status')).toContainText('Evolución firmada')
})

test('[REQ-SEG-006] el login permite mostrar y ocultar la contraseña', async ({ page }) => {
  await page.goto('/panel/login')
  const clave = page.locator('#password')
  await clave.fill('algo-secreto')
  await expect(clave).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: 'Mostrar clave' }).click()
  await expect(clave).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Mostrar clave' }).click()
  await expect(clave).toHaveAttribute('type', 'password')
})

test('[REQ-PAC-008] tras el login se ve el inicio con el resumen y lo pendiente', async ({ page }) => {
  await login(page)
  await expect(page).toHaveURL(/\/panel\/inicio/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Buen/)
  await expect(page.getByRole('heading', { name: 'Para retomar' })).toBeVisible()
  await expect(page.getByRole('searchbox')).toBeVisible()
  await expect(page.getByRole('link', { name: /Pacientes$/ }).first()).toBeVisible()
})

test('[REQ-SEG-007] los errores de los formularios se ven dentro de la página y no en un globo del navegador', async ({ page }) => {
  await page.goto('/panel/login')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.locator('#email-error')).toHaveText('Completá este campo.')
  await expect(page.getByLabel('Correo')).toHaveAttribute('aria-invalid', 'true')
  await page.getByLabel('Correo').fill('mal')
  await page.getByLabel('Contraseña').fill('x')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.locator('#email-error')).toContainText('correo válido')
})

test('[REQ-SEG-007] salir de una evolución con cambios sin guardar pide confirmación con un modal propio', async ({ page }) => {
  await login(page)
  const url = await newPatient(page, 'Salida', `Ux ${RUN}`)
  await page.goto(url)
  await page.getByText('Abrir un caso nuevo').click()
  await page.getByLabel(/Título del caso/).fill('Control salida')
  await page.getByRole('button', { name: 'Abrir caso' }).click()
  await page.getByRole('link', { name: 'Nueva evolución' }).click()
  await page.getByLabel('Motivo de la visita').fill('Cambio sin guardar')
  await page.getByRole('link', { name: 'Inicio' }).first().click()
  await expect(page.getByRole('dialog', { name: 'Hay cambios sin guardar' })).toBeVisible()
  await page.getByRole('button', { name: 'Quedarme' }).click()
  await expect(page).toHaveURL(/atencion/)
})

import { test, expect } from '@playwright/test'
import { ensureUser, login, openSection } from './helpers'

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
  await expect(page.getByRole('button', { name: /Buscar paciente/ }).first()).toBeVisible()
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

test('[REQ-PAC-009] el alta muestra lo esencial, el resto se abre aparte y Cancelar vuelve a la lista', async ({ page }) => {
  await login(page)
  await page.goto('/panel/pacientes/nuevo')
  await expect(page.getByLabel('Teléfono')).toBeVisible()
  await expect(page.getByLabel('Domicilio')).toBeHidden()
  await page.getByText('Contacto y cobertura').click()
  await expect(page.getByLabel('Domicilio')).toBeVisible()
  await page.getByRole('link', { name: 'Cancelar' }).click()
  await expect(page).toHaveURL(/\/panel\/pacientes$/)
})

test('[REQ-INT-005] la búsqueda rápida se abre con la barra inclinada, encuentra pacientes y salta a la ficha', async ({ page }) => {
  await login(page)
  await newPatient(page, 'Rapida', `Paleta${RUN}`)
  await page.goto('/panel/inicio')
  await page.keyboard.press('/')
  const caja = page.getByRole('combobox', { name: /Buscar paciente o ir a una pantalla/ })
  await expect(caja).toBeFocused()
  await caja.fill(`Paleta${RUN}`)
  const opcion = page.getByRole('option', { name: new RegExp(`Paleta${RUN}`) }).first()
  await expect(opcion).toBeVisible()
  await caja.press('ArrowDown')
  await caja.press('ArrowUp')
  await caja.press('Enter')
  await expect(page).toHaveURL(/\/panel\/pacientes\/[0-9a-f-]{36}$/)
  // Escape cierra y devuelve el foco; sin sesión la ruta no responde
  await page.goto('/panel/inicio')
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog', { name: 'Búsqueda rápida' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const sinSesion = await page.context().browser()!.newContext({ baseURL: 'http://localhost:3000' })
  expect((await sinSesion.request.get('/api/clinico/buscar?q=ab')).status()).toBe(401)
  await sinSesion.close()
})

test('[REQ-INT-004] las alertas se muestran en una tarjeta ordenada por gravedad y se pliegan si son muchas', async ({ page }) => {
  await login(page)
  const url = await newPatient(page, 'Alertas', `Tarjeta${RUN}`)
  await page.goto(`${url}?tab=antecedentes`)
  await page.getByRole('button', { name: 'Editar antecedentes' }).click()
  for (const a of ['Diabetes', 'Anticoagulantes', 'Antiagregados', 'Marcapasos', 'Embarazo']) await page.getByLabel(new RegExp(`^${a}`)).check()
  await page.getByRole('button', { name: 'Guardar antecedentes' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Guardado' })).toBeVisible()
  await page.reload()
  const tarjeta = page.getByRole('region', { name: /Alertas clínicas/ })
  await expect(tarjeta).toContainText('(5)')
  const lista = tarjeta.getByRole('list', { name: /Alertas clínicas/ })
  await expect(lista.getByRole('listitem')).toHaveCount(3) // las 3 más graves
  await expect(lista.getByRole('listitem').first()).toContainText(/Anticoagulantes|Antiagregados|Marcapasos/)
  await tarjeta.getByRole('button', { name: /Ver todas \(5\)/ }).click()
  await expect(lista.getByRole('listitem')).toHaveCount(5)
  await tarjeta.getByRole('button', { name: 'Ver menos' }).click()
  await expect(lista.getByRole('listitem')).toHaveCount(3)
})

test('[REQ-INT-007] el comparador mueve la foto inicial sobre la final con el teclado', async ({ page }) => {
  const foto = { name: 'foto.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWM4URGFFTEMLQkAKKBmgU0/yJsAAAAASUVORK5CYII=', 'base64') }
  await login(page)
  const url = await newPatient(page, 'Compara', `Fotos${RUN}`)
  await page.goto(url)
  await page.getByText('Abrir un caso nuevo').click()
  await page.getByLabel(/Título del caso/).fill('Comparador')
  await page.getByRole('button', { name: 'Abrir caso' }).click()
  await expect(page).toHaveURL(/\/casos\/[0-9a-f-]{36}$/)
  for (const tipo of ['inicial', 'final']) {
    await openSection(page, 'Agregar una foto')
    await page.getByLabel(/^Foto \(JPG/).setInputFiles(foto)
    await page.getByLabel('Tipo').selectOption(tipo)
    await page.getByRole('button', { name: 'Subir foto' }).click()
    await expect(page.getByText('Foto guardada.')).toBeVisible()
  }
  const slider = page.getByRole('slider', { name: /Comparar la foto inicial con la final/ })
  await expect(slider).toHaveValue('50')
  await slider.focus()
  await page.keyboard.press('ArrowRight')
  await expect(slider).toHaveValue('51')
  await page.keyboard.press('End')
  await expect(slider).toHaveValue('100')
})

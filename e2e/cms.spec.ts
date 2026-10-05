import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import path from 'node:path'

const WEB = 'http://localhost:3000'
const PANEL = 'http://localhost:3000/panel'
const PHOTO = path.join(__dirname, '..', 'apps', 'web', 'public', 'img', 'img-10.webp')

test.describe.configure({ mode: 'serial' })

async function login(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('genesis-tour', 'off')) // sin la guía flotante encima
  await page.goto(PANEL + '/login')
  await page.getByLabel('Contraseña de la demo').fill('demo123')
  await page.getByRole('button', { name: /Entrar como profesional de Podología/ }).click()
  await expect(page).toHaveURL(/\/hoy/)
}

test('editar el título de Inicio desde el panel actualiza el sitio', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/sitio/inicio')
  const original = await page.getByLabel('Título principal').inputValue()
  await page.getByLabel('Título principal').fill('Título editado desde el panel')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByRole('status')).toContainText('Cambios guardados')

  await page.goto(WEB + '/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Título editado desde el panel')

  // restaurar
  await page.goto(PANEL + '/sitio/inicio')
  await page.getByLabel('Título principal').fill(original)
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByRole('status')).toContainText('Cambios guardados')
  await page.goto(WEB + '/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(original)
})

test('aviso superior (feriado): se activa y se desactiva', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/sitio/general')
  await page.getByLabel('Mostrar el aviso').check()
  await page.getByLabel('Texto del aviso').fill('Cerrado por feriado el lunes')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByRole('status')).toContainText('Cambios guardados')
  await page.goto(WEB + '/contacto')
  await expect(page.getByText('Cerrado por feriado el lunes')).toBeVisible()

  await page.goto(PANEL + '/sitio/general')
  await page.getByLabel('Mostrar el aviso').uncheck()
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByRole('status')).toContainText('Cambios guardados')
  await page.goto(WEB + '/contacto')
  await expect(page.getByText('Cerrado por feriado el lunes')).toHaveCount(0)
})

test('crear un grupo con un tratamiento, publicarlo, ocultarlo y borrarlo', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/sitio/servicios')
  await page.getByLabel('Nombre', { exact: true }).fill('Masajes de prueba')
  await page.getByRole('button', { name: 'Crear grupo' }).click()
  await expect(page.getByRole('status')).toContainText('Grupo creado')

  // oculto por defecto: el sitio no lo muestra
  await expect((await page.request.get(WEB + '/servicios/masajes-de-prueba')).status()).toBe(404)

  // agregar un tratamiento y publicar el grupo
  const add = page.locator('form', { hasText: 'Agregar un tratamiento' })
  await add.getByLabel('Nombre').fill('Masaje descontracturante')
  await add.getByLabel('Descripción').fill('Masaje para aliviar la tensión muscular.')
  await add.getByRole('button', { name: 'Agregar tratamiento' }).click()
  await expect(page.getByRole('status')).toContainText('Cambios guardados')
  await page.getByLabel('Visible en el sitio').first().check()
  await page.getByRole('button', { name: 'Guardar grupo' }).click()
  await expect(page.getByRole('status')).toContainText('Cambios guardados')

  await page.goto(WEB + '/servicios/masajes-de-prueba')
  await expect(page.getByRole('heading', { level: 2, name: /Masaje descontracturante/i })).toBeVisible()
  await page.goto(WEB + '/servicios')
  await expect(page.locator('main').getByRole('link', { name: /Masajes de prueba/ })).toBeVisible()

  // borrar el grupo
  await page.goto(PANEL + '/sitio/servicios')
  await page.getByRole('link', { name: 'Masajes de prueba' }).click()
  await page.getByRole('button', { name: /Eliminar grupo/ }).click()
  await expect(page.getByRole('status')).toContainText('Cambios guardados')
  await expect((await page.request.get(WEB + '/servicios/masajes-de-prueba')).status()).toBe(404)
})

test('galería: no se publica sin consentimiento; con consentimiento aparece en el sitio', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/sitio/galeria')
  const up = page.locator('form', { hasText: 'Subir una foto' })
  await up.locator('input[type=file]').setInputFiles(PHOTO)
  await up.getByLabel('Descripción de la foto').fill('Foto de prueba E2E')
  await up.getByLabel('Publicarla ahora').check() // sin confirmar consentimiento
  await up.getByRole('button', { name: 'Subir foto' }).click()
  await expect(page.getByRole('status')).toContainText('Cambios guardados')
  await page.goto(WEB + '/galeria')
  await expect(page.getByAltText('Foto de prueba E2E')).toHaveCount(0) // quedó oculta

  await page.goto(PANEL + '/sitio/galeria')
  const row = page.locator('li', { has: page.getByLabel('Descripción de la foto', { exact: true }) }).filter({ hasText: 'Eliminar foto' }).filter({ has: page.locator('input[value="Foto de prueba E2E"]') })
  await row.getByLabel(/Confirmo que no hay personas/).check()
  await row.getByLabel('Visible en la galería').check()
  await row.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Cambios guardados')
  await page.goto(WEB + '/galeria')
  const img = page.getByAltText('Foto de prueba E2E')
  await expect(img).toBeVisible()
  expect(await img.getAttribute('src')).toContain('media')

  // limpiar
  await page.goto(PANEL + '/sitio/galeria')
  await page.locator('li', { has: page.locator('input[value="Foto de prueba E2E"]') }).getByRole('button', { name: 'Eliminar foto' }).click()
  await expect(page.getByRole('status')).toContainText('Cambios guardados')
})

test('subida: una imagen demasiado pesada o un archivo que no es imagen se rechazan con un mensaje claro', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/sitio/galeria')
  const up = page.locator('form', { hasText: 'Subir una foto' })
  await up.locator('input[type=file]').setInputFiles({ name: 'grande.png', mimeType: 'image/png', buffer: Buffer.alloc(4.2 * 1024 * 1024, 1) })
  await up.getByLabel('Descripción de la foto').fill('No debería subir')
  await up.getByRole('button', { name: 'Subir foto' }).click()
  await expect(page.getByRole('alert').filter({ hasText: '4 MB' })).toBeVisible()

  await page.goto(PANEL + '/sitio/galeria')
  await up.locator('input[type=file]').setInputFiles({ name: 'falso.png', mimeType: 'image/png', buffer: Buffer.from('esto no es una imagen') })
  await up.getByLabel('Descripción de la foto').fill('No debería subir')
  await up.getByRole('button', { name: 'Subir foto' }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'No pudimos leer esa imagen' })).toBeVisible()
})

test('el pedido de turno del sitio llega a la bandeja de solicitudes del panel', async ({ page }) => {
  const nombre = `Paciente E2E ${Date.now()}`
  await page.goto(WEB + '/pedir-turno')
  await page.getByLabel('Nombre y apellido').fill(nombre)
  await page.getByRole('textbox', { name: 'Teléfono' }).fill('351 000-0099')
  await page.getByLabel('¿Qué te interesa?').selectOption('podologia')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Pedir turno' }).click()
  await expect(page.getByRole('status')).toContainText('Recibimos tu pedido')

  await login(page)
  await page.goto(PANEL + '/sitio/solicitudes')
  const card = page.locator('li', { hasText: nombre })
  await expect(card).toContainText('Podología')
  await expect(card).toContainText('Nueva')
  await card.getByRole('button', { name: 'Marcar como atendida' }).click()
  await expect(page.locator('li', { hasText: nombre })).toContainText('Atendida')
})

test('accesibilidad (axe) del editor del sitio', async ({ page }) => {
  await login(page)
  const groupsHref = await (async () => { await page.goto(PANEL + '/sitio/servicios'); return page.getByRole('link', { name: 'Editar' }).first().getAttribute('href') })()
  for (const p of ['/sitio', '/sitio/inicio', '/sitio/servicios', groupsHref!, '/sitio/nosotros', '/sitio/contacto', '/sitio/general', '/sitio/galeria', '/sitio/solicitudes']) {
    await page.goto(PANEL + p)
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const bad = r.violations.filter((x) => x.impact === 'critical' || x.impact === 'serious')
    expect(bad.map((b) => `${p}: ${b.id} ${b.nodes.slice(0, 2).map((n) => n.html.slice(0, 120)).join(' | ')}`), `axe en ${p}`).toEqual([])
  }
})

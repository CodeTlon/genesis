import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'
import { DB, ensureUser, login, openSection } from './helpers'

// Recorre todas las pantallas en celular, tableta y escritorio con mucho volumen y pacientes de distinto tipo.
test.describe.configure({ mode: 'serial' })
test.setTimeout(180_000)

const DISPOSITIVOS = [
  { nombre: 'celular', width: 390, height: 844, touch: true },
  { nombre: 'tableta', width: 768, height: 1024, touch: true },
  { nombre: 'escritorio', width: 1440, height: 900, touch: false },
] as const

test.beforeAll(() => {
  ensureUser()
  // Datos ficticios con distintos volúmenes y tipos de paciente (mismas funciones que usa la app; misma clave que el servidor de pruebas).
  execFileSync('npx', ['tsx', 'scripts/sembrar-prueba.ts'], {
    cwd: path.resolve(__dirname, '..'), stdio: 'pipe', timeout: 150_000,
    env: { ...process.env, DATABASE_URL: DB, SEMBRAR_DATOS_FICTICIOS: 'si', CANTIDAD: '120', CLINICAL_DATA_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'), NODE_ENV: 'test' },
  })
})

/** La pantalla no puede ser más ancha que la ventana (scroll horizontal) ni dejar errores en consola. */
async function revisar(page: Page, errores: string[], donde: string) {
  await page.waitForLoadState('networkidle')
  const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))
  expect(m.sw, `${donde}: scroll horizontal (${m.sw} > ${m.cw})`).toBeLessThanOrEqual(m.cw + 1)
  await expect(page.locator('main')).toBeVisible()
  expect(errores, `${donde}: errores de la página`).toEqual([])
}

for (const d of DISPOSITIVOS) {
  test(`[REQ-INT-001][REQ-INT-002][REQ-INT-003] todas las pantallas sin desbordes en ${d.nombre} (${d.width}px)`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: d.width, height: d.height }, hasTouch: d.touch, isMobile: d.touch })
    const page = await ctx.newPage()
    const errores: string[] = []
    page.on('pageerror', (e) => errores.push(String(e)))
    page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()) })
    await login(page)

    // Inicio: cada tarjeta lleva a una pantalla distinta
    await expect(page).toHaveURL(/\/panel\/inicio/)
    await revisar(page, errores, 'inicio')
    const resumen = page.getByRole('navigation', { name: 'Resumen' })
    const destinos: [RegExp, RegExp, string][] = [
      [/Ver lista/, /\/panel\/pacientes$/, "Pacientes"],
      [/Ver casos/, /\/panel\/casos$/, 'Casos abiertos'],
      [/Retomar/, /\/panel\/atenciones\?tab=sin-firmar/, 'Atenciones'],
      [/Ver firmadas/, /\/panel\/atenciones\?tab=firmadas/, 'Atenciones'],
    ]
    for (const [link, url, titulo] of destinos) {
      await page.goto('/panel/inicio')
      await resumen.getByRole('link', { name: link }).click()
      await expect(page).toHaveURL(url)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(titulo)
      await revisar(page, errores, `${titulo} desde inicio`)
    }

    // Lista de pacientes con mucho volumen: 25 y "Ver más"
    await page.goto('/panel/pacientes')
    expect(await page.locator('main ul.divide-y > li a').count()).toBe(25)
    await expect(page.getByRole('navigation', { name: 'Paginación' })).toContainText('Mostrando 1–25 de')
    await page.getByRole('link', { name: 'Siguiente' }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByRole('navigation', { name: 'Paginación' })).toContainText('Mostrando 26–50 de')
    expect(await page.locator('main ul.divide-y > li').count()).toBe(25)
    await revisar(page, errores, 'pacientes (página 2)')

    // Paciente de nombres larguísimos: ficha, pestañas y formularios con todo abierto
    await page.goto('/panel/pacientes?q=Vega Rodr')
    await page.getByRole('link', { name: /Fernández de la Vega/ }).first().click()
    await expect(page).toHaveURL(/\/panel\/pacientes\/[0-9a-f-]{36}$/)
    const ficha = page.url()
    await revisar(page, errores, 'ficha')
    for (const tab of ['antecedentes', 'datos']) {
      await page.goto(`${ficha}?tab=${tab}`)
      await revisar(page, errores, `ficha ${tab}`)
      await page.getByRole('button', { name: tab === 'datos' ? 'Editar datos' : 'Editar antecedentes' }).click()
      for (const s of tab === 'datos' ? ['Contacto y cobertura', 'Salud y hábitos'] : ['Otros antecedentes', 'Datos de diabetes', 'Más datos']) await openSection(page, s)
      await revisar(page, errores, `ficha ${tab} (edición)`)
    }

    // Caso con 40 evoluciones largas, y su evolución nueva con el mapa
    await page.goto(ficha)
    await page.getByRole('link', { name: /Abierto/ }).first().click()
    await expect(page).toHaveURL(/\/casos\/[0-9a-f-]{36}$/)
    await expect(page.getByRole('navigation', { name: 'Paginación' })).toContainText('Mostrando 1–10 de 40 evoluciones')
    await page.getByRole('link', { name: 'Ir a la página 4' }).click()
    await expect(page.getByRole('navigation', { name: 'Paginación' })).toContainText('Mostrando 31–40 de 40 evoluciones')
    await revisar(page, errores, 'caso con muchas evoluciones (última página)')
    await page.goBack()
    const caso = page.url().split('?')[0]
    await page.goto(`${caso}/atencion`)
    await page.getByRole('button', { name: /^Pie derecho, Dedo 1/ }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await revisar(page, errores, 'evolución con hoja del mapa')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Ver más campos (examen completo)' }).click()
    await revisar(page, errores, 'evolución con examen completo')

    // Historia imprimible del paciente más cargado
    await page.goto(`${ficha}/historia`)
    await revisar(page, errores, 'historia')

    // Listados globales y alta
    await page.goto('/panel/casos')
    await revisar(page, errores, 'casos')
    await page.goto('/panel/atenciones')
    await revisar(page, errores, 'atenciones')
    await page.goto('/panel/pacientes/nuevo')
    for (const s of ['Contacto y cobertura', 'Salud y hábitos']) await openSection(page, s)
    await revisar(page, errores, 'alta de paciente')
    await ctx.close()
  })
}

test('[REQ-INT-002] los pacientes con poca o mucha información se ven completos', async ({ page }) => {
  await login(page)
  // Un paciente sin ficha (solo nombre) y uno con todos los antecedentes: ambos abren sin errores
  await page.goto('/panel/pacientes?q=a')
  const links = page.locator('main ul.divide-y > li a')
  await expect(links.nth(10)).toBeVisible() // la lista llega por streaming: esperar a que aparezca
  await links.nth(3).click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.goto('/panel/atenciones?tab=sin-firmar')
  await expect(page.getByRole('tab', { name: /Sin firmar/ })).toHaveAttribute('aria-selected', 'true')
  await page.goto('/panel/casos')
  await expect(page.locator('main ul.divide-y > li').nth(5)).toBeVisible()
})

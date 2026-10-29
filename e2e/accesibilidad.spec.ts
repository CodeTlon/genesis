import AxeBuilder from '@axe-core/playwright'
import { test, expect, type Page } from '@playwright/test'
import { ensureUser, login } from './helpers'

// Revisión automática de accesibilidad (WCAG 2.1 A y AA) en las pantallas principales, en celular y escritorio.
// Solo falla con problemas serios o críticos; lo que axe no puede decidir sin una persona (contraste sobre imágenes, etc.) no se cuenta.
test.describe.configure({ mode: 'serial' })
test.setTimeout(240_000)
test.beforeAll(() => ensureUser())

async function revisar(page: Page, donde: string) {
  await page.waitForLoadState('networkidle')
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
  expect(graves.map((v) => `${donde}: ${v.id} (${v.impact}) — ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`), `${donde}: problemas de accesibilidad`).toEqual([])
}

for (const d of [{ nombre: 'celular', width: 390, height: 844, touch: true }, { nombre: 'escritorio', width: 1440, height: 900, touch: false }]) {
  test(`[REQ-INT-008] sin problemas graves de accesibilidad en ${d.nombre}`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: d.width, height: d.height }, hasTouch: d.touch, isMobile: d.touch })
    const page = await ctx.newPage()
    await page.goto('/panel/login')
    await revisar(page, 'login')
    await login(page)
    await revisar(page, 'inicio')
    for (const url of ['/panel/pacientes', '/panel/casos', '/panel/atenciones', '/panel/pacientes/nuevo']) { await page.goto(url); await revisar(page, url) }
    // Un paciente propio: la prueba no depende de datos previos (en CI la base arranca vacía)
    await page.goto('/panel/pacientes/nuevo')
    await page.getByLabel('Nombre', { exact: true }).fill('Accesible')
    await page.getByLabel('Apellido', { exact: true }).fill(`Prueba ${d.nombre} ${Date.now().toString(36)}`)
    await page.getByRole('button', { name: 'Crear paciente' }).click()
    await expect(page).toHaveURL(/\/panel\/pacientes\/[0-9a-f-]{36}$/)
    const ficha = page.url()
    await revisar(page, 'ficha')
    for (const tab of ['antecedentes', 'datos']) { await page.goto(`${ficha}?tab=${tab}`); await revisar(page, `ficha ${tab}`) }
    await page.goto(ficha)
    await page.getByText('Abrir un caso nuevo').click()
    await page.getByLabel(/Título del caso/).fill(`Accesibilidad ${d.nombre}`)
    await page.getByRole('button', { name: 'Abrir caso' }).click()
    await expect(page).toHaveURL(/\/casos\/[0-9a-f-]{36}$/)
    await revisar(page, 'caso')
    await page.getByRole('link', { name: 'Nueva evolución' }).click()
    await revisar(page, 'evolución')
    await page.keyboard.press('/')
    await expect(page.getByRole('dialog', { name: 'Búsqueda rápida' })).toBeVisible()
    await revisar(page, 'búsqueda rápida')
    await ctx.close()
  })
}

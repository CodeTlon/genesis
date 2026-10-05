import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const WEB = 'http://localhost:3000'

test.beforeEach(async ({ page }) => { await page.addInitScript(() => sessionStorage.setItem('genesis-site-tour', 'off')) }) // sin la guía flotante encima
const VIEWPORTS = [{ w: 375, h: 800 }, { w: 768, h: 1000 }, { w: 1280, h: 800 }]
const PAGES = ['/', '/servicios', '/servicios/podologia', '/servicios/corporal', '/nosotros', '/galeria', '/contacto', '/pedir-turno', '/privacidad']

for (const v of VIEWPORTS) {
  test(`sitio público ${v.w}px: sin scroll horizontal, sin WhatsApp, con un h1`, async ({ page }) => {
    await page.setViewportSize({ width: v.w, height: v.h })
    for (const p of PAGES) {
      await page.goto(WEB + p)
      await expect(page.locator('h1')).toHaveCount(1)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
      expect(overflow, `scroll horizontal en ${p}`).toBe(false)
      expect((await page.content()).toLowerCase()).not.toContain('whatsapp')
    }
  })
}

test('servicios agrupados: 5 grupos y cada grupo lista sus tratamientos', async ({ page }) => {
  await page.goto(WEB + '/servicios')
  await expect(page.getByRole('link', { name: /\d+ servicios?/ })).toHaveCount(5)
  await page.goto(WEB + '/servicios/podologia')
  await expect(page.getByRole('heading', { level: 2, name: /Heloma/i })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: /Onicolisis/i })).toBeVisible()
})

test('pedir turno: valida y confirma', async ({ page }) => {
  await page.goto(WEB + '/pedir-turno')
  await page.getByRole('button', { name: 'Pedir turno' }).click()
  await expect(page.getByText('Escribí tu nombre.')).toBeVisible()
  await page.getByLabel('Nombre y apellido').fill('Paciente de Prueba')
  await page.getByRole('textbox', { name: 'Teléfono' }).fill('351 000-0000')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Pedir turno' }).click()
  await expect(page.getByRole('status')).toContainText('Recibimos tu pedido')
})

test('demo no indexable y sin trackers', async ({ page, request }) => {
  expect(await (await request.get(WEB + '/robots.txt')).text()).toContain('Disallow: /')
  const reqs: string[] = []
  page.on('request', (r) => { if (!r.url().startsWith(WEB)) reqs.push(r.url()) })
  await page.goto(WEB + '/')
  await page.waitForLoadState('networkidle')
  expect(reqs, 'sin pedidos a terceros').toEqual([])
})

test('accesibilidad (axe): sin errores críticos ni serios', async ({ page }) => {
  for (const p of PAGES) {
    await page.goto(WEB + p)
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const bad = r.violations.filter((x) => x.impact === 'critical' || x.impact === 'serious')
    expect(bad.map((b) => `${p}: ${b.id}`), `axe en ${p}`).toEqual([])
  }
})

test('galería: el visor amplía la foto y se navega con flechas', async ({ page }) => {
  await page.goto(WEB + '/galeria')
  await page.getByRole('button', { name: /^Ampliar:/ }).first().click()
  const visor = page.getByRole('dialog', { name: 'Foto ampliada' })
  await expect(visor).toBeVisible()
  await expect(visor.getByText(/^1 de \d+$/)).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(visor.getByText(/^2 de \d+$/)).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(visor).toBeHidden()
})

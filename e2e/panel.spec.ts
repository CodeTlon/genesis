import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PANEL = 'http://localhost:3001'

async function login(page: Page) {
  await page.goto(PANEL + '/login')
  await page.getByLabel('Contraseña de la demo').fill('demo123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/hoy/)
}

test('acceso protegido: sin sesión redirige y la clave incorrecta avisa', async ({ page }) => {
  await page.goto(PANEL + '/pacientes')
  await expect(page).toHaveURL(/\/login/)
  await page.getByLabel('Contraseña de la demo').fill('mala')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.locator('p[role=alert]')).toContainText('no es correcta')
})

test('Hoy: turnos, cumpleaños y alertas visibles con texto', async ({ page }) => {
  await login(page)
  await expect(page.getByText('turnos hoy')).toBeVisible()
  await expect(page.getByText('Hoy cumple años')).toBeVisible()
  await expect(page.getByText('Anticoagulantes').first()).toBeVisible()
})

test('búsqueda tolera tildes y errores de tipeo', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/pacientes')
  await page.getByLabel(/Buscar/).fill('sanchez')
  await expect(page.getByRole('link', { name: /Roberto Sánchez/ })).toBeVisible()
  await page.getByLabel(/Buscar/).fill('ledesna')
  await expect(page.getByRole('link', { name: /Norma Ledesma/ })).toBeVisible()
  await page.getByLabel(/Buscar/).fill('zzzz')
  await expect(page.getByText('No encontramos pacientes')).toBeVisible()
})

test('atención de seguimiento: chart by exception, mapa de pies, firma, próximo turno y adenda', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/pacientes/p2/atencion?plantilla=B')
  await expect(page.getByText('Cargamos los valores de la última visita')).toBeVisible()

  // mapa de pies: marcar el talón derecho (planta) con hallazgo y gravedad
  await page.getByRole('button', { name: /Pie derecho, Talón/ }).click()
  await page.getByLabel('Hallazgo').selectOption('Fisura')
  await page.getByLabel('Intensa').check()
  await page.getByRole('button', { name: 'Guardar marca' }).click()
  await expect(page.getByText('Der. · Talón: Fisura (Intensa)')).toBeVisible()

  await page.getByLabel('Procedimiento realizado').fill('Control y tratamiento de fisura (prueba E2E).')
  await expect(page.getByText(/Borrador guardado a las/)).toBeVisible({ timeout: 8000 })

  // firmar manteniendo apretado
  const hold = page.getByRole('button', { name: /Mantené apretado/ })
  const box = (await hold.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(1200)
  await page.mouse.up()
  await expect(page.getByText('Atención firmada y guardada')).toBeVisible()

  await page.getByRole('button', { name: 'Agendar próximo turno' }).click()
  await expect(page.getByText(/Listo: turno pendiente el/)).toBeVisible()

  // la entrada firmada no se edita: se corrige con adenda
  await page.goto(PANEL + '/pacientes/p2')
  await expect(page.getByText('Entrada firmada: no se puede editar').first()).toBeVisible()
  await page.getByRole('button', { name: 'Agregar adenda' }).first().click()
  await page.getByLabel('Motivo de la corrección').fill('Dato corregido')
  await page.getByLabel('Texto').fill('Se aclara la zona de la fisura.')
  await page.getByRole('button', { name: 'Guardar adenda' }).click()
  await expect(page.getByText('Motivo: Dato corregido')).toBeVisible()
})

test('agenda: no permite doble reserva', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/agenda')
  await page.getByText('Mover un turno escribiendo la hora').click()
  // Turno de Roberto (10:00, Inés) → 09:00, cuando Norma ya tiene turno con Inés
  const row = page.locator('li', { hasText: 'Roberto Sánchez' }).filter({ has: page.getByLabel('Hora') })
  await row.getByLabel('Hora').fill('09:00')
  await row.getByRole('button', { name: 'Mover' }).click()
  await expect(page.locator('p[role=alert]')).toContainText('ya está ocupado')
})

test('WhatsApp simulado: audio y consulta clínica derivan a una persona', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/whatsapp')
  await page.getByRole('button', { name: /Mandar un audio/ }).click()
  await expect(page.getByText('Inés te contesta en breve.').first()).toBeVisible()
  await page.getByRole('button', { name: 'Consulta clínica' }).click()
  await expect(page.getByText('Mensaje que el bot no entendió')).toBeVisible()
  await expect(page.getByText('Gasto estimado de mensajería')).toBeVisible()
})

test('accesibilidad (axe) del panel: sin errores críticos ni serios', async ({ page }) => {
  await login(page)
  for (const p of ['/hoy', '/agenda', '/pacientes', '/pacientes/p2', '/pacientes/p2/atencion?plantilla=B', '/whatsapp', '/plantillas', '/ayuda']) {
    await page.goto(PANEL + p)
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    const bad = r.violations.filter((x) => x.impact === 'critical' || x.impact === 'serious')
    expect(bad.map((b) => `${p}: ${b.id} ${b.nodes.slice(0, 3).map((n) => n.html.slice(0, 160) + ' => ' + n.any[0]?.message).join(' || ')}`), `axe en ${p}`).toEqual([])
  }
})

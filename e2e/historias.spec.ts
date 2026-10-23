import { test, expect, type Page } from '@playwright/test'
import pg from 'pg'
import { login, PANEL } from './helpers'

const DB = process.env.DATABASE_URL ?? 'postgres://genesis:genesis@localhost:5432/genesis'
const sufijo = Date.now().toString(36)

test.describe.configure({ mode: 'serial' })


async function firmar(page: Page) {
  const hold = page.getByRole('button', { name: /Mantené apretado/ })
  const box = (await hold.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(1200)
  await page.mouse.up()
  await expect(page.getByText('Atención firmada y guardada')).toBeVisible()
}

let pacienteUrl = ''

test('[REQ-PAC-005] el panel guarda y muestra los datos de la ficha de un paciente nuevo', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/pacientes/nuevo')
  await page.getByLabel('Apellido *', { exact: true }).fill(`Prueba${sufijo}`)
  await page.getByLabel('Nombre *', { exact: true }).fill('Ficha')
  await page.getByLabel('Nacionalidad').fill('Argentina')
  await page.getByLabel('Estatura (cm)').fill('165')
  await page.getByLabel('Peso (kg)').fill('67')
  await page.getByLabel('Grupo sanguíneo').fill('0+')
  await page.getByLabel('Actividad laboral').fill('Docente')
  await page.getByLabel('Otras actividades').fill('Natación')
  await page.getByRole('group', { name: /Contacto de emergencia/ }).getByLabel('Nombre').fill('Contacto Ficticio')
  await page.getByRole('button', { name: 'Crear paciente' }).click()
  await expect(page).toHaveURL(/\/pacientes\/p[a-z0-9]+$/)
  pacienteUrl = page.url()
  for (const t of ['Argentina', 'Docente', 'Natación', 'Contacto Ficticio', '165 cm · 67 kg']) await expect(page.getByText(t).first()).toBeVisible()
})

test('[REQ-PAC-004] un menor de 18 no se guarda sin responsable legal', async ({ page }) => {
  await login(page)
  await page.goto(PANEL + '/pacientes/nuevo')
  await page.getByLabel('Apellido *', { exact: true }).fill(`Menor${sufijo}`)
  await page.getByLabel('Nombre *', { exact: true }).fill('Test')
  await page.getByLabel('Fecha de nacimiento').fill(`${new Date().getFullYear() - 10}-05-05`)
  await page.getByRole('button', { name: 'Crear paciente' }).click()
  await expect(page.locator('p[role=alert]')).toContainText('responsable legal')
})

test('[REQ-HC-007][REQ-HC-008][REQ-HC-009][REQ-HC-010][REQ-HC-011][REQ-HC-006][REQ-MAP-003] ficha inicial: antecedentes, forma de pie, conclusión, alerta y firma', async ({ page }) => {
  await login(page)
  await page.goto(pacienteUrl + '/atencion?plantilla=F')
  await expect(page.getByRole('heading', { name: 'Ficha podológica inicial' })).toBeVisible()
  // REQ-HC-007: los 18 antecedentes de la ficha con Sí/No
  for (const a of ['Alérgicos', 'Anticoagulantes', 'Antiagregados', 'Artritis', 'Artrosis', 'Cardiovascular', 'Presión arterial', 'Problemas vasculares', 'Marcapasos', 'Dermatológicos',
    'Problema respiratorio', 'Traumatológicos', 'Reumatológicos', 'Neurológicos', 'Enfermedades infecto-contagiosas', 'Cirugías', 'Colesterol', 'Triglicéridos']) {
    await expect(page.getByRole('group', { name: a, exact: true })).toBeVisible()
  }
  await page.getByRole('group', { name: 'Anticoagulantes', exact: true }).getByLabel('Sí').check()
  // REQ-HC-009: examen por pie
  await page.getByLabel('Temperatura (pie derecho)').selectOption('Frío')
  await page.getByLabel('Pulso pedio (pie izquierdo)').selectOption('Presente')
  // REQ-HC-010: patologías por dedo
  await page.getByLabel('Helomas, Pie derecho, dedo 2').fill('Heloma dorsal')
  // REQ-MAP-003: forma de pie
  await page.getByRole('group', { name: /Fórmula digital/ }).getByLabel('Pie izquierdo').selectOption('griego')
  await page.getByRole('group', { name: /Fórmula digital/ }).getByLabel('Pie derecho').selectOption('egipcio')
  // REQ-HC-006 / REQ-HC-011
  await page.getByLabel('Tratamiento preventivo').fill('Higiene diaria.')
  await page.getByLabel('Conclusión').fill('Pie de atleta en tratamiento.')
  await page.getByLabel('Sugerencias al paciente').fill('Secar bien entre los dedos.')
  await page.getByLabel('Control (próxima visita)').fill('En 1 semana')
  await expect(page.getByText(/Borrador guardado a las/)).toBeVisible({ timeout: 8000 })
  await firmar(page)

  await page.goto(pacienteUrl)
  await expect(page.getByText('Anticoagulantes').first()).toBeVisible() // REQ-HC-008: la ficha levantó la alerta
  await expect(page.getByText('Izq.: griego · Der.: egipcio')).toBeVisible()
  await expect(page.getByText('Pie de atleta en tratamiento.')).toBeVisible()
  await expect(page.getByText('Der.: 2° Heloma dorsal')).toBeVisible()
  await expect(page.getByText('En 1 semana')).toBeVisible()
})

test('[REQ-HC-012] la atención firmada está guardada en Postgres y la base impide editarla', async () => {
  const id = pacienteUrl.split('/').pop()!
  const c = new pg.Client({ connectionString: DB })
  await c.connect()
  try {
    const { rows } = await c.query(`SELECT id, status, payload::text AS raw FROM hc_entries WHERE patient_id=$1`, [id])
    expect(rows).toHaveLength(1)
    expect(rows[0].status).toBe('signed')
    expect(rows[0].raw).toContain('enc:v1:') // REQ-SEG-004: en la base el contenido va cifrado
    expect(rows[0].raw).not.toContain('atleta')
    await expect(c.query(`UPDATE hc_entries SET payload='{}' WHERE id=$1`, [rows[0].id])).rejects.toThrow(/adenda/)
  } finally {
    await c.end()
  }
})

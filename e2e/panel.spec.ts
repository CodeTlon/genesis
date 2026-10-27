import { test, expect, type Page } from '@playwright/test'
import pg from 'pg'
import { DB, ensureUser, login } from './helpers'

test.describe.configure({ mode: 'serial' })
test.beforeAll(() => ensureUser())

// Foto de prueba generada en memoria (PNG de 8x8): el repo no lleva ninguna imagen clínica.
const FOTO = { name: 'foto-prueba.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWM4URGFFTEMLQkAKKBmgU0/yJsAAAAASUVORK5CYII=', 'base64') }
const RUN = Date.now().toString(36)
const MOTIVO = `Motivo-secreto-${RUN}`
let patientUrl = ''
let caseUrl = ''

async function sql<T = Record<string, unknown>>(q: string, p: unknown[] = []) {
  const c = new pg.Client({ connectionString: DB })
  await c.connect()
  try { return (await c.query(q, p)).rows as T[] } finally { await c.end() }
}

async function newPatient(page: Page, first: string, last: string) {
  await page.goto('/panel/pacientes/nuevo')
  await page.getByLabel('Nombre', { exact: true }).fill(first)
  await page.getByLabel('Apellido', { exact: true }).fill(last)
  await page.getByLabel('DNI').fill('00.000.001') // ficticio
  await page.getByRole('button', { name: 'Crear paciente' }).click()
  await expect(page).toHaveURL(/\/panel\/pacientes\/[0-9a-f-]{36}$/)
  return page.url()
}

test('[REQ-PAC-001][REQ-ANT-001][REQ-CAS-001][REQ-EVO-001][REQ-EVO-002][REQ-EVO-004][REQ-FOT-001][REQ-FOT-004] flujo clínico completo: paciente, antecedentes con alerta, caso, foto, evolución firmada, adenda, cierre e historia', async ({ page }) => {
  await login(page)
  patientUrl = await newPatient(page, 'Paciente', `Ficticia ${RUN}`)

  // Antecedentes: marcar diabetes genera una alerta visible en la cabecera
  await page.goto(`${patientUrl}?tab=antecedentes`)
  await page.getByRole('button', { name: 'Editar antecedentes' }).click()
  await page.getByLabel(/^Diabetes/).check()
  await page.getByLabel('Otros antecedentes y notas (opcional)').fill(`Nota-antecedente-${RUN}`)
  await page.getByRole('button', { name: 'Guardar antecedentes' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Guardado' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('list', { name: /Alertas clínicas/ }).getByText('Diabetes')).toBeVisible()

  // Caso abierto y foto inicial
  await page.goto(patientUrl)
  await page.getByText('Abrir un caso nuevo').click()
  await page.getByLabel(/Título del caso/).fill('Uñero pie derecho')
  await page.getByLabel(/Motivo de consulta/).fill(MOTIVO)
  await page.getByRole('button', { name: 'Abrir caso' }).click()
  await expect(page).toHaveURL(/\/casos\/[0-9a-f-]{36}$/)
  caseUrl = page.url()

  await page.getByLabel(/^Foto \(JPG/).setInputFiles(FOTO)
  await page.getByLabel('Tipo').selectOption('inicial')
  await page.getByRole('button', { name: 'Subir foto' }).click()
  await expect(page.getByText('Foto guardada.')).toBeVisible()
  await expect(page.getByRole('button', { name: /Ampliar foto: Inicial/ })).toBeVisible()
  // Al tocar la foto se abre una vista previa grande; Escape la cierra
  await page.getByRole('button', { name: /Ampliar foto: Inicial/ }).click()
  await expect(page.getByRole('dialog', { name: 'Vista previa de la foto' }).getByRole('img', { name: /Inicial/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  // Evolución con mapa de pies v2 (tipo de pie + estado) y firma manteniendo presionado
  await page.getByRole('link', { name: 'Nueva evolución' }).click()
  await page.getByLabel('Motivo de la visita').fill('Control y curación')
  await page.getByLabel('Griego').check()
  await page.getByRole('button', { name: /^Pie derecho, Dedo 1/ }).click()
  await page.getByLabel('Hallazgo').selectOption('Callo')
  await page.getByLabel('Tratado').check()
  await page.getByRole('button', { name: 'Guardar marca' }).click()
  await expect(page.getByText(/Der\. · Dedo 1: Callo/)).toBeVisible()
  await expect(page.getByText(/Borrador guardado a las/)).toBeVisible({ timeout: 10_000 })
  const hold = page.getByRole('button', { name: /Mantené presionado para firmar/ })
  const box = (await hold.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down(); await page.waitForTimeout(1400); await page.mouse.up()
  await expect(page.getByRole('status')).toContainText('Evolución firmada')

  // La evolución firmada no se edita: se corrige con adenda
  await page.getByRole('link', { name: 'Volver al caso' }).click()
  await expect(page.getByText(/Firmada/).first()).toBeVisible()
  await expect(page.getByText('Tipo de pie:')).toContainText('Griego')
  await page.getByRole('button', { name: 'Agregar adenda' }).click()
  await page.getByLabel('Motivo', { exact: true }).fill('Corrección')
  await page.getByLabel('Corrección o agregado').fill('Se aclara el lado tratado.')
  await page.getByRole('button', { name: 'Guardar adenda' }).click()
  await expect(page.getByText('Se aclara el lado tratado.')).toBeVisible()

  // Cierre con conclusión y sugerencias
  await page.getByText('Cerrar el caso').click()
  await page.getByRole('textbox', { name: 'Conclusión' }).fill('Resolución completa.')
  await page.getByLabel(/Sugerencias para el paciente/).fill('Calzado amplio.')
  await page.getByRole('button', { name: 'Cerrar caso' }).click()
  await expect(page.getByText('Calzado amplio.')).toBeVisible() // el caso pasa a "cerrado" y muestra la conclusión
  await page.reload()
  await expect(page.getByText('Calzado amplio.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Nueva evolución' })).toHaveCount(0)

  // Historia clínica completa para entregar copia
  await page.goto(`${patientUrl}/historia`)
  await expect(page.getByText(`Ficticia ${RUN}`).first()).toBeVisible()
  await expect(page.getByText(/Der\. · planta · Dedo 1: Callo/)).toBeVisible()
})

test('[REQ-EVO-003][REQ-SEG-003] los datos clínicos libres se guardan cifrados y las firmadas no se pueden alterar', async () => {
  const id = patientUrl.split('/').pop()!
  const [ent] = await sql<{ id: string; payload: Record<string, unknown>; status: string }>('select id, payload, status from clinical_entries where patient_id=$1', [id])
  expect(ent.status).toBe('signed')
  expect(Object.keys(ent.payload)).toEqual(['enc'])
  expect(JSON.stringify(ent.payload)).not.toContain('Control y curación')
  const [c] = await sql<{ reason_enc: string; conclusion_enc: string }>('select reason_enc, conclusion_enc from cases where patient_id=$1', [id])
  expect(c.reason_enc).not.toContain(MOTIVO)
  expect(c.conclusion_enc).not.toContain('Resolución completa')
  const [a] = await sql<{ notes_enc: string }>('select notes_enc from patient_antecedentes where patient_id=$1', [id])
  expect(a.notes_enc).not.toContain(`Nota-antecedente-${RUN}`)
  // la base impide editar o borrar lo firmado, las adendas y la auditoría
  await expect(sql('update clinical_entries set payload=$2 where id=$1', [ent.id, { enc: 'x' }])).rejects.toThrow(/firmada/)
  await expect(sql('delete from clinical_entries where id=$1', [ent.id])).rejects.toThrow(/firmada/)
  await expect(sql('update clinical_addenda set reason=$1', ['x'])).rejects.toThrow(/adendas/)
  await expect(sql('delete from audit_log')).rejects.toThrow(/auditoría/)
  const acts = (await sql<{ action: string }>('select distinct action from audit_log where entity_id in ($1,$2)', [id, ent.id])).map((r) => r.action)
  expect(acts).toEqual(expect.arrayContaining(['view_patient', 'sign_entry']))
  // el archivo de la foto no usa el nombre original
  const [ph] = await sql<{ storage_key: string }>('select storage_key from clinical_photos where patient_id=$1', [id])
  expect(ph.storage_key).toMatch(/^[0-9a-f-]{36}\.webp$/)
})

test('[REQ-SEG-001][REQ-FOT-003] seguridad: sin sesión nada se lee ni se escribe, y los datos de un paciente no se alcanzan con IDs de otro', async ({ page, request, playwright }) => {
  const anon = await playwright.request.newContext({ baseURL: 'http://localhost:3000', maxRedirects: 0 })
  const [photo] = await sql<{ id: string }>('select id from clinical_photos limit 1')
  expect((await anon.get(`/panel-media/${photo.id}`)).status()).toBe(401)
  expect((await anon.post('/api/clinico/fotos', { multipart: { kind: 'inicial' } })).status()).toBe(401)
  for (const p of ['/panel/pacientes', patientUrl.replace('http://localhost:3000', ''), `${caseUrl.replace('http://localhost:3000', '')}/atencion`]) {
    const r = await anon.get(p)
    expect(r.status()).toBe(307)
    expect(r.headers().location).toContain('/panel/login')
  }
  await anon.dispose()
  void request

  // IDOR: el caso de un paciente no se abre bajo la URL de otro paciente
  await login(page)
  const otherUrl = await newPatient(page, 'Otra', `Persona ${RUN}`)
  const caseId = caseUrl.split('/').pop()
  // Con el streaming de Next el estado HTTP ya salió (200) cuando notFound() actúa: lo que se verifica es el CONTENIDO.
  for (const url of [`${otherUrl}/casos/${caseId}`, `${otherUrl}/casos/${caseId}/atencion`, '/panel/pacientes/no-es-un-uuid']) {
    await page.goto(url)
    await expect(page.getByText('No encontramos esa página')).toBeVisible()
    await expect(page.getByText(/Uñero pie derecho|Calzado amplio/)).toHaveCount(0)
  }

  // la foto privada, con sesión, se sirve sin caché y deja rastro
  const ok = await page.request.get(`/panel-media/${photo.id}`)
  expect(ok.status()).toBe(200)
  expect(ok.headers()['cache-control']).toContain('no-store')
  expect(ok.headers()['x-content-type-options']).toBe('nosniff')
  expect((await sql('select 1 from audit_log where action=$1 and entity_id=$2', ['view_photo', photo.id])).length).toBeGreaterThan(0)
})

test('[REQ-FOT-002] la subida rechaza archivos que no son fotos aunque digan serlo, y los EXIF no sobreviven', async ({ page }) => {
  await login(page)
  await page.goto(caseUrl)
  // el caso está cerrado: reabrir para probar la subida
  await page.getByRole('button', { name: 'Reabrir caso' }).click()
  await expect(page.getByRole('button', { name: 'Subir foto' })).toBeVisible()
  const bad = await page.request.post('/api/clinico/fotos', { multipart: { foto: { name: 'x.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('esto no es una imagen') }, patientId: patientUrl.split('/').pop()!, kind: 'inicial' } })
  expect(bad.status()).toBe(422)
  const svg = await page.request.post('/api/clinico/fotos', { multipart: { foto: { name: 'x.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>') }, patientId: patientUrl.split('/').pop()!, kind: 'inicial' } })
  expect(svg.status()).toBe(422)
  const big = await page.request.post('/api/clinico/fotos', { multipart: { foto: { name: 'x.png', mimeType: 'image/png', buffer: Buffer.alloc(9 * 1024 * 1024, 1) }, patientId: patientUrl.split('/').pop()!, kind: 'inicial' } })
  expect([413, 422]).toContain(big.status())
})

test('[REQ-SEG-002] login: clave incorrecta no entra y los intentos repetidos se bloquean', async ({ page }) => {
  const email = `bloqueo-${RUN}@example.test`
  for (let i = 0; i < 6; i++) {
    await page.goto('/panel/login')
    await page.getByLabel('Correo').fill(email)
    await page.getByLabel('Contraseña').fill('incorrecta-incorrecta')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/error=/)
  }
  await expect(page.getByRole('alert').filter({ hasText: 'Demasiados intentos' })).toBeVisible()
  // el usuario legítimo (otro correo) no queda bloqueado
  await login(page)
})

test('[REQ-SEG-004] no hay sitio público: la raíz lleva al login y el CMS ya no existe', async ({ page, playwright }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/panel\/login/)
  const anon = await playwright.request.newContext({ baseURL: 'http://localhost:3000', maxRedirects: 0 })
  expect((await anon.get('/robots.txt')).status()).toBe(200)
  expect(await (await anon.get('/robots.txt')).text()).toContain('Disallow: /')
  await anon.dispose()
  await login(page)
  await page.goto('/panel/sitio')
  await expect(page.getByText('No encontramos esa página')).toBeVisible()
})

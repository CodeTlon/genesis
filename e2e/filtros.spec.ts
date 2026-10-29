import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'
import { DB, ensureUser, login } from './helpers'

// Prueba la lógica de los filtros con datos de forma conocida (scripts/fixtures-filtros.ts): seis pacientes, cinco casos y seis atenciones con etiqueta propia.
test.describe.configure({ mode: 'serial' })
test.setTimeout(120_000)

const TAG = `f${Date.now().toString(36)}`
const filas = (page: Page) => page.locator('main ul.divide-y > li')

test.beforeAll(() => {
  ensureUser()
  execFileSync('npx', ['tsx', 'scripts/fixtures-filtros.ts'], {
    cwd: path.resolve(__dirname, '..'), stdio: 'pipe', timeout: 90_000,
    env: { ...process.env, DATABASE_URL: DB, SEMBRAR_DATOS_FICTICIOS: 'si', FIXTURES_TAG: TAG, NODE_ENV: 'test', CLINICAL_DATA_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64') },
  })
})

/** Elige una opción de un desplegable de filtro y espera a que la URL la refleje. */
async function elegir(page: Page, etiqueta: string, opcion: string, clave: string, valor: string) {
  await page.getByRole('combobox', { name: etiqueta, exact: true }).selectOption({ label: opcion })
  await expect(page).toHaveURL(new RegExp(`${clave}=${valor}`))
}
async function textos(page: Page) { return (await filas(page).allInnerTexts()).map((t) => t.replace(/\s+/g, ' ')) }
/** Espera a que la lista tenga exactamente estas filas (por texto) y no otras. */
async function esperar(page: Page, n: number, contiene: string[] = []) {
  await expect(filas(page)).toHaveCount(n)
  const t = (await textos(page)).join(' | ')
  for (const c of contiene) expect(t, `falta «${c}» en: ${t}`).toContain(c)
}

test('[REQ-INT-009] pacientes: cada filtro devuelve exactamente los pacientes esperados', async ({ page }) => {
  await login(page)
  await page.goto(`/panel/pacientes?q=${TAG}`)
  await esperar(page, 6)

  await elegir(page, 'Mostrar', 'Con alertas clínicas', 'filtro', 'alertas')
  await esperar(page, 4, ['Diabetica', 'Menor', 'Anticoag', 'Dos'])
  expect((await textos(page)).join()).not.toMatch(/Sana|Borrador/)

  await elegir(page, 'Mostrar', 'Menores de edad', 'filtro', 'menores')
  await esperar(page, 1, ['Menor'])

  await elegir(page, 'Mostrar', 'Con caso abierto', 'filtro', 'caso-abierto')
  await esperar(page, 3, ['Diabetica', 'Borrador', 'Dos'])

  await elegir(page, 'Mostrar', 'Sin casos', 'filtro', 'sin-casos')
  await esperar(page, 2, ['Sana', 'Menor'])

  // Por tipo de alerta (con "Todos")
  await page.getByRole('combobox', { name: 'Mostrar', exact: true }).selectOption({ label: 'Todos' })
  await expect(page).not.toHaveURL(/filtro=/)
  await elegir(page, 'Tipo de alerta', 'Diabetes', 'alerta', 'diabetes')
  await esperar(page, 1, ['Diabetica'])
  await elegir(page, 'Tipo de alerta', 'Anticoagulantes', 'alerta', 'anticoagulantes')
  await esperar(page, 1, ['Anticoag'])
  await elegir(page, 'Tipo de alerta', 'Antiagregados', 'alerta', 'antiagregados')
  await esperar(page, 1, ['Anticoag'])
  await elegir(page, 'Tipo de alerta', 'Alergia', 'alerta', 'alergia')
  await esperar(page, 1, ['Dos'])
  await elegir(page, 'Tipo de alerta', 'Menor de edad', 'alerta', 'menor')
  await esperar(page, 1, ['Menor'])

  // Filtros combinados: el resultado es la intersección; sin coincidencias, aviso claro
  await elegir(page, 'Tipo de alerta', 'Diabetes', 'alerta', 'diabetes')
  await elegir(page, 'Mostrar', 'Con caso abierto', 'filtro', 'caso-abierto')
  await esperar(page, 1, ['Diabetica'])
  await elegir(page, 'Tipo de alerta', 'Anticoagulantes', 'alerta', 'anticoagulantes')
  await expect(page.getByText('No hay pacientes con esos filtros')).toBeVisible()

  // Limpiar vuelve al listado base y reinicia los desplegables
  await page.getByRole('link', { name: 'Limpiar filtros' }).click()
  await expect(page).toHaveURL(/\/panel\/pacientes$/)
  await expect(page.getByRole('combobox', { name: 'Mostrar', exact: true })).toHaveValue('todos')
  await expect(page.getByRole('combobox', { name: 'Tipo de alerta', exact: true })).toHaveValue('')
})

test('[REQ-INT-009] pacientes: el orden y la búsqueda en vivo respetan los filtros', async ({ page }) => {
  await login(page)
  await page.goto(`/panel/pacientes?q=${TAG}`)
  await esperar(page, 6)
  const orden = async () => (await textos(page)).map((t) => t.match(/(Anticoag|Borrador|Diabetica|Dos|Menor|Sana)/)![1])
  expect(await orden()).toEqual(['Anticoag', 'Borrador', 'Diabetica', 'Dos', 'Menor', 'Sana'])
  await elegir(page, 'Orden', 'Cargados hace poco primero', 'orden', 'recientes')
  await expect.poll(orden).toEqual(['Dos', 'Borrador', 'Anticoag', 'Menor', 'Diabetica', 'Sana'])

  // escribir mantiene el filtro y el orden
  await elegir(page, 'Mostrar', 'Con alertas clínicas', 'filtro', 'alertas')
  await page.getByRole('searchbox').fill(`diabetica ${TAG}`)
  await expect(page).toHaveURL(/q=diabetica/)
  await expect(page).toHaveURL(/filtro=alertas/)
  await expect(page).toHaveURL(/orden=recientes/)
  await esperar(page, 1, ['Diabetica'])
})

test('[REQ-INT-009] casos: estado, borradores y orden', async ({ page }) => {
  await login(page)
  await page.goto(`/panel/casos?q=${TAG}`)
  await esperar(page, 4, ['Caso-D', 'Caso-B', 'Caso-AAA', 'Caso-BBB'])
  const titulos = async () => (await textos(page)).map((t) => t.match(/Caso-(AAA|BBB|A|B|D)/)![0])
  expect(await titulos()).toEqual(['Caso-BBB', 'Caso-AAA', 'Caso-B', 'Caso-D']) // la actividad más reciente primero

  await elegir(page, 'Orden', 'Actividad más antigua primero', 'orden', 'antiguo')
  await expect.poll(titulos).toEqual(['Caso-D', 'Caso-B', 'Caso-AAA', 'Caso-BBB'])

  await elegir(page, 'Estado', 'Cerrados', 'estado', 'cerrados')
  await esperar(page, 1, ['Caso-A', 'Cerrado'])
  await elegir(page, 'Estado', 'Todos', 'estado', 'todos')
  await esperar(page, 5)
  await elegir(page, 'Estado', 'Abiertos', 'estado', 'abiertos').catch(async () => { /* el valor predeterminado no viaja en la URL */ })
  await expect(page.getByRole('combobox', { name: 'Estado', exact: true })).toHaveValue('abiertos')
  await esperar(page, 4)

  await elegir(page, 'Atenciones', 'Con borradores sin firmar', 'borrador', 'si')
  await esperar(page, 1, ['Caso-B', '1 sin firmar'])
  await elegir(page, 'Estado', 'Cerrados', 'estado', 'cerrados')
  await expect(page.getByText('No hay casos con esos filtros')).toBeVisible() // el caso cerrado no tiene borradores
})

test('[REQ-INT-009] atenciones: estado, período, orden y búsqueda', async ({ page }) => {
  await login(page)
  await page.goto(`/panel/atenciones?q=${TAG}`)
  await esperar(page, 6)

  await elegir(page, 'Estado', 'Borradores (sin firmar)', 'estado', 'borradores')
  await esperar(page, 1, ['Caso-B', 'Borrador'])
  await elegir(page, 'Estado', 'Firmadas', 'estado', 'firmadas')
  await esperar(page, 5)
  expect((await textos(page)).join()).not.toContain('Borrador ·')

  // Períodos (con "Todas" las atenciones): hoy, 7 días, este mes, mes pasado, 90 días
  await page.getByRole('combobox', { name: 'Estado', exact: true }).selectOption({ label: 'Todas' })
  await expect(page).not.toHaveURL(/estado=/)
  await elegir(page, 'Período', 'Hoy', 'periodo', 'hoy')
  await esperar(page, 4, ['Caso-D', 'Caso-AAA', 'Caso-BBB', 'Caso-B '])
  await elegir(page, 'Período', 'Últimos 7 días', 'periodo', '7')
  await esperar(page, 4)
  await elegir(page, 'Período', 'Este mes', 'periodo', 'mes')
  await esperar(page, 4)
  await elegir(page, 'Período', 'Mes pasado', 'periodo', 'mes-pasado')
  await esperar(page, 1, ['Caso-A'])
  await elegir(page, 'Período', 'Últimos 90 días', 'periodo', '90')
  await esperar(page, 5) // sin la firmada hace 100 días
  expect((await textos(page)).filter((t) => /Caso-B /.test(t) && t.includes('Firmada'))).toHaveLength(0)

  // Combinados
  await elegir(page, 'Período', 'Hoy', 'periodo', 'hoy')
  await elegir(page, 'Estado', 'Firmadas', 'estado', 'firmadas')
  await esperar(page, 3, ['Caso-D', 'Caso-AAA', 'Caso-BBB'])
  await elegir(page, 'Estado', 'Borradores (sin firmar)', 'estado', 'borradores')
  await elegir(page, 'Período', 'Mes pasado', 'periodo', 'mes-pasado')
  await expect(page.getByText('No hay atenciones con esos filtros')).toBeVisible()

  // Orden
  await page.getByRole('link', { name: 'Limpiar filtros' }).click()
  await expect(page).toHaveURL(/\/panel\/atenciones$/) // esperar a que termine la navegación antes de escribir
  await expect(page.getByRole('searchbox')).toHaveValue('')
  await page.getByRole('searchbox').fill(TAG)
  await esperar(page, 6)
  let t = await textos(page)
  expect(t[0]).toContain('Caso-BBB')
  expect(t[5]).toMatch(/Caso-B prueba|Caso-B f/) // la firmada hace 100 días es la última
  expect(t[5]).toContain('Firmada')
  await elegir(page, 'Orden', 'Más antiguas primero', 'orden', 'antiguo')
  await expect.poll(async () => (await textos(page))[0]).toContain('Firmada')
  t = await textos(page)
  expect(t[5]).toContain('Caso-BBB')

  // Búsqueda por título de caso
  await page.getByRole('searchbox').fill(`Caso-AAA ${TAG}`)
  await esperar(page, 1, ['Caso-AAA'])
})

test('[REQ-INT-003][REQ-INT-009] los números del inicio coinciden con lo que muestran los listados', async ({ page }) => {
  await login(page)
  // La lista llega por streaming: se espera a que aparezca el total (o el aviso de lista vacía) antes de leerlo.
  const num = async (url: string, re: RegExp) => {
    await page.goto(url)
    await expect.poll(async () => { const t = await page.locator('main').innerText(); return re.test(t) || /No hay|Todavía no hay/.test(t) }, { timeout: 15_000 }).toBe(true)
    const texto = await page.locator('main').innerText()
    const m = texto.match(re)
    return m ? Number(m[1].replace(/\./g, '')) : 0 // lista vacía: no hay texto de total
  }
  await page.goto('/panel/inicio')
  // el número final está en el texto para lectores de pantalla (el visible cuenta hacia arriba al entrar)
  const tarjeta = async (nombre: RegExp) => Number(((await page.getByRole('navigation', { name: 'Resumen' }).getByRole('link', { name: nombre }).locator('.sr-only').first().textContent()) ?? '').replace(/\./g, ''))
  const borradores = await tarjeta(/Borradores? sin firmar/)
  const hoy = await tarjeta(/Atenciones? de hoy/)
  const pacientes = await tarjeta(/Pacientes?\b/)
  const casos = await tarjeta(/Casos? abiertos?/)
  expect(await num('/panel/atenciones?estado=borradores', /(\d[\d.]*) atenci(?:ón|ones)/)).toBe(borradores)
  expect(await num('/panel/atenciones?periodo=hoy', /(\d[\d.]*) atenci(?:ón|ones)/)).toBe(hoy)
  expect(await num('/panel/pacientes', /(\d[\d.]*) pacientes?/)).toBe(pacientes)
  expect(await num('/panel/casos', /(\d[\d.]*) casos?/)).toBe(casos)
  // el aviso de la barra lateral también muestra los borradores
  await page.goto('/panel/inicio')
  await expect(page.getByRole('link', { name: /^Atenciones/ }).first()).toContainText(String(borradores))
})

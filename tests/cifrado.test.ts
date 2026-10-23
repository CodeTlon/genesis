import test from 'node:test'
import assert from 'node:assert/strict'
import { openJson, openText, sealJson, sealText } from '../apps/panel/src/lib/crypto.ts'

process.env.GENESIS_DATA_KEY = Buffer.alloc(32, 9).toString('base64')

test('[REQ-SEG-004] el contenido sellado no es legible y vuelve igual al abrirlo', () => {
  const sellado = sealJson({ conclusion: 'Pie de atleta en tratamiento' }, 'e1')
  assert.ok(sellado.enc.startsWith('enc:v1:'))
  assert.ok(!JSON.stringify(sellado).includes('atleta'))
  assert.deepEqual(openJson(sellado, 'e1'), { conclusion: 'Pie de atleta en tratamiento' })
})

test('[REQ-SEG-004] cada sellado usa un IV distinto', () => {
  assert.notEqual(sealText('igual', 'x'), sealText('igual', 'x'))
})

test('[REQ-SEG-004] un valor copiado a otra fila o alterado no se puede leer', () => {
  const s = sealText('secreto', 'fila-1')
  assert.throws(() => openText(s, 'fila-2'))
  const roto = s.slice(0, -4) + (s.endsWith('AAAA') ? 'BBBB' : 'AAAA')
  assert.throws(() => openText(roto, 'fila-1'))
})

test('[REQ-SEG-004] con otra clave no se abre', () => {
  const s = sealText('secreto', 'a')
  process.env.GENESIS_DATA_KEY = Buffer.alloc(32, 1).toString('base64')
  assert.throws(() => openText(s, 'a'))
})

test('[REQ-SEG-004] sin clave configurada no se guarda nada', () => {
  delete process.env.GENESIS_DATA_KEY
  assert.throws(() => sealText('x', 'a'), /GENESIS_DATA_KEY/)
})

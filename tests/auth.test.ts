import test from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword } from '../apps/panel/src/lib/auth-core.ts'

test('[REQ-SEG-003] la contraseña se guarda con hash y solo valida la correcta', () => {
  const h = hashPassword('una-clave-larga')
  assert.ok(h.startsWith('scrypt$') && !h.includes('una-clave'))
  assert.equal(verifyPassword('una-clave-larga', h), true)
  assert.equal(verifyPassword('otra', h), false)
  assert.notEqual(hashPassword('una-clave-larga'), h)
})

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

// REQ-SEG-003: contraseña por profesional con scrypt. Sin dependencias para usarlo desde scripts y tests.

export function hashPassword(pw: string): string {
  const salt = randomBytes(16)
  return `scrypt$${salt.toString('hex')}$${scryptSync(pw, salt, 64).toString('hex')}`
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [alg, salt, hash] = stored.split('$')
  if (alg !== 'scrypt' || !salt || !hash) return false
  const calc = scryptSync(pw, Buffer.from(salt, 'hex'), 64)
  const want = Buffer.from(hash, 'hex')
  return calc.length === want.length && timingSafeEqual(calc, want)
}

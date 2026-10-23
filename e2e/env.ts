// Claves SOLO de prueba (no son secretos reales). En producción viven en el entorno del servidor, nunca en el repo.
export const TEST_ENV = {
  DEMO_PASSWORD: 'demo123',
  GENESIS_DEMO_USERS: '1',
  GENESIS_DATA_KEY: Buffer.alloc(32, 7).toString('base64'),
  GENESIS_SESSION_SECRET: 'clave-de-sesion-solo-para-pruebas',
}

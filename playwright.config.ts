import { defineConfig } from '@playwright/test'
import os from 'node:os'
import path from 'node:path'

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://genesis:genesis@localhost:5433/genesis'

// Requiere `npm run build` previo y la base migrada. Levanta la app única en :3000 en modo producción.
// Los secretos son SOLO de prueba.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure', launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {} },
  webServer: [
    {
      command: 'npm run start -w @genesis/web', port: 3000, reuseExistingServer: false, timeout: 60_000,
      env: {
        DATABASE_URL,
        BETTER_AUTH_SECRET: 'secreto-solo-para-tests-e2e-0123456789abcdef',
        BETTER_AUTH_URL: 'http://localhost:3000',
        CLINICAL_DATA_ENCRYPTION_KEY: Buffer.alloc(32, 7).toString('base64'),
        PHOTOS_DIR: path.join(os.tmpdir(), 'genesis-e2e-fotos'),
      },
    },
  ],
})

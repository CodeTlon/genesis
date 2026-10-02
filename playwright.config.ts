import { defineConfig } from '@playwright/test'

// Requiere `npm run build` previo. Levanta web (3000) y panel (3001) en modo producción.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: 1,
  reporter: 'list',
  use: { trace: 'retain-on-failure' },
  webServer: [
    { command: 'npm run start -w @genesis/web', port: 3000, reuseExistingServer: true, timeout: 60_000 },
    { command: 'npm run start -w @genesis/panel', port: 3001, reuseExistingServer: true, timeout: 60_000, env: { DEMO_PASSWORD: 'demo123' } },
  ],
})

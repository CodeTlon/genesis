// Backup diario (REQ-SEG-006): un dump comprimido de la base (historias, adendas, fotos cifradas, usuarios, registro de accesos).
// Las fotos viven en la base, así que un solo archivo las cubre. Uso: node scripts/backup.mjs [carpeta]
// Local: pg_dump dentro del contenedor `db` del compose. En producción lo hace el script de la fábrica (backup-coolify.sh -> Backblaze B2).
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2] ?? 'backups'
mkdirSync(dir, { recursive: true })
const file = join(dir, `genesis-${new Date().toISOString().slice(0, 10)}.dump`)
const dump = execFileSync('docker', ['compose', 'exec', '-T', 'db', 'pg_dump', '-U', 'genesis', '-Fc', 'genesis'], { maxBuffer: 1 << 30 })
writeFileSync(file, dump)
writeFileSync(file + '.sha256', createHash('sha256').update(readFileSync(file)).digest('hex') + '\n')
console.log(`Backup: ${file} (${dump.length} bytes)`)

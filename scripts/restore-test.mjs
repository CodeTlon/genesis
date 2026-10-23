// Restauración de prueba (REQ-SEG-006): restaura el último backup en una base vacía y compara con la original.
// Uso: node scripts/restore-test.mjs <archivo.dump>. Deja la fecha en docs/backups.md.
import { execFileSync } from 'node:child_process'
import { readFileSync, appendFileSync } from 'node:fs'

const file = process.argv[2]
if (!file) { console.error('Uso: node scripts/restore-test.mjs <archivo.dump>'); process.exit(1) }
const dc = (args, input) => execFileSync('docker', ['compose', 'exec', '-T', 'db', ...args], { input, maxBuffer: 1 << 30 }).toString()
const psql = (db, sql) => dc(['psql', '-U', 'genesis', '-d', db, '-At', '-c', sql]).trim()
const resumen = (db) => psql(db, `SELECT (SELECT count(*) FROM hc_patients)||'/'||(SELECT count(*) FROM hc_entries)||'/'||(SELECT count(*) FROM hc_addenda)||'/'||(SELECT count(*) FROM hc_photos)||'/'||(SELECT count(*) FROM hc_audit)||'/'||coalesce((SELECT md5(string_agg(id||payload::text, ',' ORDER BY id)) FROM hc_entries),'')`)

psql('postgres', 'DROP DATABASE IF EXISTS genesis_restore_test')
psql('postgres', 'CREATE DATABASE genesis_restore_test')
dc(['pg_restore', '-U', 'genesis', '-d', 'genesis_restore_test', '--no-owner'], readFileSync(file))
const a = resumen('genesis'), b = resumen('genesis_restore_test')
psql('postgres', 'DROP DATABASE genesis_restore_test')
console.log('original :', a, '\nrestaurada:', b)
if (a !== b) { console.error('LAS HISTORIAS NO COINCIDEN'); process.exit(1) }
const hoy = new Date().toISOString().slice(0, 10)
appendFileSync('docs/backups.md', `- ${hoy}: restauración de prueba de \`${file}\` en una base vacía. Pacientes/atenciones/adendas/fotos/accesos y contenido de las atenciones coinciden (${a.split('/').slice(0, 5).join('/')}).\n`)
console.log('OK: restauración verificada.')

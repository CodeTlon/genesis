# Entorno de prueba en Coolify (para que Inés lo vea)

Objetivo: un link que Inés pueda abrir desde su compu o celular para ver el sistema con **datos ficticios**. Sin copia de seguridad y sin pacientes reales: es un entorno descartable. Producción es otro recurso, con otro dominio y otras claves (ver `README.md`).

## 1. Crear el recurso en Coolify
1. Proyecto → **New Resource** → repositorio de GitHub `CodeTlon/genesis` (por GitHub App o deploy key) → **Build Pack: Docker Compose**.
2. Rama **`test`** (se redeploya sola con cada push a `test`) y archivo `docker-compose.coolify.yml`.
3. En el servicio **`app`**, **Domains**: `https://<subdominio-de-prueba>` apuntando al puerto **3000** (HTTPS con Let's Encrypt). El DNS del subdominio tiene que apuntar al servidor de Coolify.

## 2. Variables (cargarlas en Coolify, nunca en el repo; valores propios de este entorno)
| Variable | Valor |
|---|---|
| `POSTGRES_PASSWORD` | una clave larga al azar |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://<subdominio-de-prueba>` (con HTTPS: las cookies de sesión son seguras) |
| `CLINICAL_DATA_ENCRYPTION_KEY` | `openssl rand -base64 32` (distinta de la de producción) |
| `APP_ENV` | `prueba` (muestra la franja «Entorno de prueba» y habilita cargar datos ficticios) |

## 3. Deploy y comprobación
- **Deploy**. Cuando termine, `https://<subdominio>/api/health` debe responder 200 y `/panel/login` mostrar el login con la franja amarilla de entorno de prueba.

## 4. Usuario y datos ficticios (terminal del contenedor `app` en Coolify)
```sh
# usuario para Inés (elegí una clave larga; no la pegues en chats ni en el repo)
USER_PASSWORD='<clave>' node scripts/crear-usuario.mjs "Inés" ines@genesis.test admin

# unos 40 pacientes ficticios, con casos, evoluciones y mapa de pies (se puede repetir para agregar más)
SEMBRAR_DATOS_FICTICIOS=si CANTIDAD=40 EXTREMOS=no node scripts/sembrar-prueba.cjs
```
`sembrar-prueba.cjs` solo corre si `APP_ENV=prueba`; en producción se niega.

## 5. Qué mandarle a Inés
- El link (`https://<subdominio>/panel/login`), su correo y la clave, **por un canal privado y por separado**.
- «Es una prueba con datos inventados: no cargues pacientes reales. Puede que borremos todo y lo carguemos de nuevo.»
- Qué mirar: el inicio, la lista de pacientes con sus filtros, una ficha (alertas, antecedentes, casos), una evolución con el mapa de pies, las fotos y la historia imprimible. Qué anotar: qué sobra, qué falta, qué no se entiende, las frases de las alertas (son una propuesta) y las zonas del mapa.

## 6. Resetear los datos de prueba
En la terminal de la base (servicio `db`): `psql -U genesis -d genesis -c "TRUNCATE patients, ... CASCADE"` no es seguro de memoria; lo más simple es **borrar el volumen `pgdata`** del recurso en Coolify y volver a desplegar (las migraciones se aplican solas), y repetir el paso 4.

## Límites de este entorno
Sin backup ni simulacro de restauración (REQ-SEG-005): **no** se cargan pacientes reales hasta tener ambos. Las frases de las alertas y los campos siguen pendientes de validar con Inés; el consentimiento de fotos queda en papel.

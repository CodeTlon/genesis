# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/content/package.json packages/content/
COPY packages/db/package.json packages/db/
COPY packages/ui/package.json packages/ui/
RUN npm ci --legacy-peer-deps

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/ ./
COPY . .
# El build NO necesita la base ni los secretos (las páginas con datos son dinámicas).
RUN npm run build

FROM node:20-alpine AS run
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 PHOTOS_DIR=/data/storage/clinico NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN apk add --no-cache tini && addgroup -S app && adduser -S app -G app && mkdir -p /data/storage/clinico && chown -R app:app /data
COPY --from=build --chown=app:app /app/apps/web/.next/standalone ./
COPY --from=build --chown=app:app /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=app:app /app/apps/web/public ./apps/web/public
COPY --from=build --chown=app:app /app/scripts ./scripts
COPY --from=build --chown=app:app /app/packages/db/migrations ./packages/db/migrations
COPY --chown=app:app docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]

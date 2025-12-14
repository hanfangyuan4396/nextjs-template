#!/bin/sh
set -e

SCHEMA_PATH="${PRISMA_SCHEMA:-/web/prisma/schema.prisma}"

if [ "${PRISMA_MIGRATE_ON_START:-true}" = "true" ]; then
  if [ -f "$SCHEMA_PATH" ] && [ -d "/web/prisma/migrations" ]; then
    echo "[boot] Running Prisma migrate deploy (schema: $SCHEMA_PATH, DATABASE_URL: ${DATABASE_URL:-<empty>})"
    /web/prisma-cli/node_modules/.bin/prisma migrate deploy --schema "$SCHEMA_PATH"
    echo "[boot] Prisma migrate deploy done"
  else
    echo "[boot] Prisma schema/migrations not found, skipping migrate deploy"
  fi
else
  echo "[boot] PRISMA_MIGRATE_ON_START!=true, skipping migrate deploy"
fi

exec node server.js



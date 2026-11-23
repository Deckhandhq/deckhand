#!/usr/bin/env bash
set -euo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="backups/$STAMP"
mkdir -p "$DEST"

USER="${POSTGRES_USER:-deckhand}"
DB="${POSTGRES_DB:-deckhand}"
PROJECT="${COMPOSE_PROJECT_NAME:-deckhand}"

docker compose exec -T postgres pg_dump -Fc -U "$USER" "$DB" > "$DEST/db.dump"

docker run --rm \
  -v "${PROJECT}_caddy_data:/data:ro" \
  -v "$PWD/$DEST:/backup" \
  alpine:3.20 tar czf /backup/caddy_data.tar.gz -C /data .

echo "Backup written to $DEST"

#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 backups/<timestamp>"
  exit 1
fi

DIR="$1"
[ -f "$DIR/db.dump" ] || { echo "Missing $DIR/db.dump"; exit 1; }

USER="${POSTGRES_USER:-deckhand}"
DB="${POSTGRES_DB:-deckhand}"
PROJECT="${COMPOSE_PROJECT_NAME:-deckhand}"

docker compose stop api web

docker compose exec -T postgres \
  pg_restore --clean --if-exists -U "$USER" -d "$DB" < "$DIR/db.dump"

if [ -f "$DIR/caddy_data.tar.gz" ]; then
  docker run --rm \
    -v "${PROJECT}_caddy_data:/data" \
    -v "$PWD/$DIR:/backup:ro" \
    alpine:3.20 sh -c 'rm -rf /data/* && tar xzf /backup/caddy_data.tar.gz -C /data'
fi

docker compose start api web
echo "Restore complete from $DIR"

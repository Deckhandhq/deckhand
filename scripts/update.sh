#!/usr/bin/env bash
set -euo pipefail

docker compose pull
docker compose up -d
docker compose ps

echo "Update complete. Verify with: curl -k https://${DOMAIN:-localhost}/api/health"

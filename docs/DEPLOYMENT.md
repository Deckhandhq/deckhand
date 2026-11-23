# Deployment checklist (VPS)

## Prerequisites

- Linux VPS, Docker + Docker Compose, CPU with AVX2 (Bun requirement).
- DNS A/AAAA records pointing to the VPS; ports 80 and 443 reachable.
- The three stack files come from the GitHub Release assets (immutable):

```bash
mkdir deckhand && cd deckhand
BASE=https://github.com/Deckhandhq/deckhand/releases/latest/download
for f in docker-compose.yml .env.example Caddyfile DEPLOYMENT.md backup.sh restore.sh update.sh; do
  curl -fsSLO "$BASE/$f"
done
chmod +x backup.sh restore.sh update.sh
cp .env.example .env
$EDITOR .env      # DOMAIN, POSTGRES_PASSWORD, BETTER_AUTH_SECRET, DECKHAND_VERSION
docker compose up -d
```

Pin `DECKHAND_VERSION` to a released tag (for example `0.1.0`) instead of `latest`.

## Hardening

- Firewall: allow SSH, 80 and 443 only (`ufw allow 22,80,443/tcp` then `ufw enable`).
- Enable `unattended-upgrades` and consider `fail2ban` for SSH.
- Run Docker as a non-root user in the `docker` group.
- Use a long random `POSTGRES_PASSWORD` and `BETTER_AUTH_SECRET`; avoid `@ / # : ?` in the DB password (it is interpolated into the URL).
- Postgres is bound to `127.0.0.1:5432` only. API, web and Caddy run with `no-new-privileges`, `init: true`, CPU/memory limits and rotating logs.
- Caddy obtains TLS automatically. Back up `caddy_data` together with the database.

## Backups

From the install directory:

```bash
./backup.sh                  # writes backups/<timestamp>/db.dump + caddy_data.tar.gz
./restore.sh backups/<timestamp>
```

Schedule `backup.sh` with cron or a systemd timer and **test a restore on a separate machine**. Offsite copies of the `backups/` directory are recommended.

## Updates and rollback

```bash
./update.sh                  # docker compose pull && docker compose up -d
```

To roll back, set `DECKHAND_VERSION=<older-tag>` in `.env` and run `docker compose up -d`. Never roll back to an older image after a destructive migration without restoring a backup first.

## Monitoring and troubleshooting

- External probe: `GET https://<domain>/api/health` should return `{"status":"ok"}`.
- Logs: `docker compose logs -f api web caddy`.
- Verify containers: `docker compose ps` — all four should be `healthy` or `Up`.
- If TLS fails: confirm DNS, open ports 80/443, and that `DOMAIN` in `.env` matches the public hostname.
- If the page shows `API : unavailable`, inspect `docker compose logs api` and the `API_INTERNAL_URL` network path (`web` → `api:3000`).

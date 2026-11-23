# Deployment checklist (VPS)

## Prerequisites

- Linux VPS, Docker + Docker Compose (2.23.1+), CPU with AVX2 (Bun requirement).
- DNS A/AAAA records pointing to the VPS; ports 80 and 443 reachable if using the built-in proxy.
- A single stack file, published as a GitHub Release asset.

## Install

```bash
mkdir deckhand && cd deckhand
curl -fsSLO https://github.com/Deckhandhq/deckhand/releases/latest/download/docker-compose.yml
$EDITOR docker-compose.yml
# replace every `change-me`, set ORIGIN, DOMAIN and BETTER_AUTH_URL,
# and pin the image tags to a released version
docker compose up -d
```

Start **without** a proxy with `docker compose up -d`, or enable the recommended Caddy proxy with:

```bash
docker compose --profile proxy up -d
```

Without Caddy, point HAProxy/Nginx at `127.0.0.1:3000`; the web service proxies `/api` to the API itself.

## Hardening

- Firewall: allow SSH, 80 and 443 only (`ufw allow 22,80,443/tcp` then `ufw enable`).
- Enable `unattended-upgrades` and consider `fail2ban` for SSH.
- Run Docker as a non-root user in the `docker` group.
- Use a long random `POSTGRES_PASSWORD` and `BETTER_AUTH_SECRET` in the compose file; avoid `@ / # : ?` in the DB password (it is interpolated into a URL).
- Postgres is bound to `127.0.0.1:5432`; API and web are bound to localhost ports. Caddy is optional.
- All services use `no-new-privileges`, `init: true` and rotating logs; API and web have CPU/memory limits.
- Caddy obtains TLS automatically. Back up `caddy_data` together with the database.

## Backups

The backup scripts live in the source repository (`scripts/`) and are meant to be copied next to the compose file:

```bash
# from the source repo
cp scripts/backup.sh scripts/restore.sh scripts/update.sh /path/to/deckhand/
cd /path/to/deckhand && chmod +x backup.sh restore.sh update.sh

./backup.sh                  # writes backups/<timestamp>/db.dump + caddy_data.tar.gz
./restore.sh backups/<timestamp>
```

Schedule `backup.sh` with cron or a systemd timer and **test a restore on a separate machine**. Offsite copies of the `backups/` directory are recommended.

## Updates and rollback

Edit the image tags in `docker-compose.yml`, then:

```bash
docker compose pull && docker compose up -d
```

To roll back, restore the previous image tag in the compose file and recreate the containers. Never roll back to an older image after a destructive migration without restoring a backup first.

## Monitoring and troubleshooting

- External probe: `GET https://<domain>/api/health` should return `{"status":"ok"}`.
- Logs: `docker compose logs -f api web`.
- Verify containers: `docker compose ps`.
- If TLS fails: confirm DNS, open ports 80/443, and that `DOMAIN` in the compose file matches the public hostname.
- If the page shows `API : unavailable`, inspect `docker compose logs api` and the `API_INTERNAL_URL` path (`web` → `api:3000`).

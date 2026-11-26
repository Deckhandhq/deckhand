# Deployment

[Documentation index](../README.md) - [Backups](backups.md) - [Monitoring](monitoring.md)

Deckhand is published as multi-arch Docker images. A VPS needs only Docker and Docker Compose; no source checkout is required on the server.

## Prerequisites

- A Linux VPS with Docker and Docker Compose 2.23.1 or newer.
- A CPU with AVX2, required by Bun.
- DNS A and AAAA records pointing to the VPS, with ports 80 and 443 reachable when using the built-in proxy.
- The single stack file, published as a GitHub Release asset.

## Install

```bash
mkdir deckhand && cd deckhand
curl -fsSLO https://github.com/Deckhandhq/deckhand/releases/latest/download/docker-compose.yml
$EDITOR docker-compose.yml
docker compose up -d
```

Before starting, replace every `change-me` value, set `ORIGIN`, `DOMAIN` and `BETTER_AUTH_URL`, and pin the image tags to a released version.

Start without a proxy with `docker compose up -d`, or enable the recommended Caddy profile:

```bash
docker compose --profile proxy up -d
```

Without Caddy, point HAProxy or Nginx at `127.0.0.1:3000`; the web service proxies `/api` to the API itself.

## Stack configuration

| Service | Host port | Notes |
|---|---|---|
| PostgreSQL | `127.0.0.1:5432` | Health check via `pg_isready`; data in `postgres_data` |
| API | `127.0.0.1:3001` | Container port 3000; health check through `/health` |
| Web | `127.0.0.1:3000` | Container port 3000; health check on `/` |
| Caddy | 80, 443 | Optional, enabled by the `proxy` profile |

Environment values to set in the compose file:

| Variable | Service | Purpose |
|---|---|---|
| `POSTGRES_PASSWORD` | PostgreSQL | Long random value; avoid `@ / # : ?`, which break URL interpolation |
| `DATABASE_URL` | API | Connection string to the `postgres` service |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | API | Reserved for planned authentication |
| `ORIGIN` | Web | Public origin of the site |
| `API_INTERNAL_URL` | Web | Internal API address, `http://api:3000` |
| `PROTOCOL_HEADER`, `HOST_HEADER` | Web | Forwarded headers used behind a proxy |
| `DOMAIN` | Caddy | Public hostname used for automatic TLS |

> **Note** - The database, API and web services are bound to localhost ports. Caddy is optional. All services use `no-new-privileges`, `init: true` and rotating logs; API and web have CPU and memory limits. See [Monitoring](monitoring.md).

## Hardening

- Allow only SSH and HTTP(S) through the firewall: `ufw allow 22,80,443/tcp` then `ufw enable`.
- Enable `unattended-upgrades` and consider `fail2ban` for SSH.
- Run Docker as a non-root user in the `docker` group.
- Use long random values for the database password and auth secret.
- Back up the `caddy_data` volume together with the database; it holds the TLS material. See [Backups](backups.md).

## Verify and troubleshoot

The external probe is `GET https://<domain>/api/health`, which should return `{"status":"ok"}`. Full diagnostics are in [Monitoring](monitoring.md).

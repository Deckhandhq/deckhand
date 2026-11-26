# Monitoring and troubleshooting

[Documentation index](../README.md) - [Deployment](deployment.md) - [Backups](backups.md)

## Health probe

The external probe is:

```bash
curl -fsS https://<domain>/api/health
```

Expected response:

```json
{"status":"ok"}
```

The API container also has an internal health check against `http://localhost:3000/health`, and the web container checks `/`. Docker Compose waits for the database to be healthy before starting the API, and for the API before starting the web service.

## Logs and container state

```bash
docker compose logs -f api web
docker compose ps
```

The API error plugin logs unexpected errors server-side while returning a generic 500 to clients. See [API](../guides/api.md).

## TLS failures

If HTTPS does not come up:

1. Confirm the DNS records point to the VPS.
2. Confirm ports 80 and 443 are reachable.
3. Confirm `DOMAIN` in the compose file matches the public hostname.

Caddy obtains certificates automatically; its state lives in the `caddy_data` volume, which is included in backups. See [Backups](backups.md).

## The page says "API: unavailable"

The home page reports health from the API. When it shows `API: unavailable`:

1. Inspect `docker compose logs api`.
2. Check `API_INTERNAL_URL` on the web service; it must resolve to `http://api:3000` on the Docker network.
3. Confirm the API container is healthy with `docker compose ps`.

During server rendering the web server calls the API directly over the internal URL instead of going through the public origin, so an internal networking problem can show up while the public `/api/health` probe still succeeds. See [Architecture overview](../architecture/overview.md).

## What is not instrumented yet

OpenTelemetry observability is on the [Roadmap](../product/roadmap.md). For now, health checks, container logs and external probes are the available signals.

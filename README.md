# Dekhand

A Bun monorepo with an Elysia + Prisma API, a SvelteKit frontend, and Docker
images that run both behind Caddy.

## Layout

```
apps/api          Elysia + Prisma 8 (PostgreSQL)
apps/web          SvelteKit 3 + TypeScript
packages/shared   TypeScript types used by both apps
```

## Development

```bash
bun install
bun run dev
```

The API listens on http://localhost:3000 and the web app on
http://localhost:5173.

The API needs `DATABASE_URL`. For a local Prisma Postgres instance with the
migrations applied:

```bash
cd apps/api
bun run dev:composer
```

`bun run check`, `test`, `lint`, `format` and `build` run from the repository
root.

## Docker

```bash
docker build --target api -t dekhand-api .
docker build --target web -t dekhand-web .
```

Building without `--target` produces a single image that runs both apps.
Pushing a `v*` tag publishes these images to `ghcr.io/<owner>/dekhand-api` and
`ghcr.io/<owner>/dekhand-web` through the release workflow.

## Deploy

On the server, copy `.env.example` to `.env`, set `DEKHAND_DOMAIN` and
`POSTGRES_PASSWORD`, replace `CHANGEME` in `compose.yaml` with your image owner,
then run `docker compose up -d`. Caddy handles TLS; only ports 80 and 443 need
to be open.

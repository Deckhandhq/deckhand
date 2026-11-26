# Repository layout

[Documentation index](../README.md) - [Conventions](conventions.md)

```text
.
├── apps/
│   ├── api/                       # @deckhand/api - Elysia monolith
│   │   └── src/
│   │       ├── app.ts             # Composed app; exports `type App`, no listener
│   │       ├── index.ts           # Server entry point; calls .listen()
│   │       ├── env.ts             # Port and environment
│   │       ├── modules/health/    # Health module
│   │       └── plugins/errors.ts  # Shared error mapping
│   └── web/                       # @deckhand/web - SvelteKit frontend
│       └── src/
│           ├── lib/api/client.ts  # Typed Eden client
│           └── routes/
│               ├── +page.server.ts        # SSR health resolution
│               ├── api/[...path]/+server.ts  # Same-origin /api fallback proxy
│               └── +layout.svelte, +page.svelte
├── packages/
│   └── database/                  # @deckhand/database
│       ├── prisma/
│       │   ├── schema.prisma      # Models and generators
│       │   ├── migrations/        # Migration history
│       │   └── seed.ts            # Reference data, no demo data
│       ├── prisma.config.ts       # CLI config; loads the root .env
│       └── src/
│           ├── client.ts          # Prisma client singleton
│           ├── index.ts           # Public exports
│           └── generated/         # Prisma client and Prismabox models
├── scripts/                       # backup.sh, restore.sh, update.sh
├── Dockerfile                     # Multi-arch images for both services
├── docker-compose.yml             # Published single-file stack
├── .env.example                   # Development-only variables
└── AGENTS.md                      # Canonical agent instructions
```

## Reading the tree

- The API exports its type from `app.ts` and starts the listener in `index.ts`. That split is what makes the app importable by tests and by the frontend. See [Type flow](../architecture/type-flow.md).
- Generated code lives under `packages/database/src/generated`; it is produced by `bun run db:generate` and is not hand-edited.
- The web app contains two ways to reach the API: the typed client for application code, and the SvelteKit fallback proxy for browser requests when no external proxy strips `/api`. See [Services](../architecture/services.md).
- The scripts are copied next to the compose file on a VPS; see [Backups](../operations/backups.md).

# Data model

[Documentation index](../README.md) - [Type flow](type-flow.md) - [Services](services.md)

The schema is intentionally minimal. It defines a foundation aligned with a future Better Auth model and contains no demo data.

## Current schema

`packages/database/prisma/schema.prisma` defines one model.

| Field           | Type       | Notes                            |
| --------------- | ---------- | -------------------------------- |
| `id`            | `String`   | Primary key, `cuid()` by default |
| `name`          | `String`   | Required                         |
| `email`         | `String`   | Unique                           |
| `emailVerified` | `Boolean`  | Defaults to `false`              |
| `image`         | `String?`  | Optional                         |
| `createdAt`     | `DateTime` | Defaults to the current time     |
| `updatedAt`     | `DateTime` | Maintained by Prisma             |

```prisma
model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  emailVerified Boolean  @default(false)
  image         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

> **Note** - `@better-auth/prisma-adapter` will add the tables it needs when authentication is implemented; see the [Roadmap](../product/roadmap.md).

## Generators

| Generator   | Provider        | Output                                      |
| ----------- | --------------- | ------------------------------------------- |
| `client`    | `prisma-client` | `packages/database/src/generated/prisma`    |
| `prismabox` | `prismabox`     | `packages/database/src/generated/prismabox` |

The Prismabox generator uses `t` from Elysia as its TypeBox import, which is why validation models are directly usable in routes. Run `bun run db:generate` after a schema change; see [Type flow](type-flow.md).

## Migrations

Migrations live in `packages/database/prisma/migrations`. The initial migration is present. Commands are exposed at the workspace root and go through `bunx --bun prisma`:

| Command               | Effect                                   |
| --------------------- | ---------------------------------------- |
| `bun run db:generate` | Regenerate client and validation models  |
| `bun run db:migrate`  | Create and apply a development migration |
| `bun run db:deploy`   | Apply pending migrations, for deployment |
| `bun run db:seed`     | Run the seed script                      |
| `bun run studio`      | Open Prisma Studio                       |

`packages/database/prisma.config.ts` loads the root `.env` explicitly, because the Prisma CLI does not do it on its own. Variables already present in the environment, such as those from Docker Compose or CI, are not overridden. The datasource URL reads `process.env.DATABASE_URL` directly, so `prisma generate` still works when no database is configured.

## Seed

`prisma/seed.ts` is the entry point for reference data. It deliberately contains no demo data. Add reference data there when the forum needs it.

## Client construction

`src/client.ts` creates a single `PrismaClient` with `PrismaPg` and the `DATABASE_URL` connection string. Outside production the instance is stored on `globalThis` to survive hot reloads. In application code, a missing `DATABASE_URL` throws immediately with a clear error.

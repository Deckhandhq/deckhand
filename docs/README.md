# Documentation

[Back to README](../README.md)

This directory is a self-contained documentation set for Deckhand. It covers the product, the monorepo architecture, local development, deployment and operations, and the conventions that keep the codebase consistent.

## Start here

| Goal                                          | Read                                                                             |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| Understand what Deckhand is                   | [Product overview](product/overview.md)                                          |
| Host it on a VPS                              | [Deployment](operations/deployment.md)                                           |
| Back up or restore an instance                | [Backups](operations/backups.md), [Monitoring](operations/monitoring.md)         |
| Develop locally                               | [Getting started](guides/getting-started.md)                                     |
| Understand a request from browser to database | [Architecture overview](architecture/overview.md)                                |
| Change the Prisma schema                      | [Data model](architecture/data-model.md), [Type flow](architecture/type-flow.md) |
| Add an API route or an Elysia module          | [Services](architecture/services.md), [Conventions](reference/conventions.md)    |
| Call the API from SvelteKit                   | [Type flow](architecture/type-flow.md), [Services](architecture/services.md)     |
| Navigate the source tree                      | [Repository layout](reference/repository-layout.md)                              |
| See what is planned                           | [Roadmap](product/roadmap.md)                                                    |

## Product

- [Overview](product/overview.md) - positioning, highlights and what exists today.
- [Roadmap](product/roadmap.md) - authentication, forum modules and planned checks.

## Architecture

- [Overview](architecture/overview.md) - stack, request paths, and the two services.
- [Type flow](architecture/type-flow.md) - how a Prisma schema field reaches the browser without code generation on the client.
- [Services](architecture/services.md) - API modules, error handling, the database package, and the Eden client.
- [Data model](architecture/data-model.md) - the current schema, generators, migrations and seed.

## Guides

- [Getting started](guides/getting-started.md) - prerequisites, environment, commands and workspace filters.
- [API](guides/api.md) - endpoints, generated documentation, error format, and typed calls.

## Operations

- [Deployment](operations/deployment.md) - VPS prerequisites, install, proxy and hardening.
- [Backups](operations/backups.md) - backup, restore and update scripts.
- [Monitoring](operations/monitoring.md) - health probe, logs and troubleshooting.

## Reference

- [Conventions](reference/conventions.md) - rules for services, Elysia, Prisma 7, the typed client and planned auth.
- [Repository layout](reference/repository-layout.md) - annotated tree of the workspaces.

# Backups

[Documentation index](../README.md) - [Deployment](deployment.md) - [Monitoring](monitoring.md)

The backup scripts live in the source repository and are meant to be copied next to the compose file on the server.

## Install the scripts

```bash
# from the source repository
cp scripts/backup.sh scripts/restore.sh scripts/update.sh /path/to/deckhand/
cd /path/to/deckhand && chmod +x backup.sh restore.sh update.sh
```

## Back up

```bash
./backup.sh
```

The script writes `backups/<timestamp>/` containing:

| File                | Contents                                         |
| ------------------- | ------------------------------------------------ |
| `db.dump`           | Custom-format PostgreSQL dump from `pg_dump -Fc` |
| `caddy_data.tar.gz` | The `caddy_data` volume, when present            |

It reads `POSTGRES_USER`, `POSTGRES_DB` and `COMPOSE_PROJECT_NAME` from the environment, with defaults of `deckhand`. Schedule it with cron or a systemd timer.

> **Warning** - Keep offsite copies of the `backups/` directory, and test a restore on a separate machine. An untested backup is not a backup.

## Restore

```bash
./restore.sh backups/<timestamp>
```

The script stops the API and web services, restores the dump with `pg_restore --clean --if-exists`, replaces the contents of `caddy_data` when the archive exists, then starts the services again.

> **Warning** - Restoring replaces database contents. Never roll back to an older image after a destructive migration without restoring a backup first.

## Update

Edit the image tags in `docker-compose.yml`, then pull and recreate:

```bash
docker compose pull && docker compose up -d
docker compose ps
```

Or use the provided script, which also prints the health check command:

```bash
./update.sh
```

Verify with `curl -k https://${DOMAIN:-localhost}/api/health` after the update. If something breaks, restore the previous image tags and recreate the containers; see the warning above about destructive migrations.

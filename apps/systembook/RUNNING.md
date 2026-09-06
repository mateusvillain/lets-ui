# Running the instance locally

The documentation instance is a Docker container described by
`docker-compose.yml` in this directory. Every command below runs from
`apps/systembook`, and none of them touch the repository's packages — the
instance is independent of the build.

```bash
cd apps/systembook
```

## Day to day

| Command                  | What it does                                     |
| ------------------------ | ------------------------------------------------ |
| `docker compose stop`    | Stops the container, keeping it and its data     |
| `docker compose start`   | Starts the stopped container again               |
| `docker compose ps`      | Shows the status — it should settle on `healthy` |
| `docker compose logs -f` | Follows the server output                        |

Once it reports `healthy`, the instance is on <http://localhost:3000> (or
whatever `PORT` is set to in `.env`).

The first run needs `up` instead, since there is no container to start yet:

```bash
cp .env.example .env      # fill in the four required variables
docker compose up -d
```

## `stop` is not `down`

`docker compose stop` only powers the container off. `docker compose down`
removes it as well; the next `up -d` creates a fresh one. Either is safe for
the content — the SQLite database and the uploaded preview artifacts live in
the `systembook-data` volume, which outlives the container.

`docker compose down -v` is the one that is not safe: `-v` deletes that volume,
and with it the database and every uploaded preview.

## What comes back on its own

The service is declared `restart: unless-stopped`, so Docker restarts it if it
crashes and brings it back when the Docker daemon starts — after a reboot, for
instance. The `unless-stopped` part is the exception: a container you stopped
yourself stays stopped, across reboots included.

So to keep the instance off, stop it with `docker compose stop` rather than
quitting Docker Desktop.

## Updating

`docker compose restart` restarts the container that is already there — it
never picks up a new image. A release is pulled in with:

```bash
docker compose pull && docker compose up -d
```

See the `README.md` section on running the instance for which tag `latest`
actually follows, and for the Safari cookie caveat on `http://localhost`.

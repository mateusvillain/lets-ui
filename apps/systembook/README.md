# SystemBook

Documentation for Let's UI on [SystemBook](https://github.com/mateusvillain/systembook) — a
self-hosted design system documentation platform with a real CMS behind it. The
written content lives in the instance's database and is edited from its admin
panel; this directory holds the two things that have to live in the repository:

- **`previews/`** — one `*.preview.tsx` per component, covering all 38 of
  them. The `@systembook/connector` CLI discovers them, builds one static
  artifact per variant, and CI uploads each one. The docs then embed the
  component this repository actually builds, not a screenshot of it.
- **`docker-compose.yml` + `.env.example`** — how the instance itself is run.

One instance documents one design system; there is no multi-tenancy.

## How the previews are wired

A preview file exports the `Preview` component the instance mounts inside the
iframe, plus a `PreviewConfig` describing its variants and interactive controls.
The Let's UI components are custom elements rather than React components, so two
pieces of glue sit next to them:

- **`previews/element.tsx`** — `elementProps()` normalises the generic props a
  preview receives into attributes a custom element can read (React would
  otherwise serialise `false` as `disabled="false"`, which Lit reads as true).
  It also triggers the browser-only load of the runtime.
- **`previews/runtime.ts`** — registers the custom elements, pulls in
  `letsui.min.css` for the tokens, and styles the iframe page itself. It is
  loaded through a dynamic import because the connector's discovery pass
  bundles every preview file for **Node** to read its config, and `LitElement`
  needs a DOM. For the same reason the stylesheet arrives as an asset URL
  rather than an `import`: esbuild walks this module with no CSS loader.
- **`previews/demo.tsx`** — `Sample` and `Stretch`, the placeholder content and
  full-width wrapper the layout primitives need to show what they do. Not part
  of the design system.

`runtime.ts` imports the packages' `dist/` output by relative path, so the
workspace has to be built first. A preview for a tag that is not yet listed in
`previews/custom-elements.d.ts` has to be added there too, or the typecheck
fails.

Components that take slotted content (`Tabs`, `Breadcrumb`, `DropdownMenu`,
`RadioGroup`, the layout primitives) declare it in the `Preview` function
rather than through a control — the slot is structure, and the controls only
mutate props.

## Working on the previews

This app is deliberately **outside the pnpm workspace** and installs from its own
lockfile — React and the connector must never enter the published packages'
dependency graph.

```bash
pnpm install && pnpm build     # at the repository root, first
cd apps/systembook
pnpm install --ignore-workspace

pnpm discover                  # list the previews and validate their configs
pnpm build                     # build the artifact into .systembook/dist
pnpm typecheck
```

`.systembook/` is generated output and is git-ignored. To look at a variant
locally, serve `.systembook/dist` and open `<component>--<variant>/index.html`.

Component names and variant ids become path segments on the instance, so they
must match `[A-Za-z0-9][A-Za-z0-9._-]*`. A variant id is also referenced by the
docs pages that embed it — renaming a published one breaks those embeds.

## Running the instance

`.env` is git-ignored; `.env.example` documents the four required variables.

```bash
cp .env.example .env      # fill in the four required variables
docker compose up -d
docker compose ps         # should settle on "healthy"
```

Two things bite a local instance specifically.

`latest` only moves on a `v*` tag upstream — a push to `main` publishes `edge`
instead. Between releases the tag can sit months behind the product, and
`docker compose restart` will not notice: it restarts the container it already
has. `docker compose pull && docker compose up -d` is what picks up a release.
Check what you are actually running with:

```bash
docker image inspect ghcr.io/mateusvillain/systembook:latest \
  --format '{{index .Config.Labels "org.opencontainers.image.version"}}'
```

And the image runs as `NODE_ENV=production`, which marks the session cookie
`Secure`: Safari refuses a Secure cookie over `http://localhost`, so the login
form there fails with no error message. Set `NODE_ENV=development` in a local
`.env` (the server reads that variable for nothing else) or use Chrome or
Firefox.

The first boot runs the migrations and creates the bootstrap admin from
`INITIAL_ADMIN_EMAIL` / `INITIAL_ADMIN_PASSWORD`. Log in at `/login`, create a
named user for each person, reset the bootstrap password, and remove
`INITIAL_ADMIN_PASSWORD` from `.env`. In production, put a TLS-terminating
reverse proxy in front — the session cookies are `Secure` outside local
development.

The SQLite database and the uploaded preview artifacts live in the
`systembook-data` volume and survive container updates. Nothing backs them up
automatically; set that up before the instance carries real content.

## Publishing

`.github/workflows/systembook-previews.yml` builds and uploads every variant on
push to `main`. It stays skipped until the instance is configured:

- Repository **variable** `SYSTEMBOOK_INSTANCE_URL` — the public URL, no
  trailing slash.
- Repository **secret** `SYSTEMBOOK_UPLOAD_TOKEN` — generated from the
  instance's **Tokens** page. It is shown once; revoke and regenerate if lost.

The CI workflow builds the same artifact on every pull request without
uploading, so a broken preview fails there instead of on `main`.

# AA Portfolio

Alex Atkinson's interactive portfolio of architecture systems, reusable interface components, product experiences, and AI-assisted delivery methods.

Live site: [alexat96.github.io](https://alexat96.github.io/)

## Run locally

Requires Node.js 22 or later and pnpm.

```bash
pnpm install
pnpm dev
```

The main routes are:

- `/` — Migration Compass and PoC Tracker showroom
- `/components` — individual component catalogue
- `/foundation` — reusable Compass pattern library
- `/methods` — AI-assisted delivery methods
- `/poc-tracker` — focused PoC Tracker gallery

## Build

```bash
pnpm build
```

The default build targets the existing vinext/Cloudflare runtime. A separate static export is used for GitHub Pages:

```bash
pnpm build:github
```

## Deployment

Pushing to `main` runs the GitHub Pages workflow in `.github/workflows/deploy-pages.yml`. The workflow builds the static export, applies the correct Pages base path, and publishes the result.

The site is designed as a public portfolio and uses fictional or reusable demonstration data. Do not add secrets or private client data to the repository.

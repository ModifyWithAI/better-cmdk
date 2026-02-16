# better-cmdk Monorepo

This repository is a Turborepo containing:

- `packages/better-cmdk`: the publishable `better-cmdk` package
- `apps/web`: the Next.js website/demo app
- `apps/docs`: the Mintlify documentation app

## Scripts

- `bun run dev` - run all dev tasks with Turbo
- `bun run dev:web` - run only the web app
- `bun run dev:docs` - run only docs
- `bun run build` - build all workspaces
- `bun run build:pkg` - build only `better-cmdk`
- `bun run build:web` - build only the web app

# namearchive.org

This repository uses a Bun workspace with separate client and server apps:
- `apps/client`: React + Vite app (CSR + SSR bundle generation)
- `apps/server`: Bun SSR server runtime

## Commands

- Install dependencies: `bun install`
- Run SSR dev server: `bun run dev`
- Run client-only dev server: `bun run dev:client`
- Build client and SSR server bundle: `bun run build`
- Run production SSR server: `bun run start`

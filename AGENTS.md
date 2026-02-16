# AGENTS

## Runtime and Package Manager
- Use `bun` for all package management and script execution in this repository.
- Do not use `npm`, `pnpm`, or `yarn` commands unless explicitly requested.

## Standard Commands
- Install dependencies: `bun install`
- Start SSR dev server: `bun run dev`
- Start client-only dev server: `bun run dev:client`
- Build client and SSR bundles: `bun run build`
- Start production SSR server: `bun run start`

## Dependency Changes
- Add dependency: `bun add <package>`
- Add dev dependency: `bun add -d <package>`
- Remove dependency: `bun remove <package>`

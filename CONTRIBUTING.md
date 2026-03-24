# Contributing to DevKit

Thanks for your interest in contributing! Here's how to get started.

## Prerequisites

- Node.js 20+
- pnpm 10+
- Rust (latest stable)
- Tauri 2 prerequisites ([guide](https://v2.tauri.app/start/prerequisites/))

## Development Workflow

1. Fork and clone the repo
2. Install dependencies: `pnpm install`
3. Create a branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Test locally: `cd apps/devkit && pnpm tauri dev`
6. Commit with a clear message
7. Push and open a PR

## Code Style

- TypeScript with strict mode
- Async/await (no callbacks or `.then()`)
- Early returns for guard clauses
- Tailwind CSS for styling (EnvGuard, API Pad)
- CSS Modules for PortMan components

## Project Structure

- `apps/devkit/src/components/{tool}/` — Tool-specific components
- `apps/devkit/src/hooks/{tool}/` — Tool-specific hooks
- `apps/devkit/src/lib/{tool}/` — Tool-specific utilities
- `apps/devkit/src/types/{tool}.ts` — Tool-specific types
- `apps/devkit/src-tauri/src/{tool}.rs` — Rust backend modules

## PR Process

1. Keep PRs focused — one feature or fix per PR
2. Include a clear description of what changed and why
3. Ensure the app builds: `pnpm build`
4. Test in the Tauri window: `pnpm tauri dev`

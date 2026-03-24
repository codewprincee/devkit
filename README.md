# DevKit

One open-source toolbox for developers. Port management, environment variable security, and API testing — all in a single desktop app.

## Tools

- **PortMan** — Monitor active ports, kill processes, view detailed process info
- **EnvGuard** — Manage, compare, validate, and encrypt `.env` files
- **API Pad** — Build, test, and debug APIs with collections, environments, and history

## Install

### Download

Grab the latest `.dmg` from [Releases](https://github.com/codewprincee/devkit/releases).

### Homebrew (coming soon)

```sh
brew install --cask devkit
```

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/)

### Setup

```sh
git clone https://github.com/codewprincee/devkit.git
cd devkit
pnpm install
```

### Run the unified desktop app

```sh
cd apps/devkit
pnpm tauri dev
```

### Run individual apps (standalone)

```sh
cd apps/portman && pnpm tauri dev
cd apps/envguard && pnpm tauri dev
cd apps/apipad && pnpm tauri dev
```

## Architecture

```
devkit/
├── apps/
│   ├── devkit/        # Unified desktop app (Next.js + Tauri)
│   ├── portman/       # Standalone port manager
│   ├── envguard/      # Standalone .env manager
│   ├── apipad/        # Standalone API client
│   └── web/           # Landing page
└── packages/
    ├── shared/        # Shared types & constants
    └── tsconfig/      # Shared TypeScript configs
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Desktop | Tauri 2, Rust |
| Build | Turborepo, pnpm workspaces |
| Language | TypeScript (strict), Rust |

## License

DevKit is open source under the [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE).

**Commercial licensing**: If you want to use DevKit in a proprietary product without AGPL obligations, contact us for a commercial license.

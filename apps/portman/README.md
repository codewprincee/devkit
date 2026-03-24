# PortMan — Port & Process Manager for macOS

A lightweight, native macOS app to monitor and manage network ports and processes. No more typing `lsof -i :3000` every time.

![PortMan Screenshot](https://img.shields.io/badge/platform-macOS-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Version](https://img.shields.io/badge/version-0.1.0-purple)

## Features

- **Real-time port monitoring** — See all listening and established connections at a glance
- **Process details** — View CPU, memory, threads, open files, uptime, and full command path
- **Kill processes** — Single or bulk kill with confirmation dialog
- **Multi-select** — Checkbox selection with select-all for batch operations
- **Search & filter** — Instant search by port number, filter by state (Listening/Established)
- **Sortable columns** — Click any column header to sort
- **Auto-refresh** — Updates every 5 seconds with visual indicator
- **Detail panel** — Click any row for deep process information
- **Lightweight** — ~5MB app bundle, built with Tauri (Rust + React)

## Installation

### Download

Grab the latest `.dmg` from the [Releases](https://github.com/codewprincee/portman/releases) page.

1. Open the `.dmg` file
2. Drag **PortMan** into your Applications folder
3. Launch from Applications or Spotlight

### Build from source

**Prerequisites:**
- [Node.js](https://nodejs.org/) 20+
- [Rust](https://rustup.rs/)

```bash
git clone https://github.com/codewprincee/portman.git
cd portman
npm install
npm run tauri build
```

The `.dmg` and `.app` will be in `src-tauri/target/release/bundle/`.

## Development

```bash
npm install
npm run tauri dev
```

## Tech Stack

- **Tauri 2** — Rust-based desktop framework (~5MB vs Electron's ~150MB)
- **React 19** + TypeScript — Frontend UI
- **Vite 7** — Build tooling
- **Pure CSS** — No UI libraries, hand-crafted design system

## Architecture

```
src/                  # React frontend
├── components/       # UI components (PortTable, DetailPanel, etc.)
├── hooks/            # Custom hooks (usePorts)
└── types.ts          # TypeScript interfaces

src-tauri/            # Rust backend
└── src/lib.rs        # Port scanning, process info, kill commands
```

The Rust backend uses `lsof` and `ps` to scan ports/processes and exposes Tauri commands to the React frontend via IPC.

## License

MIT

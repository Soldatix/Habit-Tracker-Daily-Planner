# Habit Tracker / Daily Planner — Apps & Games

Baseline V1.0 modular web app for tracking habits and planning daily tasks.

## Stack
- Vite 8.1.x
- Vanilla HTML / CSS / JavaScript (ES modules)
- LocalStorage persistence
- PWA manifest + service worker
- No UI framework and no backend

## Features
- Daily habit tracking with custom weekday schedules
- Daily planner with time, priority, notes and completion state
- 7-day progress statistics and best streak
- Croatian, English, German, Italian and Spanish UI
- Light / dark / system theme
- Local JSON export/import backup
- Responsive desktop/mobile layout
- Local-first privacy: user data stays in the browser

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

Output directory: `dist`

## Cloudflare Pages
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`

## Baseline rule
Tag the first verified version as `v1.0.0-baseline` before AG2 V2.1 vs Codex experiments. Both agents must start from the same commit and receive the same benchmark task.

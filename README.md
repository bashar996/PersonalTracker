# Tracker

A personal work & tasks tracker for macOS. Organizes tasks by project, with deadlines, reminders, subtasks, tags and media attachments (links, docs, voice notes, images). Everything is stored locally on your machine — nothing leaves your Mac.

Built with **Electron + React**. This implements the design exported from Claude Design in `project/Task Tracker.dc.html` (see `chats/chat1.md` for the design conversation that shaped it).

## Views

- **Today** — overdue / due today / upcoming, with stat cards and an all-clear state.
- **Board** — one column per project, drag-free kanban-style overview.
- **Projects** — grid of projects with progress bars → drill into any project.
- **All tasks** — search + filter by status, priority, project.
- **Calendar** — month view with project-colored dots per day.
- **Reminders** — bell icon in the header, plus native macOS notifications at the scheduled reminder time.

## Development

```bash
npm install
npm run dev
```

This starts the Vite dev server and launches the Electron window pointed at it, with hot reload for the renderer.

## Building a Mac app

```bash
npm run dist
```

Produces an unsigned `.app` (and `.dmg`) under `release/`. Since it's unsigned, macOS Gatekeeper will block the first launch — right-click the app in Finder and choose **Open** once to allow it. The first time a reminder fires, macOS will ask for notification permission; accept it so reminders can alert you outside the app window.

## Data storage

All projects, tasks, and settings (accent color, hide-completed) are stored in a single JSON file at:

```
~/Library/Application Support/Tracker/data.json
```

You can inspect, back up, or hand-edit this file directly — it's the same format the app reads/writes.

## Project layout

- `electron/main.js` — main process: window creation, JSON file persistence (IPC), native notifications.
- `electron/preload.js` — exposes a minimal `window.api` bridge to the renderer.
- `src/` — the React app (views, components, styling).
- `project/`, `chats/` — the original Claude Design export this app was built from.

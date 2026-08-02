# Tracker

A personal work & tasks tracker for macOS. Organizes tasks by project across multiple workspaces, with deadlines, reminders, subtasks, tags and media attachments (links, docs, voice notes, images). Everything is stored locally on your machine — nothing leaves your Mac.

Built with **Electron + React**. This implements the design exported from Claude Design in `project/Task Tracker.dc.html`, later updated by `project/Task Tracker v2.dc.html` (see `chats/chat1.md` for the design conversation that shaped it).

## Views

- **Board** (default) — one column per project, drag-free kanban-style overview, with a priority strip on each card.
- **Today** — Top priority / overdue / due today / upcoming, each independently collapsible, plus "Start of day" / "End of day" markdown notes. Optional **Focus mode** replaces the lists with one task at a time and an optional stopwatch.
- **Projects** — grid of projects with progress bars → drill into any project.
- **All tasks** — search + filter by status, priority (1–5), project.
- **Calendar** — month view with project-colored dots per day, plus a markdown note per day.
- **Settings** — accent color, hide-completed, and eight opt-in focus/attention features (focus mode, body-doubling timer, auto-break nudges, gentle reminders, reduce clutter, one thing at a time, color-coded urgency, completion celebration).
- **Workspaces** — separate spaces (e.g. Personal / Work), each with its own projects, tasks and notes; switch via the sidebar dropdown.
- **Dark mode** — manual toggle in the header, persisted.
- **Reminders** — bell icon in the header, plus native macOS notifications at the scheduled reminder time (checked across every workspace, not just the active one).

## Task media

Each task can carry attachments, added via the media type picker in the task editor:

- **Link** — paste a URL (scheme optional); click it to open in your default browser.
- **Doc** — pick any file; click it to open with your Mac's default app for that file type.
- **Voice** — record a note with your microphone; play it back inline. First use will prompt for microphone permission.
- **Note** — a quick free-text note with an optional title.
- **Image** — upload an image; shows as a thumbnail.

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

Everything — workspaces, their projects/tasks/notes, and app-wide settings (accent color, dark mode, the focus/attention toggles) — is stored in a single JSON file at:

```
~/Library/Application Support/Tracker/data.json
```

You can inspect, back up, or hand-edit this file directly — it's the same format the app reads/writes. Older single-workspace data files (from before workspaces existed) are migrated automatically on first launch into a "Personal" workspace.

## Project layout

- `electron/main.js` — main process: window creation, JSON file persistence (IPC), native notifications, opening links/files.
- `electron/preload.js` — exposes a minimal `window.api` bridge to the renderer.
- `src/` — the React app (views, components, styling).
- `build/icon.png` — the app icon (1024×1024); `electron-builder` generates the `.icns` from it at build time.
- `project/`, `chats/` — the original Claude Design export this app was built from.

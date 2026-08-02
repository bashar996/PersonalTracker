---
name: run-desktop
description: Build, run, and drive the Tracker Electron desktop app headlessly. Use when asked to start the desktop app, take a screenshot of it, or interact with its UI in this container (no display attached).
---

Tracker is an Electron + React desktop app (see repo root `README.md`). It
has no headless mode of its own — a real window is required — so for
agent/automated use, drive it via the REPL/batch driver at
`.claude/skills/run-desktop/driver.mjs` under Xvfb. The driver **is** the
Electron main process (not a separate app instance under Playwright): it
registers the same IPC handlers as `electron/main.js` and drives its own
`BrowserWindow` directly via `webContents.executeJavaScript` / `capturePage`.
No extra dependencies (no Playwright) — only `electron`, already a
devDependency.

All paths below are relative to the repo root.

## Prerequisites

```bash
which xvfb-run || apt-get install -y xvfb   # usually already present
npm install
```

## Start the Vite dev server first

The driver loads `http://localhost:5173` by default (override with `APP_URL`).
Start Vite in the background and wait for it:

```bash
node_modules/.bin/vite &   # use run_in_background if your tool supports it — plain `&` may not survive between tool calls
until curl -s -o /dev/null http://localhost:5173/; do sleep 0.3; done
```

## Run — batch mode (preferred for a single reliable tool call)

Write a newline-separated command file, then run the driver once with
`DRIVER_SCRIPT` pointed at it. It executes each line in order and quits.

```bash
cat > /tmp/commands.txt <<'EOF'
launch
ss 01-today
click-text Board
ss 02-board
EOF

DRIVER_SCRIPT=/tmp/commands.txt \
SCREENSHOT_DIR=/tmp/shots \
xvfb-run -a node_modules/.bin/electron --no-sandbox .claude/skills/run-desktop/driver.mjs
```

Screenshots land in `/tmp/shots/` (override with `SCREENSHOT_DIR`). **Always
pass `--no-sandbox` directly on the `electron` command line** — calling
`app.commandLine.appendSwitch('no-sandbox')` from inside the script is too
late when running as root in a container and crashes with
`FATAL:electron_main_delegate.cc ... Running as root without --no-sandbox`.

## Run — interactive REPL (for live back-and-forth)

Omit `DRIVER_SCRIPT` and wrap in tmux:

```bash
tmux new-session -d -s app -x 200 -y 50
tmux send-keys -t app 'xvfb-run -a node_modules/.bin/electron --no-sandbox .claude/skills/run-desktop/driver.mjs' Enter
timeout 20 bash -c 'until tmux capture-pane -t app -p | grep -q "driver>"; do sleep 0.3; done'
tmux send-keys -t app 'launch' Enter
timeout 20 bash -c 'until tmux capture-pane -t app -p | grep -q "launched:"; do sleep 0.3; done'
tmux send-keys -t app 'ss landing' Enter
tmux capture-pane -t app -p
```

### Commands

| command | what it does |
|---|---|
| `launch` | create the window, load `APP_URL` (default `http://localhost:5173`) |
| `ss [name]` | screenshot → `<SCREENSHOT_DIR>/<name>.png` (300ms settle delay first) |
| `click <css-sel>` | click element via DOM `.click()` |
| `click-text <text>` | click the first button/link/`[role=button]` whose text matches |
| `type <text>` | types into `document.activeElement` using the native value setter, so React controlled inputs pick it up (plain `.value =` is ignored by React) |
| `resize <WxH>` | resize the window, e.g. `resize 390x780` to check the mobile breakpoint |
| `eval <js>` | evaluate JS in the page, print JSON result |
| `windows` | print the window's current URL |
| `quit` | close the window and exit |
| `help` | list commands |

## Data / notifications while driving

The driver registers the same `data:load`/`data:save`/`open-external`/
`open-data-file` IPC handlers as the real app, pointed at the real
`app.getPath('userData')/data.json` — so whatever you see and change here
is the same data the packaged app would use. `notify` is stubbed to a
console log instead of a real `Notification`, since Notification Center
doesn't work headless under Xvfb; check the driver's stdout to confirm a
reminder *would* have fired. `open-external`/`open-data-file` similarly
log what they would have opened instead of actually doing it (no real
browser/OS app to hand off to under Xvfb).

**Adding new IPC handlers to `electron/main.js`?** Mirror them here too —
this driver is a separate hand-rolled main process, not a re-export of the
real one, so it drifts silently otherwise (a renderer call to an
unmirrored channel throws "No handler registered for X").

## Gotchas

- **`BrowserWindow` before `app.whenReady()` crashes/hangs.** The driver
  gates all command handling on `whenReady()` — don't move the REPL/batch
  startup above that `.then()`.
- **Stale Xvfb locks after a crashed run** cause the next launch to
  SIGSEGV. If a run crashes, clean up before retrying: `pkill -9 -f Xvfb;
  rm -f /tmp/.X*-lock`.
- **`dbus`/GPU/socket errors in the log are noise**, not failures — this
  container has no dbus/GPU/network by design. Only trust `[renderer
  error]`-prefixed lines (wired up via `console-message` in the driver) as
  real app problems.
- **Google Fonts won't load** if the container has no outbound network —
  the app falls back to system sans-serif. This is a sandbox artifact
  only; it loads fine on a real Mac with internet.
- **Background `&` processes (e.g. `vite &`) don't reliably survive
  between separate tool calls** in some harnesses — prefer your tool's
  proper background-process feature (e.g. `run_in_background: true`) over
  a bare `&`.

## Run (human path, on macOS)

```bash
npm run dev
```

Opens a real window — this is what a user runs; not headless-friendly.

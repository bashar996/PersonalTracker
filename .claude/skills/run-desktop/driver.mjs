// REPL driver for the Tracker Electron app. Run under xvfb on headless Linux.
// This script IS the Electron main process (launch via `electron driver.mjs`),
// so it registers the same IPC handlers as electron/main.js and drives its own
// BrowserWindow directly — no Playwright dependency needed.
// Designed for agents: wrap in tmux, send-keys commands, capture-pane output.
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '../../..');
const SHOT_DIR = process.env.SCREENSHOT_DIR || '/tmp/shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

app.commandLine.appendSwitch('no-sandbox');

// Same persistence contract as electron/main.js, so what you see here
// matches the real app (real userData dir, real data.json).
const dataFile = path.join(app.getPath('userData'), 'data.json');
ipcMain.handle('data:load', () => {
  try { return JSON.parse(fs.readFileSync(dataFile, 'utf-8')); } catch { return null; }
});
ipcMain.handle('data:save', (event, data) => {
  try {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    return true;
  } catch { return false; }
});
// Real Notification Center doesn't work headless under Xvfb — no-op here,
// just log so you can see when the app would have fired one.
ipcMain.handle('notify', (event, opts) => {
  console.log('(notify, no-op headless):', JSON.stringify(opts));
  return false;
});

let win = null;

const COMMANDS = {
  async launch() {
    if (win) return console.log('already launched');
    win = new BrowserWindow({
      width: 1180,
      height: 780,
      show: true,
      backgroundColor: '#f6f4ef',
      webPreferences: {
        preload: path.join(APP_ROOT, 'electron/preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
    win.webContents.on('console-message', (e, level, message) => {
      if (level >= 2) console.log('[renderer error]', message);
    });
    const url = process.env.APP_URL || 'http://localhost:5173';
    await win.loadURL(url);
    await new Promise((r) => setTimeout(r, 1200));
    console.log('launched:', url);
  },

  async ss(name) {
    if (!win) return console.log('ERROR: launch first');
    // Give React a tick to re-render + paint after a preceding click before capturing.
    await new Promise((r) => setTimeout(r, 300));
    const f = path.join(SHOT_DIR, (name || `ss-${Date.now()}`) + '.png');
    fs.writeFileSync(f, (await win.webContents.capturePage()).toPNG());
    console.log('screenshot:', f);
  },

  // DOM click via evaluate — reliable regardless of window chrome/offsets.
  async click(sel) {
    if (!win) return console.log('ERROR: launch first');
    const r = await win.webContents.executeJavaScript(
      `(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return 'NOT_FOUND'; el.click(); return 'OK'; })()`,
    );
    console.log('click', sel, '->', r);
  },

  async 'click-text'(text) {
    if (!win) return console.log('ERROR: launch first');
    const r = await win.webContents.executeJavaScript(
      `(() => { const els = [...document.querySelectorAll('button, a, [role="button"]')]; const t = ${JSON.stringify(text)}; const el = els.find(e => e.textContent.trim() === t) || els.find(e => e.textContent.includes(t)); if (!el) return 'NOT_FOUND'; el.click(); return 'OK'; })()`,
    );
    console.log('click-text', JSON.stringify(text), '->', r);
  },

  // Types into document.activeElement using the native value setter so
  // React's controlled inputs pick up the change (plain .value= is ignored).
  async type(text) {
    if (!win) return console.log('ERROR: launch first');
    const r = await win.webContents.executeJavaScript(
      `(() => { const el = document.activeElement; if (!el || !('value' in el)) return 'NO_FOCUSED_INPUT'; const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; const setter = Object.getOwnPropertyDescriptor(proto, 'value').set; setter.call(el, (el.value || '') + ${JSON.stringify(text)}); el.dispatchEvent(new Event('input', { bubbles: true })); return 'OK'; })()`,
    );
    console.log('type ->', r);
  },

  async resize(wh) {
    if (!win) return console.log('ERROR: launch first');
    const [w, h] = (wh || '1180x780').split('x').map(Number);
    win.setSize(w, h);
    await new Promise((r) => setTimeout(r, 200));
    console.log('resized to', w, h);
  },

  async eval(expr) {
    if (!win) return console.log('ERROR: launch first');
    try {
      console.log(JSON.stringify(await win.webContents.executeJavaScript(expr)));
    } catch (e) {
      console.log('ERROR:', e.message);
    }
  },

  async windows() {
    if (!win) return console.log('ERROR: launch first');
    console.log(' main:', win.webContents.getURL());
  },

  async quit() {
    if (win) win.close();
    win = null;
    app.quit();
  },

  help() {
    console.log('commands:', Object.keys(COMMANDS).join(', '));
  },
};

async function runLine(line) {
  const [cmd, ...rest] = line.trim().split(/\s+/);
  if (!cmd) return;
  const fn = COMMANDS[cmd];
  if (!fn) return console.log('unknown:', cmd, '— try: help');
  try {
    await fn(rest.join(' '));
  } catch (e) {
    console.log('ERROR:', e.message);
  }
}

// BrowserWindow can't be created before Electron's 'ready' event, so both
// batch mode and the REPL wait on whenReady() before doing anything.
app.whenReady().then(() => {
  // Batch mode: DRIVER_SCRIPT=/path/to/commands.txt (one command per line).
  // Runs non-interactively and quits — for a single reliable tool-call
  // invocation instead of a long-lived REPL over tmux/stdin.
  if (process.env.DRIVER_SCRIPT) {
    const lines = fs.readFileSync(process.env.DRIVER_SCRIPT, 'utf-8').split('\n');
    (async () => {
      for (const line of lines) {
        if (!line.trim() || line.trim().startsWith('#')) continue;
        console.log('> ' + line);
        await runLine(line);
      }
      if (win) await runLine('quit');
      process.exit(0);
    })();
  } else {
    const stdin = fs.createReadStream(null, { fd: fs.openSync('/dev/stdin', 'r') });
    const rl = readline.createInterface({ input: stdin, output: process.stdout, prompt: 'driver> ' });

    rl.on('line', async (line) => {
      await runLine(line);
      if (line.trim().split(/\s+/)[0] === 'quit') {
        rl.close();
        process.exit(0);
      }
      rl.prompt();
    });
    rl.on('close', async () => {
      await COMMANDS.quit();
      process.exit(0);
    });

    console.log('tracker driver — "help" for commands, "launch" to start');
    rl.prompt();
  }
});

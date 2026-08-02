const { app, BrowserWindow, ipcMain, Notification, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const dataDir = app.getPath('userData');
const dataFile = path.join(dataDir, 'data.json');
const iconPath = path.join(__dirname, '../build/icon.png');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 760,
    minHeight: 560,
    title: 'Tracker',
    backgroundColor: '#f6f4ef',
    titleBarStyle: 'hiddenInset',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Packaged builds get their icon from the .icns electron-builder bundles;
  // this just makes `npm run dev` look right in the Dock too.
  if (!app.isPackaged && process.platform === 'darwin' && app.dock && fs.existsSync(iconPath)) {
    app.dock.setIcon(iconPath);
  }

  // Voice notes need the microphone; deny everything else by default.
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(permission === 'media');
  });

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('data:load', () => {
  try {
    const raw = fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
});

ipcMain.handle('data:save', (event, data) => {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    return false;
  }
});

ipcMain.handle('notify', (event, { id, title, body } = {}) => {
  if (!Notification.isSupported()) return false;
  const n = new Notification({ title: title || 'Reminder', body: body || '' });
  n.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.webContents.send('notification-click', id);
    }
  });
  n.show();
  return true;
});

// Opens a link (task media of type "link") in the user's default browser.
ipcMain.handle('open-external', (event, url) => {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    shell.openExternal(u.toString());
    return true;
  } catch (e) {
    return false;
  }
});

// Opens an attached doc (stored as a data: URL) with the OS default app,
// by writing it to a temp file first — nicer than a silent download.
ipcMain.handle('open-data-file', (event, { name, dataUrl } = {}) => {
  try {
    const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
    if (!m) return false;
    const buf = Buffer.from(m[2], 'base64');
    const safeName = String(name || 'file').replace(/[\\/]/g, '_');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tracker-'));
    const tmpPath = path.join(tmpDir, safeName);
    fs.writeFileSync(tmpPath, buf);
    shell.openPath(tmpPath);
    return true;
  } catch (e) {
    return false;
  }
});

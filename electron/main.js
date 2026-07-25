const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

const dataDir = app.getPath('userData');
const dataFile = path.join(dataDir, 'data.json');

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

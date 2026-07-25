const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  loadData: () => ipcRenderer.invoke('data:load'),
  saveData: (data) => ipcRenderer.invoke('data:save', data),
  notify: (opts) => ipcRenderer.invoke('notify', opts),
  onNotificationClick: (cb) => {
    const listener = (event, id) => cb(id);
    ipcRenderer.on('notification-click', listener);
    return () => ipcRenderer.removeListener('notification-click', listener);
  },
});

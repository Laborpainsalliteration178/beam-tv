const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('beam', {
  getStatus: () => ipcRenderer.invoke('get-status'),
  start: () => ipcRenderer.invoke('start-server'),
  stop: () => ipcRenderer.invoke('stop-server'),
  setFriendlyName: (name) => ipcRenderer.invoke('set-friendly-name', name),
  addFolder: () => ipcRenderer.invoke('add-folder'),
  removeFolder: (path) => ipcRenderer.invoke('remove-folder', path),
  revealFolder: (path) => ipcRenderer.invoke('reveal-folder', path),
  onStatus: (cb) => ipcRenderer.on('status', (e, s) => cb(s)),
  onError: (cb) => ipcRenderer.on('server-error', (e, msg) => cb(msg)),
});

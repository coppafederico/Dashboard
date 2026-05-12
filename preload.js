const { contextBridge, ipcRenderer } = require('electron');

// Exposes a limited API to the renderer process.
contextBridge.exposeInMainWorld('electronAPI', {
  onOpenConfigPage: (callback) => {
    // Listens for the message sent by main.js when the Config menu item is clicked.
    ipcRenderer.on('open-config-page', () => callback());
  },

  getConfig: () => {
    // Gets the current connection configuration from the main prcess.
    return ipcRenderer.invoke('get-config');
  },

  saveConfig: (config) => {
    // Sends the new connection configuration to the main process.
    return ipcRenderer.invoke('save-config', config);
  }
});
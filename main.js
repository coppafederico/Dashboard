const { app, BrowserWindow, Menu, MenuItem, ipcMain } = require('electron');
const path = require('node:path');

// Stores the current connection settings.
let connectionConfig = {
  ip: '127.0.0.1',
  port: 3000
};

function createWindow() {
  const win = new BrowserWindow({
    webPreferences: {
      // Loads the preload script, which safely exposes Electron APIs to the renderer.
      preload: path.join(__dirname, 'preload.js'),

      // Keeps the renderer isolated from direct Node.js access for better security.
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');

  // Gets the default Electron application menu.
  const menu = Menu.getApplicationMenu();

  if (menu) {
    // Avoids creating duplicates of the Config page.
    const configMenuAlreadyExists = menu.items.some((item) => item.label === 'Config');

    if (!configMenuAlreadyExists) {
      menu.append(
        new MenuItem({
          label: 'Config',
          submenu: [
            {
              label: 'Open configuration',
              click: () => {
                // Sends a message to the renderer to open the configuration modal.
                win.webContents.send('open-config-page');
              }
            }
          ]
        })
      );

      // Updates the application menu with the new Config item.
      Menu.setApplicationMenu(menu);
    }
  }
}

// Sends the current configuration to the renderer.
ipcMain.handle('get-config', () => {
  return connectionConfig;
});

// Saves the new configuration from the renderer.
ipcMain.handle('save-config', (event, config) => {
  connectionConfig = {
    ip: String(config.ip).trim(),
    port: Number(config.port)
  };

  console.log('Saved config:', connectionConfig);

  return connectionConfig;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
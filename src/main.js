const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    frame: true,
    resizable: true,
    icon: path.join(__dirname, '../assets/icon.png'),
    backgroundColor: '#0f0f23',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'ui/index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
const installer = require('./installer');

ipcMain.handle('check-system', async () => {
  return await installer.checkSystem();
});

ipcMain.handle('install-dependencies', async () => {
  return await installer.installDependencies();
});

ipcMain.handle('validate-api-key', async (event, provider, key) => {
  return await installer.validateApiKey(provider, key);
});

ipcMain.handle('start-installation', async (event, config) => {
  return await installer.startInstallation(config, (progress) => {
    mainWindow.webContents.send('installation-progress', progress);
  });
});

ipcMain.handle('open-url', async (event, url) => {
  const { shell } = require('electron');
  await shell.openExternal(url);
});


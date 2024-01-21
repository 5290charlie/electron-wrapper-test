const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater, AppUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

/**
 * Auto update options...
 */
// autoUpdater.autoDownload = false;
// autoUpdater.autoInstallOnAppQuit = true;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

const sendUpdateMessage = (msg = 'default msg') => {
  mainWindow.webContents.send("updateMessage", msg);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('saveText', (event, txtVal) => {
  console.log('saveText:', event);

  const filePath = path.join(app.getPath('home'), '/.testing-electron');

  fs.writeFile(filePath, txtVal.toString(), (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Wrote to file:', filePath, txtVal);
    }
  });

  sendUpdateMessage(`Saved: "${txtVal}" (file: ${filePath})`);
});

autoUpdater.on('checking-for-update', (info) => {
  console.log('checking-for-update', info);
  sendUpdateMessage("checking for updates ...");
})

/*New Update Available*/
autoUpdater.on("update-available", (info) => {
  sendUpdateMessage(`Update available. Current version ${app.getVersion()}`);
  let pth = autoUpdater.downloadUpdate();
  sendUpdateMessage(pth);
});

autoUpdater.on("update-not-available", (info) => {
  sendUpdateMessage(`No update available. Current version ${app.getVersion()}`);
});

/*Download Completion Message*/
autoUpdater.on("update-downloaded", (info) => {
  sendUpdateMessage(`Update downloaded. Current version ${app.getVersion()}`);
});

autoUpdater.on("error", (info) => {
  sendUpdateMessage(info);
});


app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }

  autoUpdater.checkForUpdates();
});

app.whenReady().then(() => {
  // setTimeout(() => {
  //   autoUpdater.checkForUpdates();
  // }, 10000);

  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 30000);

  // autoUpdater.checkForUpdates();
  // autoUpdater.checkForUpdatesAndNotify();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
// app.whenReady().then(() => {
//   createWindow();

//   app.on('activate', () => {
//     // On OS X it's common to re-create a window in the app when the
//     // dock icon is clicked and there are no other windows open.
//     if (BrowserWindow.getAllWindows().length === 0) {
//       createWindow();
//     }
//   });

//   autoUpdater.checkForUpdates();
// });

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { ipcRenderer, contextBridge } = require('electron');

let bridge = {
  updateMessage: (callback) => ipcRenderer.on("updateMessage", callback),
};

contextBridge.exposeInMainWorld("bridge", bridge);

document.addEventListener('DOMContentLoaded', function () {
  let btn = document.getElementById('btn');
  btn.addEventListener('click', () => {
    let txtBox = document.getElementById('text-box');
    let value = txtBox.value;

    ipcRenderer.send("saveText", value);
  });
});

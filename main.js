const electron = require("electron");
const url = require('url');
const path = require('path');

const {app, BrowserWindow} = electron;

let mainWindow;

// Listen for the app to become ready
app.on('ready', function(){

  // Create a new window with width/height of 600
  mainWindow = new BrowserWindow({
    width: 600,
    height: 600
  });

  // load the windows contents
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', function(){
    app.quit();
  })

})

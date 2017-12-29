// Import dependencies
const electron = require("electron");
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;
// End dependencies

// windows
let mainWindow;
let addWindow;

// Menu template for the main menu
const mainMenuTemplate = [
  {
    label: "file",
    submenu: [
      {
        label: "open"
      },
      {
        label: "save"
      },
      {
        label: "close"
      }
    ]
  },
  {
    label: "Developer Tools",
    submenu:[
      {
        label: "Dev Tools",
        accelerator: "CommandOrControl+I",
        click(){
          mainWindow.openDevTools();
        }
      },
      {
        role: "reload"
      }
    ]
  }
];

// Create the main window
function createWindow(){
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

  // Create menu from the template and set it
  // as the application menu (mac compat)
  var mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  // Make it so that the whole app quits when the window is closed
  mainWindow.on('closed', function(){
    app.quit();
  });

}

// Create the add window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    parent: mainWindow,
    modal: true
  });

  // set the menu to null
  addWindow.setMenu(null);

  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Set the add window to null when it is closed
  addWindow.on("close", function(){
    addWindow = null;
  })

}

// Add stock item
function addStock(e, item){

  // Send the item payload
  mainWindow.webContents.send("add:stock", item);

  // Close the window
  addWindow.close();
}

// Wait for the app to become ready to make a window
app.on('ready', createWindow)

// Listen to the ipc main
ipcMain.on("open:stock", createAddWindow);
ipcMain.on("add:stock", (e, item) => addStock(e,item));

// Import dependencies
const electron = require("electron");
const url = require('url');
const path = require('path');
const https = require("https");
const settings = require("electron-settings")

const $ = require("jquery");

const {app, BrowserWindow, Menu, ipcMain} = electron;
// End dependencies

// windows
let mainWindow;
let addWindow;
let settingsWindow;

// set to production
process.env.NODE_ENV = "production";

// Menu template for the main menu
const mainMenuTemplate = [
  {
    label: "file",
    submenu: [
      {
        label: "settings",
        click(){
            createSettingsWindow();
        }
      }
    ]
  }
];

if(process.env.NODE_ENV != "production"){
  var devTool = {
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

  mainMenuTemplate.push(devTool);
}

// Create the main window
function createWindow(){
  // Create a new window with width/height of 600
  mainWindow = new BrowserWindow({
    width: 800,
    height: 500
  });

  // load the windows contents
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'html/mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Create menu from the template and set it
  // as the application menu (mac compat)
  var mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  // Set api-key to demo by default
  if(!settings.has('apikey'))
    settings.set('apikey', 'demo');


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

  // no menu
  addWindow.setMenu(null);

  // Load the html
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'html/addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Set the add window to null when it is closed
  addWindow.on("close", function(){
    addWindow = null;
  })

}

// Create the settings window
function createSettingsWindow(){
  // Create the settings window
  settingsWindow = new BrowserWindow({
    width: 300,
    height: 200,
    parent: mainWindow,
    modal: true
  });

  // no menu
  settingsWindow.setMenu(null);

  // load the html
  settingsWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'html/settingsWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Sets the settings window to null when closed (Garbage Collection)
  settingsWindow.on("close", function(){
    settingsWindow = null;
  })
}

// Add stock item
function addStock(e, item){

  // Send the item payload and close the window
  mainWindow.webContents.send("add:stock", item);
  addWindow.close();
}

function sendData(e, item){
  var requestCount = item["total_requests"];
  var requests = item["requests"];

  // iterate through each request
  for(var i = 0; i < requestCount; i++){
    // do the current request
    var currentRequest = requests[i];
    getRequest(i, currentRequest);

  }

}

function getRequest(index, request){
  // get the stock url and data
  var url = getStockURL(request);
  var jsonData = getJSONStock(url, request["function"], index);

}

function getJSONStock(stockURL, funcName, index){
  // do an https get request
  https.get(stockURL, (res) =>{
      // hold the output stream from the function
      var httpsOut = "";

      // append data
      res.on("data", (d)=>{
        httpsOut += d;
      })

      res.on('end', ()=>{
        // get the json output
        var stockJSON = JSON.parse(httpsOut);
        getData(stockJSON, funcName, index);


      })

      // log the error
  }).on('error', (e)=>{
    console.log(e);
  })

}

function getData(jsonData, funcName, index){

  stockPrices = jsonData["Technical Analysis: " + funcName];

  switch(funcName){
    case "SMA":
    case "EMA":

    var dates = [];
    var data = [];

      // Get the data
      for (var key in stockPrices) {
        if (stockPrices.hasOwnProperty(key)) {
          dates.push(key);
          data.push((stockPrices[key])[funcName]);
        }
      }

      dates.reverse();
      data.reverse();

      var stockData = {
        "labels": dates,
        "data" : data,
        "function" : funcName,
        "index" : index
      }

      mainWindow.webContents.send("data:stock", stockData);

      break;
  }

}

function getStockURL(item){

  var apikey = settings.get('apikey');

  return "https://www.alphavantage.co/query?function=" + item.function + "&symbol=" + item.symbol
  + "&interval=" + item.interval + "&time_period=" + item.time_period + "&series_type=" + item.series_type
  + "&apikey=" + apikey;

}

// Set the api key
function setkey(e, item){
  settings.set("apikey", item);
  settingsWindow.close();
}

// Wait for the app to become ready to make a window
app.on('ready', createWindow)

// Listen to the ipc main
ipcMain.on("open:stock", createAddWindow);
ipcMain.on("add:stock", (e, item) => addStock(e, item));
ipcMain.on("get:data", (e, item) => sendData(e, item));
ipcMain.on("set:apikey", (e, item) => setkey(e, item));

// Import dependencies
const electron = require("electron");
const url = require('url');
const path = require('path');
const https = require("https");

const $ = require("jquery");

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
    pathname: path.join(__dirname, 'html/addWindow.html'),
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

  // Send the item payload and close the window
  mainWindow.webContents.send("add:stock", item);
  addWindow.close();
}

// Get and return stock data
function getStock(e, item){
  // Get the stock data via jsonGet
  // send back to the main window with a reponse code

  // Get stock URL
  var stockURL = getStockURL(item.function, item.symbol, item.interval, item.time_period, item.series_type, "demo");

  // Get request JSON
  https.get(stockURL, (res)=>{
    // console.log("statusCode:", res.statusCode);
    // console.log("headers", res.headers);

    // variable to hold output stream
    var httpsOut = "";

    // Add to output stream
    res.on("data", (d)=>{
      httpsOut += d;
    })

    // End stream
    res.on("end", ()=>{

      // Full JSON output
      var stockJSON = JSON.parse(httpsOut);
      // Key to access the data
      var dataKey = "Technical Analysis: " + item.function;

      // variable to reference the stock prices
      var stockPrices = stockJSON[dataKey];

      // Dates and data
      var dates = [];
      var data = [];

      // Get the data
      for (var key in stockPrices) {
        if (stockPrices.hasOwnProperty(key)) {
          dates.push(key);
          data.push((stockPrices[key])[item.function]);
        }
      }

      // Reverse the data
      data.reverse();
      dates.reverse();

      // Create object to hold data
      var stockData ={
        "labels"    : dates,
        "data"      : data,
        "function"  : item["function"]
      }

      // Send the stock data to the window
      mainWindow.webContents.send("data:stock", stockData);

    })

  // Error in get request
  }).on('error', (e)=>{
    console.log(e);
  })

}

function getStockURL(func, sym, interval, time_period, series_type, apikey){

  return "https://www.alphavantage.co/query?function=" + func + "&symbol=" + sym
  + "&interval=" + interval + "&time_period=" + time_period + "&series_type=" + series_type
  + "&apikey=" + apikey;

}

// Wait for the app to become ready to make a window
app.on('ready', createWindow)

// Listen to the ipc main
ipcMain.on("open:stock", createAddWindow);
ipcMain.on("add:stock", (e, item) => addStock(e, item));
ipcMain.on("get:stock", (e, item) => getStock(e, item));

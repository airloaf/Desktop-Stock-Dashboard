// import
const {ipcRenderer} = require('electron');
const {Chart} = require("chart.js");

let context;
let stockChart;


// Get the elements when the window loads
window.onload = function(){
  // Set the event listener for the button
  var button = document.getElementById('add-stock')
  button.addEventListener('click', addStock);

  context = document.querySelector("#stock-canvas").getContext("2d");
}

// Executed when add stock button is pressed
function addStock(){
  // Send message to main processor
  // to open add window
  ipcRenderer.send("open:stock");
}

// Add items to the list
function addItem(e, item){

  // Create a list item with a text node
  var li = document.createElement("a");
  var itemText = document.createTextNode(item.toUpperCase());
  var ul = document.querySelector("#ticker-list");

  // Append the text node to the list and then to the list
  li.appendChild(itemText);
  ul.appendChild(li);

  // addEventListener to trigger stats page
  li.addEventListener("click", getStockData);

  // set the list class
  li.className = "collection-item";

  // If the list has children, set its style
  if(ul.children.length > 0){
    ul.className="collection";
  }

}

// Gets the stock clicked on
function getStockData(e){

  // Turn on the loading ui element
  var loadingSpinner = document.querySelector("#loading-spinner");

  // Gets the stock item clicked on and sends the item to the main process
  var stockTicker = e.toElement.innerHTML;
  var stockRequest = {
    function: "SMA",
    symbol: stockTicker,
    interval: "weekly",
    time_period: 10,
    series_type: "open"
  }
  ipcRenderer.send("get:stock", stockRequest);
}

// Stock data was returned
function stockDataReturned(e, stockData){
  console.log("Data Sent")

  // Destroy the stock chart if it's been instantiated
  if(stockChart != null)
    stockChart.destroy();

  stockChart = new Chart(context, {
    type: "line",
    data: {
      labels: stockData["labels"],
      datasets: [
        {
          label: stockData["function"],
          data: stockData["data"]
        }
      ]
    }
  })


}

ipcRenderer.on("add:stock", (e, item)=>addItem(e, item));
ipcRenderer.on("data:stock", (e, stockData)=>stockDataReturned(e, stockData))

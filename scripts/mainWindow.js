// import
const {ipcRenderer} = require('electron');
const {Chart} = require("chart.js");
const $ = require("jquery")

let context;
let stockChart;
let functionCount;

// Get the elements when the window loads
window.onload = function(){
  // Set the event listener for the button
  var button = document.getElementById('add-stock')
  button.addEventListener('click', addStock);

  functionCount = 0;
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
  li.className = "list-group-item";

  // If the list has children, set its style
  if(ul.children.length > 0){
    ul.className="list-group";
  }

}

// Gets the stock clicked on
function getStockData(e){

/*
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
*/

  // Clear stats page
  var statsPage = document.getElementById("stats-page");
  statsPage.innerHTML = "";

  createForm(statsPage);

}

//Creates the form
function createForm(statsPage){

    var form = document.createElement("div");
    form.id="input-form";
    statsPage.append(form);

    var formRow = document.createElement("div");
    formRow.className="form-row";
    form.appendChild(formRow);

    var formRow2 = document.createElement("div");
    formRow2.className="form-row";
    form.appendChild(formRow2);

    createTimeIntervalDropDown(formRow);
    createButtons(formRow2);

    form.appendChild(document.createElement("hr"));
}

// Creates the interval select
function createTimeIntervalDropDown(formRow){

  // interval dropdown
  var selectCol = document.createElement('div');
  selectCol.className="col";

  var intervalSelect = document.createElement("select");
  intervalSelect.className="form-control";
  intervalSelect.id="time-interval-select";
  addTimeIntervalOptions(intervalSelect);

  selectCol.appendChild(intervalSelect);

  // label
  var labelCol = document.createElement("div");
  labelCol.className="col"

  var label = document.createElement("label");
  label.className="input-group-text";
  label.setAttribute("for", intervalSelect.id);
  label.innerHTML="Time Interval";

  labelCol.appendChild(label);


  // append child
  formRow.appendChild(selectCol);
  formRow.appendChild(labelCol);

}
function addTimeIntervalOptions(select){
  var option1Min = document.createElement("option");
  option1Min.value="1min";
  option1Min.text="1 minute"

  var option5Min = document.createElement("option");
  option5Min.value="5min";
  option5Min.text="5 minute"

  var option15Min = document.createElement("option");
  option15Min.value="15min";
  option15Min.text="15 minute"

  var option30Min = document.createElement("option");
  option30Min.value="30min";
  option30Min.text="30 minute"

  var option60Min = document.createElement("option");
  option60Min.value="60min";
  option60Min.text="60 minute"

  var optionDaily = document.createElement("option");
  optionDaily.value="daily";
  optionDaily.text="daily"

  var optionWeekly = document.createElement("option");
  optionWeekly.value="weekly";
  optionWeekly.text="weekly"

  var optionMonthly = document.createElement("option");
  optionMonthly.value="monthly";
  optionMonthly.text="monthly"

  select.appendChild(option1Min);
  select.appendChild(option5Min);
  select.appendChild(option15Min);
  select.appendChild(option30Min);
  select.appendChild(option60Min);
  select.appendChild(optionDaily);
  select.appendChild(optionWeekly);
  select.appendChild(optionMonthly);

  select.className="form-control";

}
function createButtons(formRow){
  var div = document.createElement("div");
  div.className = "col";

  var div2 = document.createElement("div");
  div2.className = "col";

  var buttonAddFunctions = document.createElement("button");
  buttonAddFunctions.className="btn btn-primary";

  var buttonGetData = document.createElement("button");
  buttonGetData.className="btn btn-primary";

  buttonAddFunctions.innerHTML="Add Functions";
  buttonGetData.innerHTML="Get Data";

  buttonAddFunctions.addEventListener("click", addFunction);

  div.appendChild(buttonAddFunctions);
  div2.appendChild(buttonGetData);
  formRow.appendChild(div);
  formRow.appendChild(div2);

}

// adds a function div to the form
function addFunction(){

  functionCount++;

  //Get the for
  var form = document.getElementById("input-form");

  // add new div
  var functionDiv = document.createElement("div");
  functionDiv.id=(functionCount-1);
  form.appendChild(functionDiv);

  // adds the function inputs
  addFunctionRow(functionDiv);

  // append a horizontal rule
  form.appendChild(document.createElement("hr"))

}

function addFunctionRow(functionDiv){

  // create form row
  var formRow = document.createElement("div");
  formRow.className="form-row";

  // columns
  var formCol = document.createElement("div");
  formCol.className = "col";

  // select
  var select = document.createElement("select");
  select.className="form-control";
  select.id="function: " + (functionCount-1);

  // add function options
  addFunctionOptions(select);

  select.addEventListener("change", function(e){
    selectChanged(e.target);
  })

  var formCol2 = document.createElement("div");
  formCol2.className="col";

  var label = document.createElement("label");
  label.className="input-group-text";
  label.setAttribute("for", select.id);
  label.innerHTML = "Function";

  formCol.appendChild(select);
  formRow.appendChild(formCol);

  formCol2.appendChild(label);
  formRow.appendChild(formCol2);

  functionDiv.appendChild(formRow);

  selectChanged(select);

}

function addFunctionOptions(select){

    var optionSMA = document.createElement("option");
    optionSMA.value="SMA";
    optionSMA.text="Simple Moving Average";

    var optionXMA = document.createElement("option");
    optionXMA.value="EMA";
    optionXMA.text="Exponential Moving Average";

    select.appendChild(optionSMA);
    select.appendChild(optionXMA);

}

function selectChanged(target){
  // Get the parent
  var select = target;
  var parent = target.parentNode.parentNode.parentNode;

  console.log(parent);

  addFunctionParameters(target.value, parent);


}

function addFunctionParameters(funcName, parent){
  switch(funcName){
    case "SMA":
    case "EMA":
    case "BBANDS":
        addSMALikeFunctions(parent);
      break;
  }

}

function addSMALikeFunctions(parent){

  // remove previous div
  var previousDiv = document.getElementById(("function-parameters:" + parent.id))
  if(previousDiv != null)
    previousDiv.remove();

  // Create input div
  var inputDiv = document.createElement("div");
  inputDiv.id = "function-parameters:" + parent.id;

  var formRowTime = document.createElement("div");
  formRowTime.className="form-row";

  var formRowSeries = document.createElement("div");
  formRowSeries.className = "form-row";

  addTimePeriodInput(formRowTime, parent);
  addSeriesInput(formRowSeries, parent);

  inputDiv.appendChild(formRowTime);
  inputDiv.appendChild(formRowSeries);
  parent.appendChild(inputDiv);

}

function addTimePeriodInput(formRow, parent){
  var col = document.createElement("div");
  col.className = "col";

  var input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("placeholder", "eg. 60, 200");
  input.id=("time_period: " + parent.id);

  var labelCol = document.createElement('div')
  labelCol.className="col";

  var label = document.createElement("label");
  label.innerHTML="Time Period";
  label.setAttribute("for", input.id);

  col.appendChild(input);
  labelCol.appendChild(label);

  formRow.appendChild(col);
  formRow.appendChild(labelCol);

}

function addSeriesInput(formRow, parent){

  var seriesCol = document.createElement("div");
  seriesCol.className="col";

  var series = document.createElement("select");
  series.id="series_type: "+parent.id;
  addSeriesOptions(series);

  seriesCol.appendChild(series);

  var labelCol = document.createElement('div')
  labelCol.className="col";

  var label = document.createElement("label");
  label.innerHTML="Series type";
  label.setAttribute("for", series.id);

  labelCol.appendChild(label);

  formRow.appendChild(seriesCol);
  formRow.appendChild(labelCol);

}

function addSeriesOptions(series){
  var closeOption = document.createElement("option");
  closeOption.text="close";
  closeOption.value="close";

  var openOption = document.createElement("option");
  openOption.text="open";
  openOption.value="open";

  var highOption = document.createElement("option");
  highOption.text="high";
  highOption.value="high";

  var lowOption = document.createElement("option");
  lowOption.text="low";
  lowOption.value="low";

  series.className="form-control";

  series.appendChild(closeOption)
  series.appendChild(openOption)
  series.appendChild(highOption)
  series.appendChild(lowOption)

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

// Get the ipcRenderer
const {ipcRenderer} = require('electron');

// Get the elements when the window loads
window.onload = function(){
  // Set the event listener for the button
  var button = document.getElementById('add-stock')
  button.addEventListener('click', addStock);
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
  var stockTicker = e.toElement.innerHTML;
}

ipcRenderer.on("add:stock", (e, item)=>addItem(e, item));

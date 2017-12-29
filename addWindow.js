const {ipcRenderer} = require('electron');

// Set an event listener when script loads
window.onload = function(){

  // Set the event listener for the submit button
  const form = document.querySelector('form');
  form.addEventListener('submit', submitForm);

}

// add the item
function submitForm(e){
  // Prevent it form sending to a file
  e.preventDefault();

  // Get the item and send it to the main processor
  const item = document.querySelector("#stock-symbol").value;
  ipcRenderer.send("add:stock", item)

}

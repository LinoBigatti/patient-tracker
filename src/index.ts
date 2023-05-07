import { createCheckupForm } from "./forms.js"
//
let loadDbButton = document.getElementById("loadDatabase")
if (loadDbButton) {
  loadDbButton.onclick = () => window.db.openFileDialog();
}

let createDbButton = document.getElementById("createDatabase")
if (createDbButton) {
  createDbButton.onclick = () => window.db.openDbCreationFileDialog();
}

let form = document.getElementById("form")
if (form) {
  window.db.setDbUpdatedCallback(() => createCheckupForm(form!))
  createCheckupForm(form)
}

import { createCheckupForm, createPatientsForm, updateForm, sendFormData, createDoctorsForm } from "./forms.js"

let loadDbButton = document.getElementById("loadDatabase")
if (loadDbButton) {
  loadDbButton.onclick = () => window.db.openFileDialog();
}

let createDbButton = document.getElementById("createDatabase")
if (createDbButton) {
  createDbButton.onclick = () => window.db.openDbCreationFileDialog();
}

let manageCheckupsButton = document.getElementById("manageCheckups")
let managePatientsButton = document.getElementById("managePatients")
let manageDoctorsButton  = document.getElementById("manageDoctors")

let form = document.getElementById("form") as HTMLFormElement
if (form) {
  window.db.setDbUpdatedCallback(() => updateForm(form))
  createCheckupForm(form)

  if (manageCheckupsButton) {
    manageCheckupsButton.onclick = () => createCheckupForm(form)
  }

  if (managePatientsButton) {
    managePatientsButton.onclick = () => createPatientsForm(form)
  }

  if (manageDoctorsButton) {
    manageDoctorsButton.onclick = () => createDoctorsForm(form)
  }

  form.onsubmit = (event) => { 
    sendFormData()

    event.preventDefault()
  }
}

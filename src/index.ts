import { createCheckupForm, createPatientsForm, updateForm, sendFormData, createDoctorsForm } from "./forms.js"
import { createDownloadsForm } from "./downloads.js";

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
let downloadsButton = document.getElementById("download")

let mainForm = document.getElementById("mainForm") as HTMLFormElement
let downloadsForm = document.getElementById("downloadsForm") as HTMLFormElement

let form = mainForm

if (form && downloadsForm) {
  window.db.setDbUpdatedCallback(() => {
    if (form == mainForm) {
      updateForm(form)
    } else {
      createDownloadsForm(form)
    }
  })

  createCheckupForm(mainForm)

  if (manageCheckupsButton) {
    manageCheckupsButton.onclick = () => {
      form = mainForm
      mainForm.style.display = "block"
      downloadsForm.style.display = "none"

      createCheckupForm(mainForm)
    }
  }

  if (managePatientsButton) {
    managePatientsButton.onclick = () => {
      form = mainForm
      mainForm.style.display = "block"
      downloadsForm.style.display = "none"

      createPatientsForm(mainForm)
    }
  }

  if (manageDoctorsButton) {
    manageDoctorsButton.onclick = () => {
      form = mainForm
      mainForm.style.display = "block"
      downloadsForm.style.display = "none"

      createDoctorsForm(form)
    }
  }

  if (downloadsButton) {
    downloadsButton.onclick = () => {
      form = downloadsForm
      mainForm.style.display = "none"
      downloadsForm.style.display = "block"

      createDownloadsForm(form)
    }
  }

  mainForm.onsubmit = (event) => { 
    sendFormData()

    event.preventDefault()
  }
}

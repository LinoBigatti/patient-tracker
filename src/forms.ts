enum InputType {
  Label,
  DropDown,
  Numeric,
  Float,
  NumericScale,
  Date,
  Line,
  Text,
  Boolean,
  Submit,
}

interface FormElement {
  id: string;
  name: string;
  type: InputType;
  options?: any;
}

interface Form {
  table: string,
  fields: FormElement[],
  extra_data_name?: string,
  extra_data_query?: string,
  extra_data_query_id?: string,
}

let checkupForm: Form = {
  table: "checkups",
  fields: [
    {id: "top_label", name: "Cargar consulta", type: InputType.Label},
    {id: "patient", name: "Nombre del paciente", type: InputType.DropDown, options: {query: `SELECT id, (name || " " || surname) AS value FROM Patients;`}},
    {id: "date", name: "Fecha de la consulta", type: InputType.Date},
    {id: "dosage", name: "Dosis", type: InputType.Numeric, options: {suffix: " gotas"}},
    {id: "freq", name: "Frequencia", type: InputType.Numeric, options: {suffix: " dosis por dia"}},
    {id: "pain", name: "Dolor", type: InputType.NumericScale},
    {id: "humor", name: "Humor", type: InputType.NumericScale},
    {id: "appetite", name: "Apetito", type: InputType.NumericScale},
    {id: "fatigue", name: "Fatiga", type: InputType.NumericScale},
    {id: "depression", name: "Depresion", type: InputType.NumericScale},
    {id: "anxiety", name: "Ansiedad", type: InputType.NumericScale},
    {id: "insomnia", name: "Dificultad para dormir", type: InputType.NumericScale},
    {id: "adverse_effects", name: "Efectos adversos", type: InputType.Text, options: {optional: true}},
    {id: "observations", name: "Observaciones", type: InputType.Text, options: {optional: true}},
    {id: "submit", name: "Cargar", type: InputType.Submit},
  ],
  extra_data_name: "checkup_n",
  extra_data_query: "count(checkup_n) + 1 FROM Checkups WHERE patient =",
  extra_data_query_id: "patient",
}

let patientsForm: Form = {
  table: "Patients",
  fields: [
    {id: "top_label", name: "Agregar paciente", type: InputType.Label},
    {id: "doctor", name: "Doctor", type: InputType.DropDown, options: {query: `SELECT id, (name || " " || surname) AS value FROM Doctors;`}},
    {id: "name", name: "Nombre(s)", type: InputType.Line},
    {id: "surname", name: "Apellido(s)", type: InputType.Line},
    {id: "dni", name: "DNI", type: InputType.Numeric},
    {id: "clinic_history", name: "Identificador de historia clinica", type: InputType.Numeric, options: {optional: true}},
    {id: "dead", name: "Fallecido", type: InputType.Boolean},
    {id: "gender", name: "Genero", type: InputType.DropDown, options: {query: "SELECT id, gender AS value FROM GenderOptions;"}},
    {id: "age", name: "Edad", type: InputType.Numeric, options: {suffix: " años"}},
    {id: "diagnostic", name: "Diagnostico", type: InputType.Text},
    {id: "diagnostic_classification", name: "Clasificacion del diagnostico", type: InputType.DropDown, options: {query: "SELECT id, classification AS value FROM ClassificationOptions;"}},
    {id: "base_treatment", name: "Tratamientos previos", type: InputType.Text, options: {optional: true}},
    {id: "concentration", name: "Concentracion", type: InputType.DropDown, options: {query: "SELECT id, concentration AS value FROM ConcentrationOptions;"}},
    {id: "weight", name: "Peso", type: InputType.Float, options: {suffix: "kg"}},
    {id: "height", name: "Altura", type: InputType.Numeric, options: {suffix: "cm"}},
    {id: "bmi", name: "BMI", type: InputType.Float},
    {id: "bilirrubin", name: "Bilirrubina", type: InputType.Line},
    {id: "max_blood_pressure", name: "Presion arterial sistolica", type: InputType.Numeric},
    {id: "min_blood_pressure", name: "Presion arterial diastolica", type: InputType.Numeric},
    {id: "creatinin", name: "Creatinina", type: InputType.Float, options: {step: 0.01}},
    {id: "tsh", name: "TSH/T4", type: InputType.Line},
    {id: "extra_studies", name: "Estudios complementarios", type: InputType.Text, options: {optional: true}},
    {id: "observations", name: "Observaciones", type: InputType.Text, options: {optional: true}},
    {id: "submit", name: "Añadir", type: InputType.Submit},
  ]
}

let doctorsForm: Form = {
  table: "Doctors",
  fields: [
    {id: "top_label", name: "Añadir doctor", type: InputType.Label},
    {id: "name", name: "Nombre(s)", type: InputType.Line},
    {id: "surname", name: "Apellido(s)", type: InputType.Line},
    {id: "submit", name: "Añadir", type: InputType.Submit},
  ]
} 

let current_form: Form 

async function createForm(element: HTMLElement, form: FormElement[]) {
  element.innerHTML = ""

  let loaded = await window.db.getDbStatus()
  if (!loaded) {
    element.innerHTML = "Por favor cargue o cree una base de datos en herramientas."
    
    return
  }
  
  let innerHTML = ""
  for (const input of form) {
    let required = "required" 
    
    if (input.options?.optional) {
      required = ""
    } 

    if (input.type == InputType.Label) {
      innerHTML += input.name + "<br>\n"
    }

    if (input.type == InputType.DropDown) {
      if (!input.options || !input.options.query) {
        console.log("Invalid form input: Missing query")
        console.log(input)

        return
      }

      let entries = await window.db.query(input.options.query)
      innerHTML += `<label for=${input.id}>${input.name}</label>\n`
      innerHTML += `<select ${required} id=${input.id} name=${input.id}>\n`

      for (const entry of entries) {
        innerHTML += `<option value=${entry.id}>${entry.value}</option>\n`
      }

      innerHTML += "</select><br>\n"
    }

    if (input.type == InputType.Numeric) {
      let min = ""
      let max = ""

      if (input.options) {
        if (input.options.min) min = `min="${input.options.min}"`
        if (input.options.min) max = `max="${input.options.max}"`
      }
      
      innerHTML += `<label for="${input.id}">${input.name}: </label>\n`
      innerHTML += `<input ${required} type="number" id="${input.id}" name="${input.id}" ${min} ${max}>\n`

      innerHTML += "<br>\n"
    }

    if (input.type == InputType.Float) {
      let min = ""
      let max = ""
      let step = `step="0.1"`

      if (input.options) {
        if (input.options.min) min = `min="${input.options.min}"`
        if (input.options.min) max = `max="${input.options.max}"`
        if (input.options.step) step = `step="${input.options.step}"`
      }
      
      innerHTML += `<label for="${input.id}">${input.name}: </label>\n`
      innerHTML += `<input ${required} type="number" id="${input.id}" name="${input.id}" ${min} ${max} ${step}>\n`

      innerHTML += "<br>\n"
    }

    if (input.type == InputType.NumericScale) {
      let min = 1
      let max = 10

      if (input.options) {
        if (input.options.min) min = input.options.min
        if (input.options.max) max = input.options.max
      }
      
      innerHTML += input.name + ":<br>\n"

      // Ugly ass hack for the lack of range()
      for (var i of [...Array(max).keys()].map(i => i + min)) {
        innerHTML += `<input ${required} type="radio" id="${input.id}_${i}" name="${input.id}" value="${i}"><label for="${input.id}_${i}">${i}</label>\n`
      }

      innerHTML += "<br>\n"
    }

    if (input.type == InputType.Line) {
      innerHTML += `<label for="${input.id}">${input.name}: </label>\n`
      innerHTML += `<input ${required} type="text" id="${input.id}" name="${input.id}">\n`

      innerHTML += "<br>\n"
    }

    if (input.type == InputType.Text) {
      let optional_text = " (Opcional)"
      if (required) {
        optional_text = ""
      }

      innerHTML += `<textarea id="${input.id}" name="${input.id}" rows="5" cols="50" placeholder="${input.name}${optional_text}"></textarea>`
      innerHTML += "<br>\n"
    }

    if (input.type == InputType.Date) {
      let today = new Date().toISOString().slice(0, 10)
      
      innerHTML += `<label for="${input.id}">${input.name}: </label>\n`
      innerHTML += `<input type="date" id="${input.id}" name="${input.id}" value="${today}">\n`

      innerHTML += "<br>\n"
    }

    if (input.type == InputType.Boolean) {
      innerHTML += `<label for="${input.id}">${input.name}: </label>\n`
      innerHTML += `<input type="checkbox" id="${input.id}" name="${input.id}">\n`

      innerHTML += "<br>\n"
    }

    if (input.type == InputType.Submit) {
      innerHTML += `<input ${required} type="submit" id="${input.id}" value="${input.name}">`
    }
  }

  element.innerHTML = innerHTML
}

export function createCheckupForm(element: HTMLElement) {
  current_form = checkupForm 

  updateForm(element)
}

export function createPatientsForm(element: HTMLElement) {
  current_form = patientsForm 

  updateForm(element)
}

export function createDoctorsForm(element: HTMLElement) {
  current_form = doctorsForm

  updateForm(element)
}

export function updateForm(element: HTMLElement) {
  createForm(element, current_form.fields)
}

export function sendFormData() {
  let cols_raw = ""
  let vals_raw = ""

  let extra_data_query_id: string | undefined

  for (var field of current_form.fields) {
    let element: HTMLInputElement | undefined
    let value: string | null

    element = document.getElementById(field.id) as HTMLInputElement

    if (field.type == InputType.NumericScale) {
      element = document.querySelector(`input[name=${field.id}]:checked`) as HTMLInputElement
    }

    if (field.type == InputType.Submit || field.type == InputType.Label) {
      continue
    }
    
    if (element) {
      value = element.value

      if (field.type == InputType.Boolean) {
        if (element.checked) {
          value = "TRUE"
        } else {
          value = "FALSE"
        }
      }
    } else {
      value = null
    }

    cols_raw = `${cols_raw}, ${field.id}`

    // Add "" around strings
    if (Number.isNaN(Number(value)) || value == "") {
      vals_raw = `${vals_raw}, "${value}"`
    } else {
      vals_raw = `${vals_raw}, ${value}`
    }

    if (current_form.extra_data_query_id == field.id && value != null) {
      extra_data_query_id = value
    }
  }

  if (current_form.extra_data_name) {
    cols_raw = `${cols_raw}, ${current_form.extra_data_name}`
  }

  if (current_form.extra_data_query) {
    vals_raw = `${vals_raw}, ${current_form.extra_data_query}`

    if (extra_data_query_id) {
      vals_raw = `${vals_raw} ${extra_data_query_id}`
    }
  }
  
  let cols = cols_raw.substring(2)
  let vals = vals_raw.substring(2)

  let statement = `INSERT INTO ${current_form.table} (${cols}) SELECT ${vals};`
  
  window.db.insert(statement)
}

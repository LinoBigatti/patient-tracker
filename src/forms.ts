enum InputType {
  Label,
  DropDown,
  NumericScale,
  Submit,
}

interface FormElement {
  id: string;
  name: string;
  type: InputType;
  options?: any;
}

interface QueryResult {
  id: number,
  name: string,
}

let checkupForm = [
  {id: "top_label", name: "Cargar Consulta", type: InputType.Label},
  {id: "name", name: "Nombre del Paciente", type: InputType.DropDown, options: {query: "SELECT id, name FROM Patients;"}},
  {id: "pain", name: "Dolor", type: InputType.NumericScale},
  {id: "insomnia", name: "Insomnio", type: InputType.NumericScale},
  {id: "depression", name: "Depresion", type: InputType.NumericScale},
  {id: "submit", name: "Cargar", type: InputType.Submit},
]

async function createForm(element: HTMLElement, form: FormElement[]) {
  element.innerHTML = ""

  let loaded = await window.db.getDbStatus()
  if (!loaded) {
    element.innerHTML = "Por favor cargue o cree una base de datos en herramientas."
    
    return
  }
  
  let innerHTML = ""
  for (const input of form) {
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
      innerHTML += `<select name=${input.id} id=${input.id}>\n`

      console.log(entries)
      for (const entry of entries) {
        innerHTML += `<option value=${entry.id}>${entry.name}</option>\n`
      }

      innerHTML += "</select><br>\n"
    }

    if (input.type == InputType.NumericScale) {
      let min = 1
      let max = 5

      if (input.options) {
        if (input.options.min) min = input.options.min
        if (input.options.max) max = input.options.max
      }
      
      innerHTML += input.name + ":<br>\n"

      // Ugly ass hack for the lack of range()
      for (var i of [...Array(max).keys()].map(i => i + min)) {
        innerHTML += `<input type="radio" id="${input.id}_${i}" name="${input.id}"><label for="${input.id}_${i}">${i}</label>`
      }

      innerHTML += "<br>"
    }

    if (input.type == InputType.Submit) {
      innerHTML += `<input type="submit" id="${input.id}" value="${input.name}">`
    }
  }

  console.log(innerHTML)
  element.innerHTML = innerHTML
}

export function createCheckupForm(element: HTMLElement) {
  createForm(element, checkupForm)
}

      //<label for="patient_name">Nombre del paciente:</label>
      //<input type="text" id="patient_name" name="patient_name"><br>
      
      //Escala de dolor:
      //<br>
      //<input type="radio" id="one" name="pain_scale"><label for="one">1</label>
      //<input type="radio" id="two" name="pain_scale"><label for="one">2</label>
      //<input type="radio" id="three" name="pain_scale"><label for="one">3</label>
      //<input type="radio" id="four" name="pain_scale"><label for="one">4</label>
      //<input type="radio" id="five" name="pain_scale"><label for="one">5</label>

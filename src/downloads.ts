import noUiSlider from "nouislider"

const getCheckupDataSQL = `
SELECT
  /* Checkup info */
  Checkups.patient AS id_paciente,
  Checkups.checkup_n AS consulta,
  Checkups.date AS fecha,

  /* Patient info */
  (Patients.surname || ' ' || Patients.name) AS paciente,
  (Doctors.surname || ' ' || Doctors.name) AS doctor,
  Patients.dni AS DNI,
  Patients.clinic_history AS historia_clinica,
  GenderOptions.gender AS genero,
  Patients.age AS edad,

  /* Diagnostics */
  Patients.dead AS fallecido,
  Patients.diagnostic AS diagnostico,
  ClassificationOptions.classification AS clasificacion,
  Patients.weight AS peso,
  Patients.height AS altura,
  Patients.bmi AS BMI,
  Patients.bilirrubin AS bilirrubina,
  (Patients.max_blood_pressure || '/' || Patients.min_blood_pressure) AS presion,
  Patients.creatinin AS creatinina,
  Patients.tsh AS TSH_T4,
  Patients.extra_studies AS estudios_complementarios,
  Patients.observations AS observaciones_paciente,

  /* Treatment info */
  ConcentrationOptions.concentration AS tipo_de_preparado,
  Checkups.dosage AS dosis,
  Checkups.freq AS posologia,

  /* Checkup data */
  Checkups.pain AS dolor,
  Checkups.humor AS humor,
  Checkups.appetite AS apetito,
  Checkups.fatigue AS fatiga,
  Checkups.depression AS depresion,
  Checkups.anxiety AS ansiedad,
  Checkups.insomnia AS insomnio,
  Checkups.adverse_effects AS efectos_adversos,
  Checkups.observations AS observaciones_consulta
FROM
  Checkups
INNER JOIN
  Patients
ON
  Checkups.patient = Patients.id
    AND
  Checkups.patient 
    IN (
      SELECT 
        Checkups.patient
      FROM 
        Checkups
      GROUP BY
        Checkups.patient
      HAVING
        count(Checkups.patient) >= {min}
    )
LEFT JOIN
  Doctors
ON
  Patients.doctor = Doctors.id
LEFT JOIN
  GenderOptions
ON
  Patients.gender = GenderOptions.id
LEFT JOIN
  ClassificationOptions
ON
  Patients.diagnostic_classification = ClassificationOptions.id
LEFT JOIN
  ConcentrationOptions
ON
  Patients.concentration = ConcentrationOptions.id
WHERE
  Checkups.checkup_n <= {max}
ORDER BY
  Checkups.patient
;
`

const getLostPatientsCheckupDataSql = `
SELECT
  /* Checkup info */
  Checkups.patient AS id_paciente,
  Checkups.checkup_n AS consulta,
  Checkups.date AS fecha,

  /* Patient info */
  (Patients.surname || ' ' || Patients.name) AS paciente,
  (Doctors.surname || ' ' || Doctors.name) AS doctor,
  Patients.dni AS DNI,
  Patients.clinic_history AS historia_clinica,
  GenderOptions.gender AS genero,
  Patients.age AS edad,

  /* Diagnostics */
  Patients.dead AS fallecido,
  Patients.diagnostic AS diagnostico,
  ClassificationOptions.classification AS clasificacion,
  Patients.weight AS peso,
  Patients.height AS altura,
  Patients.bmi AS BMI,
  Patients.bilirrubin AS bilirrubina,
  (Patients.max_blood_pressure || '/' || Patients.min_blood_pressure) AS presion,
  Patients.creatinin AS creatinina,
  Patients.tsh AS TSH_T4,
  Patients.extra_studies AS estudios_complementarios,
  Patients.observations AS observaciones_paciente,

  /* Treatment info */
  ConcentrationOptions.concentration AS tipo_de_preparado,
  Checkups.dosage AS dosis,
  Checkups.freq AS posologia,

  /* Checkup data */
  Checkups.pain AS dolor,
  Checkups.humor AS humor,
  Checkups.appetite AS apetito,
  Checkups.fatigue AS fatiga,
  Checkups.depression AS depresion,
  Checkups.anxiety AS ansiedad,
  Checkups.insomnia AS insomnio,
  Checkups.adverse_effects AS efectos_adversos,
  Checkups.observations AS observaciones_consulta
FROM
  Checkups
INNER JOIN
  Patients
ON
  Checkups.patient = Patients.id
    AND
  Checkups.patient 
    IN (
      SELECT 
        Checkups.patient
      FROM 
        Checkups
      GROUP BY
        Checkups.patient
      HAVING
        count(Checkups.patient) >= 0
      AND
        count(Checkups.patient) <= {max}
    )
LEFT JOIN
  Doctors
ON
  Patients.doctor = Doctors.id
LEFT JOIN
  GenderOptions
ON
  Patients.gender = GenderOptions.id
LEFT JOIN
  ClassificationOptions
ON
  Patients.diagnostic_classification = ClassificationOptions.id
LEFT JOIN
  ConcentrationOptions
ON
  Patients.concentration = ConcentrationOptions.id
ORDER BY
  Checkups.patient
;
`

const getMaxCheckupsSQL = `
SELECT
  max(cnt) AS max
FROM (
  SELECT
    count(Checkups.patient) AS cnt
  FROM
    Checkups
  GROUP BY
    Checkups.patient
);
`

const slim_flex_class = "flex items-center center"
const flex_class = slim_flex_class + " mb-6"

const common_label_class = "block text-gray-500 font-bold"
const center_label_class = common_label_class + " text-center"

const button_class = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"

export async function createDownloadsForm(element: HTMLElement) {
  element.innerHTML = ""

  let loaded = await window.db.getDbStatus()
  if (!loaded) {
    element.innerHTML = "Por favor cargue o cree una base de datos."
    
    return
  }

  let innerHTML = `<div class="${slim_flex_class}">\n`
  innerHTML += `<label class="w-full ${center_label_class}">Descargar datos</label>\n`
  innerHTML += "</div>\n"
  innerHTML += "<br>\n"

  let maxCheckups = await window.db.query(getMaxCheckupsSQL)
  if (maxCheckups) {
    maxCheckups = maxCheckups[0]["max"]
  } else {
    maxCheckups = 0
  }
  
  innerHTML += `<div class="${slim_flex_class}">\n`
  innerHTML += `<label class="w-full ${center_label_class}">Numero de consultas:</label>\n`
  innerHTML += "</div>\n"
  innerHTML += `<div id="casesFilterSlider" class="m-6"></div><br><br>\n`

  innerHTML += `<div class="${slim_flex_class}">\n`
  innerHTML += `<label class="w-full ${center_label_class}">Maximo de consultas para los casos perdidos:</label>\n`
  innerHTML += "</div>\n"
  innerHTML += `<div id="lostCasesFilterSlider" class="m-6"></div><br><br>\n`

  innerHTML += `<div class="h-20 ${flex_class}">\n`
  innerHTML += `<button class="w-1/2 h-full mr-1.5 ${button_class}" id="normalDownloadButton">Descargar datos</button>`
  innerHTML += `<button class="w-1/2 h-full ml-1.5 ${button_class}" id="lostCasesDownloadButton">Descargar datos de casos perdidos</button>`

  element.innerHTML = innerHTML

  // Add double slider
  let casesFilterSlider = document.getElementById("casesFilterSlider")

  if (casesFilterSlider) {
    noUiSlider.create(casesFilterSlider, {
      start: [Math.min(2, maxCheckups), maxCheckups],
      connect: true,
      step: 1,
      range: {
        min: 0,
        max: maxCheckups,
      },
      pips: {
        // @ts-ignore *
        mode: "steps",
      },
    })
  }
  
  // Add single slider
  let lostCasesFilterSlider = document.getElementById("lostCasesFilterSlider")

  if (lostCasesFilterSlider) {
    noUiSlider.create(lostCasesFilterSlider, {
      start: [Math.min(2, maxCheckups)],
      connect: "lower",
      step: 1,
      range: {
        min: 0,
        max: maxCheckups,
      },
      pips: {
        // @ts-ignore *
        mode: "steps",
      },
    })
  }

  let normalDownloadButton = document.getElementById("normalDownloadButton")
  let lostCasesDownloadButton = document.getElementById("lostCasesDownloadButton")
  
  if (normalDownloadButton) {
    normalDownloadButton.onclick = async () => {
      if (casesFilterSlider) {
        let sql = getCheckupDataSQL
          // @ts-ignore 2339
          .replaceAll("{min}", Number(casesFilterSlider.noUiSlider.get()[0]))
          // @ts-ignore 2339
          .replaceAll("{max}", Number(casesFilterSlider.noUiSlider.get()[1]))
        
        let data = await window.db.query(sql)

        let csv = ""
        if (data && data.length != 0) {
          let keys = Object.keys(data[0])

          csv += keys.map((key) => `"${key}"`).join(";")
          csv += "\n"

          for (const record of data) {
            csv += Object.values(record).map((value) => `"${value}"`).join(";")
            csv += "\n"
          }
        }
        
        window.exporter.exportCSV(csv)
      }
    }
  }

  if (lostCasesDownloadButton) {
    lostCasesDownloadButton.onclick = async () => {
      if (lostCasesFilterSlider) {
        let sql = getLostPatientsCheckupDataSql 
          // @ts-ignore 2339
          .replaceAll("{max}", Number((lostCasesFilterSlider as any).noUiSlider.get()[0]))
        console.log(Number((lostCasesFilterSlider as any).noUiSlider.get()[0]))
        
        let data = await window.db.query(sql)

        let csv = ""
        if (data && data.length != 0) {
          let keys = Object.keys(data[0])

          csv += keys.map((key) => `"${key}"`).join(";")
          csv += "\n"

          for (const record of data) {
            csv += Object.values(record).map((value) => `"${value}"`).join(";")
            csv += "\n"
          }
        }
        
        window.exporter.exportCSV(csv)
      }
    }
  }
}

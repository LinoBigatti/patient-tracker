import noUiSlider from "nouislider"

const getCheckupDataSQL = `
SELECT
  /* Checkup info */
  Checkups.patient AS id_paciente,
  Checkups.checkup_n AS consulta,
  Checkups.date AS fecha,

  /* Patient info */
  (Patients.name || " " || Patients.surname) AS paciente,
  (Doctors.name || " " || Doctors.surname) AS doctor,
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
  (Patients.max_blood_pressure || "/" || Patients.min_blood_pressure) AS presion,
  Patients.creatinin AS creatinina,
  Patients.tsh AS TSH_T4,
  Patients.extra_studies AS estudios_complementarios,
  Patients.observations AS observaciones_paciente,

  /* Treatment info */
  ConcentrationOptions.concentration AS tipo_de_preparado,
  Checkups.dosage AS dosis,
  Checkups.freq AS pozologia,

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
INNER JOIN
  Doctors
ON
  Patients.doctor = Doctors.id
INNER JOIN
  GenderOptions
ON
  Patients.gender = GenderOptions.id
INNER JOIN
  ClassificationOptions
ON
  Patients.diagnostic_classification = ClassificationOptions.id
INNER JOIN
  ConcentrationOptions
ON
  Patients.concentration = ConcentrationOptions.id
WHERE
  Checkups.checkup_n <= {max}
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

export async function createDownloadsForm(element: HTMLElement) {
  element.innerHTML = ""

  let loaded = await window.db.getDbStatus()
  if (!loaded) {
    element.innerHTML = "Por favor cargue o cree una base de datos en herramientas."
    
    return
  }

  let innerHTML = "Descargar datos: <br>\n"

  let maxCheckups = await window.db.query(getMaxCheckupsSQL)
  if (maxCheckups) {
    maxCheckups = maxCheckups[0]["max"]
  } else {
    maxCheckups = 0
  }
  
  innerHTML += "Numero de consultas: <br>\n"
  innerHTML += `<div id="casesFilterSlider" class="m-6"></div><br>\n`

  innerHTML += "Maximo de consultas para los casos perdidos: <br>\n"
  innerHTML += `<div id="lostCasesFilterSlider" class="m-6"></div><br>\n`

  innerHTML += `<button id="normalDownloadButton">Descargar datos</button>`
  innerHTML += `<button id="lostCasesDownloadButton">Descargar datos de casos perdidos</button>`

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
      if (lostCasesFilterSlider) {
        let sql = getCheckupDataSQL
          // @ts-ignore 2339
          .replaceAll("{min}", Number(casesFilterSlider.noUiSlider.get()[0]))
          // @ts-ignore 2339
          .replaceAll("{max}", Number(casesFilterSlider.noUiSlider.get()[1]))
        
        let data = await window.db.query(sql)

        console.log(data)

        let csv = ""
        if (data) {
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
    lostCasesDownloadButton.onclick = () => {
      console.log("Lost")
    }
  }
}

import { ipcRenderer } from "electron"

export const exporter = {
  exportCSV: (csv: string) => {
    ipcRenderer.invoke("export-csv", csv)
  },
}

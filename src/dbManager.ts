import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("db", {
  openFileDialog: () => {
    ipcRenderer.invoke("open-db-file-dialog")
  },

  openDbCreationFileDialog: () => {
    ipcRenderer.invoke("open-db-creation-file-dialog")
  },

  getDbStatus: async () => {
    return await ipcRenderer.invoke("get-db-status")
  },

  setDbUpdatedCallback: (callback: () => void) => {
    ipcRenderer.on("db-updated", callback)
  },

  query: async (sql: string) => {
    return await ipcRenderer.invoke("query", sql)
  },
})

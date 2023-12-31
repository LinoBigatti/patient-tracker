import { app, BrowserWindow, ipcMain, dialog } from "electron"

import * as path from "path"
import * as fs from "fs"

import sqlite3 from "sqlite3"
import * as sqlite from "sqlite"
import { Database } from "sqlite"

import { content as dbCreationSql } from "./createDb"

let db: Database | undefined

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preloads.js"),
      sandbox: false,
    },
  })

  win.loadFile("build/index.html")

  return win
}

// Force spanish locale
app.commandLine.appendSwitch("lang", "ES")

app.whenReady().then(() => {
  const win = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  
  win.webContents.executeJavaScript("localStorage.getItem('dbPath')").then((path) => {
    if (path) {
      openDb(path).then(() => {
        if (db) {
          // Do validation and shit maybe
          db!.all('SELECT * FROM Patients').then((_rows) => console.log("Opened DB succesfully"))
          
          win.webContents.send("db-updated")
        }
      })
    } else {
      // Popup
    }
  })
  
  ipcMain.handle("open-db-file-dialog", () => {
    openDbFileDialog(win)

    win.webContents.send("db-updated")
  })

  ipcMain.handle("open-db-creation-file-dialog", () => {
    openDbCreationFileDialog(win)

    win.webContents.send("db-updated")
  })

  ipcMain.handle("get-db-status", () => {
    if (db) { return true }
    
    return false
  })

  ipcMain.handle("query", async (_, sql) => {
    if (!db) { return [] }
    
    return await db.all(sql)
  })

  ipcMain.handle("insert", async (_, sql) => {
    if (!db) { return }

    await db.exec(sql)
    win.webContents.send("db-updated")
  })

  ipcMain.handle("export-csv", (_, csv) => {
    saveCSV(win, csv)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (db) {
      db.close()
    }
    app.quit()
  }
})


async function openDb(path: string, create: boolean = false) {
  let mode = sqlite3.OPEN_READWRITE
  if (create) {
    mode |= sqlite3.OPEN_CREATE
  }

  let _db = await sqlite.open({
    filename: path,
    driver: sqlite3.Database,
    mode: mode,
  }).catch((reason) => { console.log("DB open error:"); console.log(reason) })

  if (_db) {
    db = _db
  }
}

function createDb(path: string) {
  openDb(path, true).then(() => {
    if (db) {
      db.exec(dbCreationSql).then(() => {
        db!.all("SELECT * FROM Patients").then((rows) => console.log(rows))
      })
    }
  })
}

function openDbFileDialog(win: BrowserWindow) {
  let path = dialog.showOpenDialogSync(win, {
    properties: ["openFile"],
    filters: [
      { "name": "Database Files", "extensions": ["db"] },
      { "name": "All Files", "extensions": ["*"] },
    ],
  })
  
  if (path) {
    openDb(path[0])
    win.webContents.executeJavaScript(`localStorage.setItem('dbPath', '${path}')`)
  }
}

function openDbCreationFileDialog(win: BrowserWindow) {
  let path = dialog.showSaveDialogSync(win, {
    title: "Create Database File",
    defaultPath: "patients.db",
    buttonLabel: "Create",
    filters: [
      { "name": "Database Files", "extensions": ["db"] },
      { "name": "All Files", "extensions": ["*"] },
    ],
  })
  
  if (path) {
    createDb(path)
    win.webContents.executeJavaScript(`localStorage.setItem('dbPath', '${path}')`)
  }
}

function saveCSV(win: BrowserWindow, csv: string) {
  let path = dialog.showSaveDialogSync(win, {
    title: "Export as CSV",
    defaultPath: "datos.csv",
    buttonLabel: "Save",
    filters: [
      { "name": "CSV Files", "extensions": ["csv"] },
      { "name": "All Files", "extensions": ["*"] },
    ],
  })
  
  if (path) {
    fs.writeFileSync(path, csv)
  }
}

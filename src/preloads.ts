import { contextBridge } from "electron"

import { db } from "./dbManager"
import { exporter } from "./exporter"

contextBridge.exposeInMainWorld("db", db)
contextBridge.exposeInMainWorld("exporter", exporter)

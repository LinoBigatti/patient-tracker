export interface dbManager {
  openFileDialog: () => void,
  openDbCreationFileDialog: () => void,
  getDbStatus: () => Promise<boolean>,
  setDbUpdatedCallback: (callback: () => void) => void,
  query: (sql: string) => Array,
  insert: (sql: string) => void,
}

declare global {
  interface Window {
    db: dbManager
  }
}

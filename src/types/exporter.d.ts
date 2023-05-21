export interface Exporter {
  exportCSV: (csv: string) => void,
}

declare global {
  interface Window {
    exporter: Exporter 
  }
}

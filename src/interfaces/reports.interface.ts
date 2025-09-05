export interface Report {
  ID: number;
  account_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  sales_unit_id: number;
  sales_unit: string;
  client_id: number;
  client: string;
  activity: string;
  editor_id: number;
  editor: string;
  editor_code: string;
  file: string;
  file_id: number;
  date_submitted: string;
  status: string;
}

export interface ClientReport {
  ID: number;
  activity: string;
  account_name: string;
  account_code: string;
  file_id: number;
  file: string;
  date_submitted: string;
  date_modified: string;
}
export interface ReportSummary {
  unit_name: string;
  month: string;
  reports: number;
}
export interface WeeklyReportSummary {
  report_id: number;
  ae: string;
  sales_unit: string;
  client: string;
  report: string;
  status: string;
  date: string;
}
export interface WeekData {
  activity: string;
  reportID: number;
  editorID: number;
  editor: string;
  editorCode: string;
  fileID: number;
  file: string | null;
}
export interface ReportTable {
  [key: string]: string | number | WeekData;
  client: string;
  client_id: number;
}

export interface ReportsContext {
  year: number;
  setYear: (year: number) => void;
}

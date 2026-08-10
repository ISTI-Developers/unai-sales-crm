export interface OldReport {
  ID: number;
  account_id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  sales_unit_id: number;
  sales_unit: string;
  client_id: number;
  client: string;
  brand: string;
  activity: string;
  editor_id: number;
  editor: string;
  editor_code: string;
  file: string;
  file_id: number;
  date_submitted: string;
  status: string;
}

export interface AccountExecutive {
  account_id: number;
  ae: string;
  image: string;
  code: string;
  su: string;
}
export interface Activity {
  ID: number;
  activity: string;
  tags?: ReportTags[];
  user_id: number;
  sales_unit_id: number;
  client_id: number;
  date_submitted: Date;
  date_modified: Date;
  status: number;
  file?: string;
  file_id?: number;
  ae: string;
  ae_code: string;
  image: string | null;
  sales_unit: string;
  yearweek: number;
}
export interface Report {
  ID: number;
  client: string;
  brand: string;
  status: string;
  account_executives: AccountExecutive[];
  reports: Record<number, Activity[]>;
}

export interface ReportPreview extends Report {
  activity: Activity[];
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
  code: string;
  image: string;
  sales_unit: string;
  tags: string[];
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
export interface OldReportTable {
  [key: string]: string | number | WeekData;
  client: string;
  client_id: number;
  brand: string;
  status: string;
}

export interface ReportsContext {
  year: number;
  setYear: (year: number) => void;
}

export type WeekColumns = Record<number, Activity[] | "">;

export type ReportTable = Report & WeekColumns;

export const reportTags = [
  "CLIENT VISIT",
  "MEET UP",
  "EMAIL",
  "CALL",
  "VIDEO CALL",
  "VIBER",
  "CHAT",
  "TEXT",
  "FOLLOW UP",
  "UPDATE",
  "PROPOSAL",
  "INITIAL TRANSACTION",
  "BREAKFAST",
  "LUNCH",
  "DINNER",
] as const;
export type ReportTags = (typeof reportTags)[number];

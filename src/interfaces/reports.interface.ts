import { DefaultResponse, ErrorResponse } from ".";

export interface Report {
  ID: number;
  account_id: number;
  user: string;
  sales_unit_id: number;
  sales_unit: string;
  client_id: number;
  client: string;
  activity: string;
  date_submitted: string;
  status: string;
}

export interface ReportTable {
  [key: string]: string | number;
  client: string;
  client_id: number;
}

export interface ReportsContext {
  reports: Report[] | null;
  insertReport: (
    client_id: number,
    sales_unit_id: number,
    user_id: number,
    date: string,
    report: string,
  ) => Promise<DefaultResponse | string | ErrorResponse | undefined>;
}

export interface Contract {
  contract_no: string;
  client: string;
  company: string;
  contract_term: string;
  date_from: string;
  date_to: string;
  contract_status: "Approved" | "Pending" | "For Approval";
  grand_total: string;
  company_id: number;
  items?: Contract[];
}

export interface Contracts {
  contracts: Contract[] | null;
}

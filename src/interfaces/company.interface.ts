import { DefaultResponse } from ".";
import { SalesUnitMember, SalesUnit } from "./user.interface";

export interface Company {
  ID: number;
  code: string;
  name: string;
}
export interface CompanySalesGroup {
  company_id: number;
  company_code: string;
  company_name: string;
  sales_unit_id: number | null;
  sales_unit_name: string;
  sales_unit_head: SalesUnitMember | null;
  user_id: number | null;
  full_name: string | null;
  sales_unit_members: SalesUnitMember[];
}

export interface CompanyTypes {
  companies: Company[] | null;
  salesGroupCompanies: CompanySalesGroup[] | null;
  getCompanies: () => Promise<void>;
  getSalesGroupOfCompanies: () => Promise<void>;
  insertCompany: (newCompany: newCompanyProps) => Promise<DefaultResponse>;
  updateCompany: (
    id: number | string,
    newCompany: newCompanyProps
  ) => Promise<DefaultResponse>;
}

export interface newCompanyProps {
  code: string;
  name: string;
  sales_units: SalesUnit[];
}

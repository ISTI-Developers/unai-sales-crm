import { DefaultResponse } from ".";
import { Company } from "./company.interface";

export interface Medium {
  ID: number;
  name: string;
}

export interface MediumWithIDs {
  cm_id: number;
  client_id: number;
  medium_id: number;
  name: string;
}

export interface MediumCompany {
  [key: string]: string | undefined;
  name: string;
  company: string | undefined;
}
export interface MediumWithCompanies extends Medium {
  company_medium_id: number | string;
  companies: Company[];
}

interface OldNew {
  old: string;
  new: string;
}
interface CompanyCode {
  id: string | number;
  code: string;
}
export interface MediumWithUpdate {
  ID: number;
  name: OldNew;
  company_medium_id: number;
  companies: CompanyCode[][];
}

export interface MediumContext {
  mediums: Medium[] | null;
  mediumsOfCompanies: MediumWithCompanies[] | null;
  insertMediums: (data: MediumCompany[]) => Promise<DefaultResponse>;
  updateMedium: (data: MediumWithUpdate) => Promise<DefaultResponse>;
  getMediumsOfCompany: (id: string | number) => Promise<Medium[]>;
  deleteMedium: (id: string | number) => Promise<DefaultResponse>;
  setReload: React.Dispatch<React.SetStateAction<number>>;
}

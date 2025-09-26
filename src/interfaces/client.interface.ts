import { DefaultResponse, List, Access } from ".";

export interface ClientTypes {
  data: Client[] | null;
  options: ClientOptions[] | null;
  access: Access;
  clientOptions: ClientOptions[][];
  setReload: React.Dispatch<React.SetStateAction<number>>;
  getClients: (id: number | null) => Promise<ClientType | false>;
  getClientsByUser: (id: number) => Promise<UserClients[] | false>;
  getClientOptions: () => Promise<ClientOptions[] | false>;
  insertClient: (data: ClientForm) => Promise<DefaultResponse | false>;
  updateClient: (
    data: ClientForm,
    ID: string
  ) => Promise<DefaultResponse | false>;
  updateClientStatus: (
    status: List,
    ID: string
  ) => Promise<DefaultResponse | false>;
  insertBatchClients: (
    data: ClientUpload[]
  ) => Promise<DefaultResponse | false>;
  deleteClient: (ID: number) => Promise<DefaultResponse | undefined>;
}
export type ClientType = Client[] | ClientWithContact | ClientWithContact[];

export interface ClientMedium {
  cm_id: number;
  client_id: number;
  medium_id: number;
  name: string;
}

export interface Medium {
  ID: number;
  code: string | null;
  name: string;
}
export interface ClientInformation {
  client_id: number;
  name: string;
  industry: number;
  brand: string;
  company_id: number;
  company: string;
  sales_unit_id: number;
  sales_unit: string;
  client_account_id: number;
  contact_id: number;
  contact_person: string;
  designation: string;
  contact_number: string;
  email_address: string;
  address: string;
  type: number;
  source: number;
  status: number;
  created_at: string;
  industry_name: string;
  type_name: string;
  source_name: string;
  status_name: string;
  mediums: ClientMedium[];
  account_executives: Account[];
}

export interface Client {
  client_id: number;
  name: string;
  industry: number | null;
  industry_name: string | null;
  brand: string | null;
  company_id: number;
  company: string;
  sales_unit_id: number;
  sales_unit: string;
  account_id: number;
  account_executive: string;
  account_code: string;
  account_su_id: number;
  account_su: string;
  status: number;
  status_name: string;
  mediums: ClientMedium[];
  created_at: string;
}

export type Account = {
  account_id: number;
  account_executive: string;
  alias: string;
  sales_unit_id: number;
  sales_unit: string;
};
export type ClientTable = Omit<Client, "account_id" | "account_executive"> & {
  account_executives: Account[];
  children?: ClientTable[];
};
export interface ClientWithContact extends Client {
  [x: string]: string | number | null | ClientMedium[];
  contact_id: number;
  contact_person: string | null;
  designation: string | null;
  contact_number: string | null;
  email_address: string | null;
  address: string | null;
  type: number;
  source: number;
  type_name: string;
  source_name: string;
}

export interface ClientForm {
  name: string;
  industry: number | string;
  brand: string;
  company: number | string;
  sales_unit: number | string;
  account_executive: List[] | Account[];
  status: number | string;
  mediums: List[] | string[];
  contact_person: string;
  designation: string;
  contact_number: string;
  email_address: string;
  address: string;
  type: number | string;
  source: number | string;
}
export interface ClientUpload {
  client: string;
  brand: string;
  industry: number | string;
  account_executive: number | string;
  company: number | string;
  sales_unit: number | string;
  status: number | string;
  source: number | string;
  mediums: string;
  type: number | string;
  contact_person: string;
  designation: string;
  contact_number: string;
  email_address: string;
  address: string;
}

export interface ClientOptions {
  [key: string]: string | number;
  misc_id: number;
  name: string;
  category: "status" | "type" | "industry" | "source" | "ALL";
  status: number;
}

export interface UserClients {
  client_id: number;
  name: string;
  status: string;
  has_report: string;
}

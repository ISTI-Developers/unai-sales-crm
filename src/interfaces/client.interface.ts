import { DefaultResponse } from ".";

import { List } from ".";

export interface ClientTypes {
  data: Client[] | null;
  clientOptions: ClientOptions[][];
  getClients: (
    id: number | null
  ) => Promise<ClientWithContact | ClientWithContact[] | null>;
  getClientsByUser: (id: number) => Promise<UserClients[]>;
  insertClient: (data: ClientForm) => Promise<DefaultResponse>;
  updateClient: (data: ClientForm, id: string) => Promise<DefaultResponse>;
  updateClientStatus: (
    status: List,
    id: string | number
  ) => Promise<DefaultResponse>;
  insertBatchClients: (data: ClientUpload[]) => Promise<DefaultResponse>;
}

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
  status: number;
  status_name: string;
  mediums: ClientMedium[] | [];
}
export interface ClientWithContact extends Client {
  [x: string]: string | number | null;
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
  [key: string]: string | number | List[];
  name: string;
  industry: number | string;
  brand: string;
  company: number | string;
  sales_unit: number | string;
  account_executive: number | string;
  status: number | string;
  mediums: List[];
  contact_person: string;
  designation: string;
  contact_number: string;
  email_address: string;
  address: string;
  type: number | string;
  source: number | string;
}
export interface ClientUpload {
  [key: string]: string | number;
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
  misc_id: number;
  name: string;
  category: "status" | "type" | "industry" | "source";
  status: number;
}

export interface UserClients {
  client_id: number;
  name: string;
  status: string;
}
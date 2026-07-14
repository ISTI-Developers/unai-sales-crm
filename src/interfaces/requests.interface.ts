import { LEDBoardConfigured } from "@/data/LEDBoards";
import { Site } from "./sites.interface";
import { Client } from "./client.interface";

export interface AddOns {
  installation: number;
  material: number;
  site?: LEDBoardConfigured;
}

export interface SiteRow {
  site: Site;
  srp: string;
  package_rate: string;
  add_ons: AddOns;
  date: {
    from: Date;
    to: Date;
  };
}
export interface Cart {
  client?: Client;
  brand: string;
  sites: SiteRow[];
  special_term: string;
}

export type CartSite = {
  ID: number;
  from: string;
  to: string;
  srp: number;
  package_rate: number;
  add_ons: AddOns;
  add_on_total: number;
  net_amount: number;
};
export type CartDetails = {
  client_id: number;
  client_name: string;
  brand: string;
  sites: CartSite[];
  special_term: string;
};
export type NewCart = {
  form_id: number;
  user_id: number;
  token: string;
  details: CartDetails;
  package_rate_total: number;
  srp_total: number;
  net_total: number;
  add_ons_total: number;
};

export type Approver = {
  ID: number;
  user_id: number;
  first_name: string;
  last_name: string;
  image: string | null;
  request_id: number;
  position: string;
  level: number;
  status: number;
  remarks: string;
  modified_at: Date;
};

export type Request = {
  ID: number;
  token: string;
  request_no: string;
  details: string;
  form_id: number;
  user_id: number;
  user: string;
  status: number;
  created_at: Date;
  approvers: Approver[];
};

export type ApproverResponse = Pick<Approver, "ID" | "status" | "remarks"> & {
  request_no: string;
};

export type RequestTable = Request & {
  client_name: string;
  brand: string;
};

export const approvalStep: Record<string, string> = {
  COO: "Package Rate Review",
  CRO: "Package Rate Review",
  "SALES DEPARTMENT HEAD": "Package Rate Review",
  "SALES SUPPORT": "Sales Support Review",
  "SALES UNIT HEAD": "Sales Unit Head Review",
  "FINANCE CHECKER": "Finance Review",
};

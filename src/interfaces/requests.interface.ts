import { SitePreview } from "./sites.interface";
import { Client } from "./client.interface";
import { TermsAndConditions, termsAndConditions } from "@/data/conforme-tnc";

export interface AddOns {
  installation: number;
  material: number;
}

export interface SiteRow {
  site: SitePreview;
  srp: string;
  package_rate: string;
  offered_rate: string;
  installation: {
    free: number;
    paid: number;
    cost: number;
  };
  material: {
    free: number;
    paid: number;
    cost: number;
  };
  date: {
    from: Date;
    to: Date;
  };
}
export interface LEDSiteRow {
  site: SitePreview;
  srp: string;
  spots_rate: string;
  package_rate: string;
  offered_rate: string;
  spots_count: number;
  is_free: boolean;
  date: {
    from: Date;
    to: Date;
  };
}
export interface GlobalAddOns {
  name: string;
  value: number;
  qty: number;
  total: number;
  is_free: boolean;
}
export interface Cart {
  client?: Client;
  brand: string;
  sites: SiteRow[];
  leds: LEDSiteRow[];
  special_term: string;
  add_ons: GlobalAddOns[];
}

export type CartSite = {
  ID: number;
  from: string;
  to: string;
  srp: number;
  package_rate: number;
  offered_rate: number;
  installation: {
    free: number;
    paid: number;
    cost: number;
  };
  material: {
    free: number;
    paid: number;
    cost: number;
  };
  add_on_total: number;
  net_amount: number;
};

export type LEDSite = {
  ID: number;
  from: string;
  to: string;
  srp: number;
  package_rate: number;
  offered_rate: number;
  spots_count: number;
  is_free: boolean;
  net_amount: number;
  details: SitePreview;
};
export type CartDetails = {
  client_id: number;
  client_name: string;
  brand: string;
  sites: CartSite[];
  leds: LEDSite[];
  special_term: string;
  add_ons: GlobalAddOns[];
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

export type ConformeSite = {
  ID: number;
  site_code: string;
  address: string;
  board_facing: string;
  size: string;
  image?: string;
  start: string;
  end: string;
  monthly_rate: number;
  total_rate: number;
  installation: {
    free: number;
    paid: number;
    cost: number;
  };
  material: {
    free: number;
    paid: number;
    cost: number;
  };
};

export type PaymentMethod = "PDC" | "BANK";
export const paymentMethods = {
  PDC: "post-dated check",
  BANK: "bank transfer",
} as const;
export type PaymentTiming = {
  payment_method: PaymentMethod;
  startDate: number;
};

export type PaymentRule = {
  type: "ADVANCE" | "DEPOSIT";
  months: number;
  applies_to: "START" | "END";
};

export const appliesToPayment = {
  START: "first",
  END: "last",
} as const;

type PaymentTerms = {
  monthly_payment: PaymentTiming;
  contract_terms: Record<number, PaymentRule[]>;
  other_terms: TermsAndConditions[];
};

export const defaultPaymentTerms: PaymentTerms = {
  contract_terms: {
    3: [{ type: "ADVANCE", applies_to: "START", months: 1 }],
    6: [
      { type: "ADVANCE", applies_to: "START", months: 2 },
      { type: "DEPOSIT", applies_to: "END", months: 1 },
    ],
    12: [
      { type: "ADVANCE", applies_to: "START", months: 3 },
      { type: "DEPOSIT", applies_to: "END", months: 1 },
    ],
  },
  monthly_payment: {
    payment_method: "PDC",
    startDate: 3,
  },
  other_terms: termsAndConditions,
};

export type Conforme = {
  business_name: string;
  product: string;
  business_address: string;
  billing_address: string;
  authorized_signatory: string;
  contact_number: string;
  position: string;
  sites: ConformeSite[];
  terms: PaymentTerms;
};

export const approvalStep: Record<string, string> = {
  COO: "Package Rate Review",
  CRO: "Package Rate Review",
  "SALES DEPARTMENT HEAD": "Package Rate Review",
  "SALES SUPPORT": "Sales Support Review",
  "SALES UNIT HEAD": "Sales Unit Head Review",
  "FINANCE CHECKER": "Finance Review",
};

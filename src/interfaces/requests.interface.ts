import { SitePreview } from "./sites.interface";
import { Client } from "./client.interface";
import { TermsAndConditions, termsAndConditions } from "@/data/conforme-tnc";

export const THRESHOLD = 4 as const;
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
  region: string;
  image?: string;
  start: string;
  end: string;
  add_on_total: number;
  monthly_rate: number;
  offered_rate: number;
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
export type ConformeLED = {
  ID: number;
  site_code: string;
  address: string;
  board_facing: string;
  size: string;
  start: string;
  end: string;
  srp: number;
  spots_price: number;
  spots_count: number;
  package_rate: number;
  total_rate: number;
  is_free: boolean;
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

export type PaymentTerms = {
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

export type Signatory = {
  name: string;
  title: string;
  signature?: File;
};

export type MaterialPrinting =
  | {
      internal: true;
      format: "fixed" | "regional";
      value?:
        | number
        | {
            metro_manila: number;
            provincial: number;
          };
    }
  | {
      internal: false;
      format: "fixed";
      value: number;
    }
  | {
      internal: false;
      format: "regional";
      value: {
        metro_manila: number;
        provincial: number;
      };
    };

export type InstallationAndDismantling =
  | {
      internal: true;
      value?: number;
    }
  | {
      internal: false;
      value: number;
    };

export type Production = {
  material_printing: MaterialPrinting;
  installation_and_dismantling: InstallationAndDismantling;
};
export type Conforme = {
  business_name: string;
  product: string;
  business_address: string;
  billing_address: string;
  authorized_signatory: string;
  position: string;
  sites: ConformeSite[];
  leds: ConformeLED[];
  add_ons: GlobalAddOns[];
  terms: PaymentTerms;
  internal_signatory: Signatory[];
  internal_signatory_options: {
    layout: "combined" | "separated";
    use_code_names: boolean;
  };
  external_signatory: Signatory[];
  production: Production;
};

export const approvalStep: Record<string, string> = {
  COO: "Margin exceeded 30% below SRP",
  CRO: "Margin exceeded 20% below SRP",
  "SALES DEPARTMENT HEAD": "Margin exceeded below SRP",
  "SALES SUPPORT": "Sales Support Review",
  "SALES UNIT HEAD": "Sales Unit Head Review",
  "FINANCE CHECKER": "Finance Review",
};

import { DeckSite } from "@/interfaces/deck.interface";

export interface PriceRange {
  from: number;
  to: number;
}
export interface DateRange {
  from: Date;
  to: Date;
}
export interface DeckFilters {
  area: string[];
  landmark: string[];
  price: PriceRange[];
  availability: string[];
  site_owner: string[];
  status: number[];
  search: string;
}

export interface ApplyTo {
  type: "sites" | "range";
}
export interface Sites extends ApplyTo {
  type: "sites";
  list: string[];
}
export interface Range extends ApplyTo {
  type: "range";
  range: PriceRange;
}
export interface PriceAdjustmentBase {
  id: string;
  amount: number;
  type: "---" | "%"; // flat / percent
  operation: "+" | "-"; // add / subtract
  cap: number;
}

export type PriceAdjustmentBySites = PriceAdjustmentBase & {
  apply_to: Sites;
};
export type PriceAdjustmentByPrice = PriceAdjustmentBase & {
  apply_to: Range;
};
export type PriceAdjustmentAll = PriceAdjustmentBase & {
  apply_to: "ALL";
};

export type PriceAdjustment =
  | PriceAdjustmentBySites
  | PriceAdjustmentByPrice
  | PriceAdjustmentAll;
export interface RateGenerator {
  duration: 3 | 6 | 12;
  discount: number;
  type: "---" | "%";
}

export interface BaseInclusionGenerator {
  duration: 1 | 3 | 6 | 12;
  type: "FREE" | "PAID";
}

export interface FreeInclusionGenerator extends BaseInclusionGenerator {
  type: "FREE";
  count: number;
}
export interface PaidInclusionGenerator extends BaseInclusionGenerator {
  type: "PAID";
}

export interface ProductionCost {
  north_luzon: number;
  metro_manila: number;
  south_luzon: number;
  visayas: number;
  mindanao: number;
}

export type InclusionGenerator =
  | FreeInclusionGenerator
  | PaidInclusionGenerator;

export type OldInclusion = {
  count: number;
  duration: number;
};
export type DeckType = "PERCENTAGE" | "FLAT" | "PAID" | "FREE";
export type PackageRate = {
  value: number;
  type: DeckType;
};

export type Packages = Record<number, PackageRate>;

export type AddOn = {
  key: string;
  label: string;
  rates: Packages;
};
export type BookingTerm = {
  duration: number;
  label: string;
};
export type RateBasis = "SINGLE" | "MULTIPLE";
export type Settings = {
  rate_basis: RateBasis;
  booking_terms: BookingTerm[];
  printing_cost: ProductionCost;
  showVatInc: boolean;
  version: number;
};

export interface DisplayOptions {
  material_inclusions: InclusionGenerator[];
  production_cost: ProductionCost;
  installation_inclusions: FreeInclusionGenerator[];
  landmark_visibility: false;
}

export interface DeckOptions {
  rate_adjustment: PriceAdjustment[];
  packages: Packages;
  currency_exchange: {
    currency: string;
    equivalent: number;
  };
  add_ons: AddOn[];
  settings: Settings;
}

export interface Deck {
  ID: number;
  token: string;
  user_id: number;
  title: string;
  description: string;
  created_at: string;
  modified_at: string;
  thumbnail: number;
  status: number;
  sites: Partial<DeckSite>[];
  filters: Partial<DeckFilters>;
  options: DeckOptions;
}

export const sampleUpdatedDeck = {
  ID: 1,
  token: "testing",
  user_id: 1,
  title: "New Deck",
  description: "Test Deck",
  created_at: new Date(),
  modified_at: new Date(),
  thumbnail: 49805,
  status: 1,
  sites: [],
  filters: {
    area: [],
    landmark: [],
    price: [],
    availability: [],
    site_owner: [],
    status: [],
    search: "",
  },
  options: {
    rate_adjustment: [], // global markup/discount of rates.
    packages: {
      3: { value: 0, type: "PERCENTAGE" },
      6: { value: 0, type: "PERCENTAGE" },
      12: { value: 0, type: "FLAT" },
    }, // only available if rate_basis is booking_terms.
    currency_exchange: {
      currency: "PHP",
      rate: 0,
    },
    add_ons: {
      installation_dismantling: {
        label: "Installation & Dismantling",
        rates: {
          1: { value: 0, type: "FREE" }, // FREE || PAID
        },
      },
      material_printing: {
        label: "Material Printing",
        rates: {
          1: { value: 0, type: "FREE" },
        },
      },
    },
    settings: {
      rate_basis: "booking_terms",
      booking_terms: [
        { duration: 2, label: "2 Months" },
        { duration: 3, label: "3 Months" },
        { duration: 6, label: "6 Months" },
        { duration: 12, label: "12 Months" },
      ],
      printing_cost: {
        north_luzon: 25,
        metro_manila: 25,
        south_luzon: 25,
        visayas: 25,
        mindanao: 25,
      },
    },
  },
};

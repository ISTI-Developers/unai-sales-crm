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
}

export interface PriceAdjustmentBySites extends PriceAdjustmentBase {
  apply_to: Sites;
}
export interface PriceAdjustmentByPrice extends PriceAdjustmentBase {
  apply_to: Range;
}
export interface PriceAdjustmentAll extends PriceAdjustmentBase {
  apply_to: "ALL";
}

export type PriceAdjustment =
  | PriceAdjustmentBySites
  | PriceAdjustmentByPrice
  | PriceAdjustmentAll;

export interface RateGenerator {
  duration: 3 | 6 | 12;
  discount: number;
  type: "---" | "%";
}

export interface InclusionGenerator {
  duration: 3 | 6 | 12;
  count: number;
}

export interface DisplayOptions {
  material_inclusions: number | InclusionGenerator[];
  installation_inclusions: number | InclusionGenerator[];
  landmark_visibility: false;
}

export interface DeckOptions {
  price_adjustment: PriceAdjustment[];
  rate_generator: RateGenerator[];
  currency_exchange: {
    currency: string;
    equivalent: number;
  };
  display_options: Partial<DisplayOptions>;
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
  options: Partial<DeckOptions>;
}

export const decks: Deck[] = [
  {
    ID: 1,
    token: "23cc4676-4224-46f6-8ce0-6c18cb178bf4",
    user_id: 1,
    title: "Sales Deck 1",
    description: "A beautiful sales deck.",
    created_at: "2025-11-24T11:40:30",
    modified_at: "2025-11-24T11:40:30",
    thumbnail: 46906,
    status: 1, // 1 active / 0 deleted
    sites: [
      {
        site_code: "1CC5MKT001-1AA01",
        image: 46906,
      },
    ],
    filters: {},
    options: {
      price_adjustment: [
        {
          id: "fdsdfsd",
          amount: 50000,
          type: "---", // flat / percent
          operation: "+", // add / subtract
          apply_to: "ALL",
        },
      ],
      display_options: { landmark_visibility: false },
    },
  },
];

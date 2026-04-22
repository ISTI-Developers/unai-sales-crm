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
  luzon: number;
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
export interface DisplayOptions {
  material_inclusions: InclusionGenerator[];
  production_cost: ProductionCost;
  installation_inclusions: FreeInclusionGenerator[];
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

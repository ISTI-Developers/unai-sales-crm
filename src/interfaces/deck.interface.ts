import { Dispatch, SetStateAction } from "react";
import { Landmarks, SiteDetailswithMapping } from "./sites.interface";
import {
  DeckFilters,
  DeckOptions,
  InclusionGenerator,
  PriceAdjustment,
  RateGenerator,
} from "@/misc/deckTemplate";
import { v4 } from "uuid";

export interface DeckSite extends SiteDetailswithMapping {
  availability: string | null;
  client?: string;
  product?: string;
  image?: number;
  url?: string;
  width?: number;
  height?: number;
  map?: string;
  landmarks?: Landmarks[];
}

export type SiteConfig<T> = Record<string, T>;

export interface DeckProvider {
  sites: DeckSite[];
  selectedSites: DeckSite[];
  selectedFilters: Partial<DeckFilters>;
  selectedOptions: Partial<DeckOptions>;
  isLoading: boolean;
  title: string;
  setSelectedSites: Dispatch<SetStateAction<DeckSite[]>>;
  setFilters: Dispatch<SetStateAction<Partial<DeckFilters>>>;
  setOptions: Dispatch<SetStateAction<Partial<DeckOptions>>>;
  setTitle: Dispatch<SetStateAction<string>>;
}

export const deckFilterKeys: readonly string[] = [
  "area",
  "availability",
  "landmark",
  "price",
  "site_owner",
  "search",
];

export const deckOptionKeys: readonly string[] = [
  "price_adjustment",
  "rate_generator",
  "currency_exchange",
  "display_options",
];

export const priceAdjustment: PriceAdjustment = {
  amount: 0,
  apply_to: "ALL",
  id: v4(),
  operation: "+",
  type: "---",
};
export const rateGenerator: RateGenerator = {
  duration: 3,
  discount: 0,
  type: "---",
};
export const inclusionGenerator: InclusionGenerator = {
  duration: 1,
  type: "FREE",
  count: 1,
};
export const optionsBaseContent = {
  price_adjustment: [priceAdjustment],
  currency_exchange: {
    currency: "PHP",
    equivalent: 1,
  },
  rate_generator: [
    rateGenerator,
    { ...rateGenerator, duration: 6 },
    { ...rateGenerator, duration: 12 },
  ],
};

export const regions = {
  1: "luzon",
  2: "visayas",
  3: "mindanao",
} as const;

export const displayOptions = {
  base: {
    material_inclusions: [inclusionGenerator],
    production_cost: { luzon: 25, visayas: 25, mindanao: 25 },
    installation_inclusions: [inclusionGenerator],
    landmark_visibility: false,
  },
  withRateGenerator: {
    material_inclusions: [
      { ...inclusionGenerator, duration: 3 },
      { ...inclusionGenerator, duration: 6 },
      { ...inclusionGenerator, duration: 12 },
    ],
    production_cost: { luzon: 25, visayas: 25, mindanao: 25 },
    installation_inclusions: [
      { ...inclusionGenerator, duration: 3, count: 1 },
      { ...inclusionGenerator, duration: 6, count: 2 },
      { ...inclusionGenerator, duration: 12, count: 4 },
    ],
    landmark_visibility: false,
  },
};

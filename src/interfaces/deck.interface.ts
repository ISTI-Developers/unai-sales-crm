import { Dispatch, SetStateAction } from "react";
import { Landmarks, SiteDetailswithMapping } from "./sites.interface";
import {
  BookingTerm,
  DeckFilters,
  DeckOptions,
  InclusionGenerator,
  Packages,
  PriceAdjustment,
  RateBasis,
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
  selectedOptions: DeckOptions;
  isLoading: boolean;
  title: string;
  selectedSite: number;
  option?: string;
  setSelectedSite: Dispatch<SetStateAction<number>>;
  setOption: Dispatch<SetStateAction<string | undefined>>;
  setSelectedSites: Dispatch<SetStateAction<DeckSite[]>>;
  setFilters: Dispatch<SetStateAction<Partial<DeckFilters>>>;
  setOptions: Dispatch<SetStateAction<DeckOptions>>;
  setTitle: Dispatch<SetStateAction<string>>;
  toggleFilter: (key: string, remove: boolean) => void;
}

export const deckFilterKeys: readonly string[] = [
  "area",
  "availability",
  "landmark",
  "price",
  "site_owner",
  "status",
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
  1: "metro_manila",
  2: "north_luzon",
  3: "south_luzon",
  4: "visayas",
  5: "mindanao",
} as const;

export const bookingTerm: BookingTerm = {
  duration: 1,
  label: "Monthly",
};
export const DEFAULTS = {
  rate_basis: "SINGLE" as RateBasis,
  rate_adjustment: [priceAdjustment],
  booking_terms: [bookingTerm],
  filters: { status: [1] },
  packages: {
    3: { value: 0, type: "FLAT" },
    6: { value: 0, type: "FLAT" },
    12: { value: 0, type: "FLAT" },
  } as Packages,
  printing_cost: {
    north_luzon: 25,
    metro_manila: 23,
    south_luzon: 25,
    visayas: 25,
    mindanao: 25,
  },
};

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
export const ADD_ON_TEMPLATES = [
  {
    key: "installation_dismantling",
    label: "Installation & Dismantling",
  },
  {
    key: "material_printing",
    label: "Material Printing",
  },
] as const;

export const DEFAULT_OPTIONS: DeckOptions = {
  rate_adjustment: [],
  packages: {},
  currency_exchange: {
    currency: "PHP",
    equivalent: 1,
  },
  add_ons: [],
  settings: {
    rate_basis: DEFAULTS.rate_basis,
    booking_terms: DEFAULTS.booking_terms,
    printing_cost: DEFAULTS.printing_cost,
    version: 1,
  },
};

import { Booking } from "@/hooks/useBookings";

export interface Site {
  ID: number;
  structure_code: string;
  site_code: string;
  site: string;
  area: string;
  city: string;
  size: string;
  segments: string;
  region: string;
  address: string;
  latitude: string;
  longitude: string;
  site_owner: string;
  board_facing: string;
  type: string;
  price: string;
  ideal_view: string;
  imageURL: string;
  remarks: string | null;
  is_prime: number;
  bound: string;
  status: number;
}

export interface SiteDetailswithMapping extends Site {
  [key: string]: string | number | null | undefined | Landmarks[];
}
export interface SiteImage {
  upload_id: number;
  module_id: number;
  field_id: number;
  users_id: number;
  upload_path: string;
  date_uploaded: string;
  img_from: number;
  url: string;
}

export interface City {
  city_id: number;
  city_code: string;
  city_name: string;
}

export interface Landmarks {
  ID: number;
  display_name: string;
  // address: string;
  latitude: string;
  longitude: string;
  types: string[] | string;
  // record_at: string;
}

export interface ContractOverride {
  ID: number;
  site_code: string;
  brand: string;
  original_end_date: string;
  adjusted_end_date: string;
  adjustment_reason: string;
  created_at: string;
  modified_at: string;
}
export interface AvailableSites {
  structure: string;
  site: string;
  category: string;
  // contract_no?: string;
  product?: string;
  client?: string;
  address: string;
  date_from?: string;
  end_date?: string;
  // date_created: string;
  // lease_contract_id?: number;
  // lease_contract_code?: string;
  net_contract_amount?: number;
  payment_term_id?: number;
  // lease_date_from?: string;
  // lease_date_to?: string;
  days_vacant?: number;
  remaining_days?: number;
  adjusted_end_date?: string;
  adjustment_reason?: string;
  brand_during_adjustment?: string;
  site_rental?: number;
}

export interface BookingTable extends Omit<AvailableSites, "category"> {
  bookings: Booking[];
  site_rental: number;
  facing: string;
  remarks?: string;
  booking_id?: number;
}

export interface LatestSites {
  structure_id: number;
  structure_code: string;
  site_code: string;
  city: string;
  region: string;
  address: string;
  latitude: number;
  longitude: number;
  site_owner: string;
  facing: string;
  size: string;
  vicinity_population: string;
  traffic_count: string;
  bound: string | null;
  date_created: string;
}
export interface NewSite extends Omit<
  LatestSites,
  "structure_id" | "date_created"
> {
  ideal_view: string;
}
export interface SiteImpressions {
  area: string;
  impressions: number;
}

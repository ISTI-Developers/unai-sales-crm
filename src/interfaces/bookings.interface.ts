import { modifiers } from "@/hooks/v2/useBookings";

export interface Booking {
  ID: number;
  site_code: string;
  srp: number;
  booking_status: string;
  addendum: string | null;
  client: string;
  account_executive: string;
  date_from: string;
  date_to: string;
  monthly_rate: number;
  site_rental: number;
  old_client: string;
  remarks: string;
  created_at: string;
  modified_at: string;
}

export type TaggedBooking = Booking & {
  is_prime: number;
  effectivity_date?: string;
  product?: string;
};

export type BookingForm = Omit<Booking, "ID" | "modified_at">;
export interface Availability {
  ID: number;
  site_code: string;
  address: string;
  board_facing: string;
  site_owner: string;
  area: string;
  city: string;
  region: string;
  size: string;
  site_rental: number;
  // client: string;
  // product: string;
  srp: number;
  // end_date: string;
  // days_left: number;
  // days_vacant: number;
  remarks: string | null;
  status: number;
  bookings: TaggedBooking[];
}

export interface ColumnActions {
  onOpen: (row: Availability) => void;
  onEdit: (row: Availability) => void;
  onBook: (row: Availability) => void;
  onDelete: (row: Availability) => void;
}

export type BookingContext = {
  current?: Booking;
  previous?: Booking;
  next?: Booking;
  supersededIds: Set<number>;
};
export type Modifier = (typeof modifiers)[number];

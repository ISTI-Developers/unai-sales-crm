import { catchError, /*oohAPI,*/ spAPI } from "@/providers/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSite } from "./useSites";
// import { formatAmount } from "@/lib/format";
import { format } from "date-fns";
import { DefaultResponse, List } from "@/interfaces";
import { toast } from "./use-toast";
export interface Booking {
  ID: number;
  site_code: string;
  srp: number;
  booking_status: string;
  client: string;
  account_executive: string;
  date_from: string;
  date_to: string;
  monthly_rate: number;
  site_rental: number;
  old_client: string;
  created_at: string;
  modified_at: string;
  remarks: string
}
export interface PreSiteBooking {
  ID: number;
  booking_id: number;
  area: string;
  address: string;
  site_rental: string;
  facing: string;
  date_from: string;
  date_to: string;
  client: string;
  account_executive: string;
  srp: string;
  monthly_rate: string;
  booking_status: string;
  remarks: string;
}

export type BookingCard = Omit<
  Booking,
  "srp" | "monthly_rate" | "site_rental" | "date_from" | "date_to"
> & {
  start: Date | string;
  end: Date | string;
  site: string;
  srp: string | number;
  monthly_rate: string | number;
  site_rental: string | number;
};

interface NewBooking {
  account_executive: List[];
  booking_status: string;
  client: string;
  end: Date | string;
  monthly_rate: string;
  old_client?: string;
  site_rental: string;
  remarks: string;
  srp: string;
  start: Date | string;
}

export const useBookings = () => {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await spAPI.get<Booking[]>("booking");
      return response.data;
    },
    staleTime: 60000,
  });
};

export const useBooking = (id?: number) => {
  return useQuery({
    queryKey: ["bookings", "id", id],
    queryFn: async () => {
      const response = await spAPI.get<Booking[]>("booking", {
        params: {
          id: id,
        },
      });
      if (response.data) {
        return response.data[0];
      }
    },
    staleTime: 60000,
    enabled: !!id,
  });
};

export const usePreBookings = () => {
  return useQuery({
    queryKey: ["bookings", "pre"],
    queryFn: async () => {
      const response = await spAPI.get<PreSiteBooking[]>("booking", {
        params: {
          special: true,
        },
      });
      return response.data;
    },
    staleTime: 60000,
  });
};

export const useSiteBookings = (site_code?: string) => {
  return useQuery({
    queryKey: ["bookings", "site", site_code],
    queryFn: async () => {
      const response = await spAPI.get<Booking[]>("booking", {
        params: {
          site_code: site_code,
        },
      });
      return response.data;
    },
    staleTime: 60000,
    enabled: !!site_code,
  });
};

export const useCreateBooking = (site_code: string) => {
  const { data: site, isError } = useSite(site_code);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (booking: NewBooking) => {
      if (isError || !site) {
        throw new Error("Site fetch failed or site missing.");
      }

      const forDatabase = {
        ...booking,
        site: site.site_code,
        account_executive: booking.account_executive
          .map((item) => item.value)
          .join(", "),
        start: format(booking.start, "yyyy-MM-dd"),
        end: format(booking.end, "yyyy-MM-dd"),
        created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      };

      const formdata = new FormData();
      formdata.append("data", JSON.stringify(forDatabase));
      const response = await spAPI.post<DefaultResponse>("booking", formdata);
      return response.data;
    },
    onSuccess: () => queryClient.refetchQueries({ queryKey: ["bookings"] }),
    onError: catchError,
  });
};
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (booking: Omit<Booking, "date_from" | "date_to"> & { date_from: Date, date_to: Date }) => {
      const data = {
        booking_id: booking.ID,
        action: "update",
        monthly_rate: booking.monthly_rate,
        booking_status: booking.booking_status,
        date_from: format(booking.date_from, "yyyy-MM-dd"),
        date_to: format(booking.date_to, "yyyy-MM-dd"),
        modified_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      };

      const response = await spAPI.put<DefaultResponse>("booking", data);
      return response.data;

    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["bookings"] });
      toast({
        description: "Booking has been updated.",
      })
    },
    onError: catchError,
  });
};
export const useCreateBookingWithNoSite = () => {
  return useMutation({
    mutationFn: async (booking: {
      area: string;
      address: string;
      facing: string;
      size: string;
      srp: number;
      booking_status: string;
      client: string;
      account_executive: List[];
      start: Date;
      end: Date;
      monthly_rate: string;
      remarks: string;
      site_rental: number;
    }) => {
      const forDatabase = {
        ...booking,
        account_executive: booking.account_executive
          .map((item) => item.value)
          .join(", "),
        start: format(booking.start, "yyyy-MM-dd"),
        end: format(booking.end, "yyyy-MM-dd"),
        created_at: format(new Date(), "yyyy-MM-dd hh:mm:ss"),
      };
      const formdata = new FormData();
      formdata.append("data", JSON.stringify(forDatabase));
      const response = await spAPI.post<DefaultResponse>("booking", formdata);
      return response.data;
    },
    onSuccess: () => {
      toast({
        variant: "success",
        description: "Booking has created!",
      });
    },
    onError: catchError,
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ booking_id, reason }: { booking_id: number, reason: string }) => {
      const response = await spAPI.delete<DefaultResponse>("booking", {
        params: {
          id: booking_id,
          reason: reason,
          date: format(new Date(), "yyyy-MM-dd hh:mm:ss"),
        },
      });
      if (response.data) {
        return response.data;
      }
    },
    onSuccess: (data, {booking_id}) => {
      if (data) {
        toast({
          title: "Booking cancelled",
          description: "Successfully cancelled the booking.",
          variant: "success",
        });
      }
      queryClient.setQueryData<Booking[]>(["bookings"], (bookings) => {
        if (!bookings) return bookings;

        return bookings.map((booking) => {
          return booking.ID === booking_id
            ? {
              ...booking,
              booking_status: "CANCELLED",
            }
            : booking;
        });
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: catchError,
  });
};

export const useTagPreSite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      booking_id,
      site_code,
    }: {
      booking_id: number;
      site_code: string;
    }) => {
      const response = await spAPI.put<DefaultResponse>("booking", {
        id: booking_id,
        site_code: site_code,
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        variant: "success",
        description: "Booking has been tagged successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: catchError,
  });
};

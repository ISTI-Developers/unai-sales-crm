import { DefaultResponse } from "@/interfaces";
import { Booking, BookingContext, BookingForm, BookingHistory, TaggedBooking } from "@/interfaces/bookings.interface";
import { spAPI as api, catchError } from "@/providers/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, differenceInCalendarDays, endOfDay, format, startOfDay } from "date-fns";
import { toast } from "../use-toast";

const v = "v2";

export const useBookings = () => {
    return useQuery({
        queryKey: [v, "bookings"],
        queryFn: async () => {
            const response = await api.get<Booking[]>(`${v}/bookings`);
            return response.data;
        },
        staleTime: 60000,
    });
}
export const useBookingHistory = () => {
    return useQuery({
        queryKey: [v, "bookings", "history"],
        queryFn: async () => {
            const response = await api.get<BookingHistory[]>(`${v}/bookings?type=history`);
            return response.data;
        },
        staleTime: 60000,
    });
}
// export const useOtherBookings = () => { }
export const useAddBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (booking: BookingForm) => {
            const formdata = new FormData();
            formdata.append("data", JSON.stringify(booking));

            const response = await api.post<DefaultResponse>(`${v}/bookings`, formdata);
            return response.data;
        },
        onSuccess: () => queryClient.refetchQueries({ queryKey: [v, "bookings"] }),
        onError: catchError
    })
}
export const useUpdateBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ID, data }: { ID: number; data: Partial<TaggedBooking> }) => {
            const records = { ...data, modified_at: format(new Date(), "yyyy-MM-dd HH:mm:ss") };

            const updateData = {
                action: "update",
                booking_id: ID,
                keys: Object.keys(records),
                values: Object.values(records),
            }


            const response = await api.put<DefaultResponse>(`${v}/bookings`, updateData);
            return response.data;

        },
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [v, "bookings"] });
            toast({
                description: "Booking has been updated.",
                variant: "success",
            })
        },
        onError: catchError,
    });
}

export const useUpdateBookingTermDetails = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ID, data }: { ID: number; data: Partial<TaggedBooking> }) => {
            const updateData = {
                action: "term_change",
                booking_id: ID,
                modified_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                ...data,
            }


            const response = await api.put<DefaultResponse>(`${v}/bookings`, updateData);
            return response.data;

        },
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [v, "bookings"] });
            toast({
                description: "Booking has been updated.",
                variant: "success",
            })
        },
        onError: catchError,
    });
}

export const usePreterminateBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ID, data }: { ID: number; data: Partial<TaggedBooking> }) => {
            const updateData = {
                action: "pre-terminate",
                booking_id: ID,
                modified_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                ...data,
            }


            const response = await api.put<DefaultResponse>(`${v}/bookings`, updateData);
            return response.data;

        },
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [v, "bookings"] });
        },
        onError: catchError,
    });
}

export const useCancelBooking = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ booking_id, reason }: { booking_id: number, reason: string }) => {
            const response = await api.delete<DefaultResponse>(`${v}/bookings`, {
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
        onSuccess: (data, variables) => {
            if (data) {
                toast({
                    title: "Booking cancelled",
                    description: "Successfully cancelled the booking.",
                    variant: "success",
                });
                queryClient.setQueryData<Booking[]>([v, "bookings"], (bookings) => {
                    if (!bookings) return bookings;

                    return bookings.map((booking) => {
                        return booking.ID === variables.booking_id
                            ? {
                                ...booking,
                                booking_status: "CANCELLED",
                            }
                            : booking;
                    });
                });
                queryClient.invalidateQueries({ queryKey: [v, "bookings"] });
            }
        },
        onError: catchError,
    });
};

// HELPERS

export const statusMap = {
    QUEUEING: "bg-yellow-200/50 border-yellow-500 text-yellow-500",
    AVAILABLE: "bg-red-200/50 border-red-500 text-red-500",
    BOOKED: "bg-sky-200/50 text-sky-500 border-sky-500"
} as const
export const modifiers = [
    "CHANGE OF CONTRACT DETAILS",
    "CHANGE OF CONTRACT PERIOD/DURATION",
    "RELOCATION",
    "PRE-TERMINATION",
] as const;

export const MODIFIER_ADDENDUMS = new Set([
    "RELOCATION",
    "CHANGE OF CONTRACT PERIOD/DURATION",
    "CONTRACT EXTENSION",
]);

const EXCLUDED_STATUSES = new Set([
    "CANCELLATION",
]);

const isModifier = (booking: Booking) =>
    MODIFIER_ADDENDUMS.has(booking.addendum ?? "");

const getPreviousBooking = (
    booking: Booking,
    bookings: Booking[]
) => {
    if (!isModifier(booking)) {
        return undefined;
    }

    return bookings
        .filter(previous =>
            previous.site_code === booking.site_code &&
            new Date(previous.created_at).getTime() < new Date(booking.created_at).getTime() &&
            previous.booking_status !== "CANCELLATION"
        )
        .filter(previous => {
            // Prefer the explicit old_client relationship
            if (booking.old_client) {
                return previous.client === booking.old_client;
            }

            return true;
        })
        .sort((a, b) => b.ID - a.ID)[0];
};

const getSupersededIds = (bookings: Booking[]) => {
    const supersededIds = new Set<number>();

    for (const booking of bookings) {
        /*
         * 1. Addendum supersedes its previous booking.
         *
         * NEW
         *   ↓ CONTRACT EXTENSION
         * NEW + CONTRACT EXTENSION
         */
        const previous = getPreviousBooking(booking, bookings);

        if (previous) {
            supersededIds.add(previous.ID);
        }

        /*
         * 2. PRE-TERMINATION supersedes the booking
         *    with the same contract start.
         *
         * RENEWAL
         * 01/01/2026 → 12/31/2026
         *
         * PRE-TERMINATION
         * 01/01/2026 → 10/15/2026
         */
        if (booking.booking_status === "PRE-TERMINATION") {
            const terminatedBooking = bookings
                .filter(previous =>
                    previous.ID < booking.ID &&
                    previous.site_code === booking.site_code &&
                    previous.date_from === booking.date_from &&
                    !EXCLUDED_STATUSES.has(
                        previous.booking_status
                    )
                )
                .sort((a, b) => b.ID - a.ID)[0];

            if (terminatedBooking) {
                supersededIds.add(terminatedBooking.ID);
            }
        }
    }

    return supersededIds;
};

export const getBookingContext = (bookings: TaggedBooking[]): BookingContext => {
    const now = new Date();

    const emptyContext = {
        current: undefined,
        previous: undefined,
        next: undefined,
        supersededIds: new Set<number>()
    };

    if (!bookings.length) {
        return emptyContext;
    }

    /*
     * --------------------------------------------------
     * 1. Remove cancellations
     * --------------------------------------------------
     */

    const valid = bookings.filter(
        booking =>
            booking.booking_status !== "CANCELLED"
    );

    if (!valid.length) {
        return emptyContext;
    }

    /*
     * --------------------------------------------------
     * 2. Remove bookings superseded by:
     *    - addendums
     *    - pre-termination
     * --------------------------------------------------
     */

    const supersededIds = getSupersededIds(valid);

    const effective = valid.filter(
        booking => !supersededIds.has(booking.ID)
    );

    /*
     * --------------------------------------------------
     * 3. Find the actually running booking
     * --------------------------------------------------
     */

    const running = effective
        .filter(booking => {
            const from = startOfDay(
                new Date(booking.date_from)
            );

            const to = endOfDay(
                new Date(booking.date_to)
            );

            return from <= now && to >= now;
        })
        .sort((a, b) => b.ID - a.ID);

    let current = running[0];

    /*
     * --------------------------------------------------
     * 4. Find future effective bookings
     * --------------------------------------------------
     */

    const upcoming = effective
        .filter(booking => {
            const startsInFuture =
                startOfDay(new Date(booking.date_from)) > now;

            const isPreTermination =
                booking.booking_status === "PRE-TERMINATION";

            return startsInFuture && !isPreTermination;
        })
        .sort((a, b) => {
            const aStart = startOfDay(
                new Date(a.date_from)
            ).getTime();

            const bStart = startOfDay(
                new Date(b.date_from)
            ).getTime();

            return aStart - bStart || b.ID - a.ID;
        });

    const next = upcoming[0];

    /*
     * --------------------------------------------------
     * 5. Historical fallback
     *
     * If nothing is currently running and there is
     * nothing upcoming, use the most recent completed
     * effective booking as current.
     * --------------------------------------------------
     */

    if (!current && !next) {
        current = effective
            .filter(booking => {
                return (
                    endOfDay(
                        new Date(booking.date_to)
                    ) < now
                );
            })
            .sort((a, b) => {
                const aEnd = endOfDay(
                    new Date(a.date_to)
                ).getTime();

                const bEnd = endOfDay(
                    new Date(b.date_to)
                ).getTime();

                return bEnd - aEnd || b.ID - a.ID;
            })[0];
    }

    /*
     * --------------------------------------------------
     * 6. Previous
     * --------------------------------------------------
     */

    const reference = current ?? next;

    const previous = reference
        ? effective
            .filter(booking => {
                if (booking.ID === reference.ID) return false;

                return endOfDay(new Date(booking.date_to)) <
                    startOfDay(new Date(reference.date_from));
            })
            .sort((a, b) => {
                const aEnd = endOfDay(new Date(a.date_to)).getTime();
                const bEnd = endOfDay(new Date(b.date_to)).getTime();

                return bEnd - aEnd || b.ID - a.ID;
            })[0]
        : undefined;
    return {
        current,
        previous,
        next,
        supersededIds
    };
};

export const getCurrentBooking = (bookings: TaggedBooking[]) => {
    const { current, previous, next } = getBookingContext(bookings);
    if (next) {
        if (next.booking_status === "RENEWAL") {
            return next;
        }
        if (differenceInCalendarDays(new Date(), new Date(next.date_from)) < 30) {
            return next;
        }
    }
    return current ?? previous;
}

export const isQueueing = (
    booking?: Booking,
    now = new Date()
) => {
    if (!booking) return false;

    if (booking.booking_status !== "NEW") {
        return false;
    }

    const start = startOfDay(
        new Date(booking.date_from)
    );

    const queueingCutoff = startOfDay(
        addDays(now, 30)
    );

    return start > queueingCutoff;
};


export const getDisplayStatus = (
    item: Booking,
    context: ReturnType<typeof getBookingContext>
) => {
    if (item.booking_status === "CANCELLATION") {
        return "CANCELLED";
    }

    if (item.booking_status === "PRE-TERMINATION") {
        return "PRE-TERMINATED";
    }

    if (context.supersededIds.has(item.ID)) {
        return "STOPPED";
    }

    const now = new Date();

    const isCurrent =
        context.current?.ID === item.ID;

    const isNext =
        context.next?.ID === item.ID;

    const isRunning =
        isCurrent &&
        startOfDay(new Date(item.date_from)) <= now &&
        endOfDay(new Date(item.date_to)) >= now;

    if (isRunning) {
        return "RUNNING";
    }

    // Any future NEW booking more than 30 days away
    if (
        item.booking_status === "NEW" &&
        isQueueing(item, now)
    ) {
        return "QUEUEING";
    }

    // The next future booking within 30 days
    if (isNext) {
        return "UPCOMING";
    }

    if (endOfDay(new Date(item.date_to)) < now) {
        return "COMPLETED";
    }

    return "STOPPED";
};
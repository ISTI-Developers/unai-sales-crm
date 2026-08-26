import RemarksCell from "@/components/booking/remarks.cell";
import ActionCell from "@/components/bookings/actions";
import DateCell from "@/components/bookings/date";
import Cell from "@/components/bookings/structure";
import { SiteAvailability } from "@/interfaces/sites.interface";
import { getBookingContext, getLatestBooking } from "@/lib/fetch";
import { formatAmount } from "@/lib/format";
import { ColumnDef } from "@tanstack/react-table";
import { differenceInCalendarDays } from "date-fns";
import { BookOpen, BriefcaseBusiness, Building, Calendar, Calendar1, MapPin, PhilippinePeso, Quote, RulerIcon, User2 } from "lucide-react";

export const columns: ColumnDef<SiteAvailability>[] = [
    {
        accessorFn: (row) => row.site_code,
        accessorKey: "site",
        cell: Cell,
        enableColumnFilter: false,
        meta: {
            icon: Building
        }
    },
    {
        accessorKey: "size",
        header: "Size (H x W)",
        cell: ({ row }) => <p className="text-[0.65rem]">{row.original.size}</p>,
        enableColumnFilter: false,
        meta: {
            icon: RulerIcon
        }
    },
    {
        accessorKey: "address",
        header: undefined,
        cell: undefined,
        enableColumnFilter: false,
        meta: {
            hidden: true,
        }
    },
    {
        accessorKey: "board_facing",
        header: undefined,
        cell: undefined,
        enableColumnFilter: false,
        meta: {
            hidden: true
        }
    },
    {
        accessorKey: "site_owner",
        header: undefined,
        cell: undefined,
        meta: {
            hidden: true,
            filterType: "dropdown",
            allowedOptions: ["is", "is not", "contains"],
            icon: User2
        },
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<string>(columnId);

            switch (filterValue.condition) {
                case "is":
                    return cellValue === filterValue.value;
                case "is not":
                    return cellValue !== filterValue.value;
                case "contains":
                    return filterValue.value.includes(cellValue);
                default:
                    return true;
            }
        },
    },
    {
        id: "area",
        accessorFn: (row) => row.city,
        header: undefined,
        cell: undefined,
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<string>(columnId);

            switch (filterValue.condition) {
                case "is":
                    return cellValue === filterValue.value;
                case "is not":
                    return cellValue !== filterValue.value;
                case "contains":
                    return filterValue.value.includes(cellValue);
                default:
                    return true;
            }
        },
        meta: {
            hidden: true,
            filterType: "dropdown",
            allowedOptions: ["is", "is not", "contains"],
            icon: MapPin
        }
    },
    {
        id: "availability",
        accessorFn: (row) => {
            const siteBookings = row.bookings.map(sb => ({ ...sb, is_prime: row.is_prime }))
            const latestBooking = getLatestBooking(siteBookings);
            const remaining = row.remaining_days ?? 0;

            // Queueing has already finished
            if (remaining <= 0) {
                return "AVAILABLE";
            }

            // BOOKED within the 60-minute window
            if (latestBooking?.booking_status === "QUEUEING") {
                const difference = differenceInCalendarDays(new Date(), latestBooking.date_from);
                if (difference >= -30) {
                    return "BOOKED";
                }
                return "QUEUEING";

            }

            // Normal booking
            if (remaining <= 60) {
                return "AVAILABLE";
            }

            return "BOOKED";
        },
        header: undefined,
        cell: undefined,
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<Date>(columnId);
            return cellValue === filterValue.value;
        },
        enableGlobalFilter: false,
        meta: {
            hidden: true,
            filterType: "dropdown",
            allowedOptions: ["is"],
            icon: BookOpen
        }
    },
    {
        accessorKey: "site_rental",
        header: "rental",
        cell: ({ row }) => {
            const item: number = row.getValue("site_rental");

            return <p className="text-[0.65rem]">{item ? formatAmount(item) : "---"}</p>;
        },
        filterFn: (row, _, filterValue) => {
            const cellValue = Number(row.original.site_rental || 0);
            const value = filterValue.value;

            switch (filterValue.condition) {
                case "is":
                    return cellValue === Number(value);
                case "between": {
                    const from = Number(value.from);
                    const to = Number(value.to);

                    if (from !== 0 && to === 0) {
                        // from -> Infinity
                        return cellValue >= from;
                    }

                    if (from === 0 && to !== 0) {
                        // 0 -> to
                        return cellValue <= to;
                    }

                    return cellValue >= from && cellValue <= to;
                }
                default:
                    return true;
            }
        },
        meta: {
            filterType: "price_range",
            allowedOptions: ["is", "between"],
            label: "rental",
            icon: PhilippinePeso
        }
    },
    {
        id: "client", // required when using accessorFn
        header: "Client",
        accessorFn: (row) => {
            const bookings = row.bookings;
            const client: string = row.client ?? "";
            let item = row.product ?? "";

            // build display label
            item = `${client} ${item ? `(${item})` : ""}`;
            const siteBookings = bookings.map(sb => ({ ...sb, is_prime: row.is_prime }))

            const { current, previous } = getBookingContext(siteBookings);

            if (current?.booking_status === "QUEUEING") {
                const difference = differenceInCalendarDays(new Date(), current.date_from);
                if (difference >= -30) {
                    item = current.client;
                }
                item = previous?.client ?? "---";
            } else {
                item = current?.client ?? "---";
            }

            return item || "---";
        },
        cell: ({ getValue }) => (
            <p className="text-[.6rem] text-start">{getValue<string>()}</p>
        ),
        enableColumnFilter: false,
        meta: {
            icon: BriefcaseBusiness
        }
    },
    {
        accessorKey: "price",
        header: "SRP",
        cell: ({ row }) => {
            const item: number = row.getValue("price");

            return <p className="text-[0.65rem]">{item ? formatAmount(item) : "---"}</p>;
        },
        filterFn: (row, _, filterValue) => {
            const cellValue = Number(row.original.price || 0);
            const value = filterValue.value;

            switch (filterValue.condition) {
                case "is":
                    return cellValue === Number(value);
                case "between": {
                    const from = Number(value.from);
                    const to = Number(value.to);

                    if (from !== 0 && to === 0) {
                        // from -> Infinity
                        return cellValue >= from;
                    }

                    if (from === 0 && to !== 0) {
                        // 0 -> to
                        return cellValue <= to;
                    }

                    return cellValue >= from && cellValue <= to;
                }
                default:
                    return true;
            }
        },
        meta: {
            filterType: "price_range",
            allowedOptions: ["is", "between"],
            label: "SRP",
            icon: PhilippinePeso
        }
    },
    {
        accessorKey: "end_date",
        header: "end date",
        cell: DateCell,
        enableColumnFilter: false,
        meta: {
            icon: Calendar
        }
    },
    {
        id: "remaining_days",
        accessorFn: (row) => {
            const bookings = row.bookings;
            const siteBookings = bookings.map(sb => ({ ...sb, is_prime: row.is_prime }))

            const { current, previous } = getBookingContext(siteBookings);

            let remainingDays = row.remaining_days ?? 0;

            if (current?.booking_status === "QUEUEING") {
                const difference = differenceInCalendarDays(new Date(), current.date_from);
                if (difference >= -30) {
                    remainingDays = differenceInCalendarDays(new Date(current.date_to), new Date());
                } else {
                    remainingDays = previous ? differenceInCalendarDays(new Date(previous.date_to), new Date()) : 0;
                }
            }

            return Math.max(remainingDays, 0);
        },
        header: "days left",
        cell: ({ row }) => {
            const value: string = row.getValue("remaining_days")
            return (
                <p className="text-[0.65rem]">
                    {Number(value) > 0 ? value : "---"}
                </p>
            );
        },
        enableGlobalFilter: false,
        filterFn: (row, _, filterValue) => {
            const cellValue = Number(row.getValue("remaining_days") || 0);
            const value = filterValue.value;

            switch (filterValue.condition) {
                case "is":
                    return cellValue === Number(value);
                case "between": {
                    const from = Number(value.from);
                    const to = Number(value.to);

                    if (from !== 0 && to === 0) {
                        // from -> Infinity
                        return cellValue >= from;
                    }

                    if (from === 0 && to !== 0) {
                        // 0 -> to
                        return cellValue <= to;
                    }

                    return cellValue >= from && cellValue <= to;
                }
                default:
                    return true;
            }
        },
        meta: {
            filterType: "number_range",
            allowedOptions: ["between"],
            filterLabel: "days",
            label: "Days Left",
            icon: Calendar1
        }
    },
    {
        id: "days_vacant",
        accessorFn: (row) => {
            const bookings = row.bookings;
            const siteBookings = bookings.map(sb => ({ ...sb, is_prime: row.is_prime }))

            const { current, previous } = getBookingContext(siteBookings);

            let vacant = row.days_vacant ?? 0;

            if (current?.booking_status === "QUEUEING") {
                const difference = differenceInCalendarDays(new Date(), current.date_from);
                if (difference >= -30) {
                    vacant = differenceInCalendarDays(new Date(), new Date(current.date_to));
                } else {
                    vacant = previous ? differenceInCalendarDays(new Date(), new Date(previous.date_to)) : 0;
                }
            }

            console.log(vacant)
            return Math.max(vacant, 0);
        },
        header: "days vacant",
        cell: ({ row }) => {
            const value: string = row.getValue("days_vacant")
            return (
                <p className="text-[0.65rem]">
                    {Number(value) > 0 ? value : "---"}
                </p>
            );
        },
        enableGlobalFilter: false,
        filterFn: (row, _, filterValue) => {
            const cellValue = Number(row.getValue("days_vacant") || 0);
            const value = filterValue.value;

            switch (filterValue.condition) {
                case "is":
                    return cellValue === Number(value);
                case "between": {
                    const from = Number(value.from);
                    const to = Number(value.to);

                    if (from !== 0 && to === 0) {
                        // from -> Infinity
                        return cellValue >= from;
                    }

                    if (from === 0 && to !== 0) {
                        // 0 -> to
                        return cellValue <= to;
                    }

                    return cellValue >= from && cellValue <= to;
                }
                default:
                    return true;
            }
        },
        meta: {
            filterType: "number_range",
            allowedOptions: ["between"],
            filterLabel: "days",
            label: "Days Vacant",
            icon: Calendar1
        }
    }, {
        accessorKey: "remarks",
        header: () => {
            return <p className="text-start">remarks</p>;
        },
        cell: RemarksCell,
        enableColumnFilter: false,
        meta: {
            icon: Quote
        }
    },
    {
        id: "action",
        header: "Action",
        cell: ActionCell
    }
]
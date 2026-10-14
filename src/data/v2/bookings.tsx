import { Availability, ColumnActions } from "@/interfaces/bookings.interface";
import { ColumnDef } from "@tanstack/react-table";
import SiteCode from "../cells/bookings/site";
import { BookOpenIcon, BriefcaseBusinessIcon, Building, Calendar1Icon, CalendarIcon, GlobeIcon, PhilippinePesoIcon, QuoteIcon, RulerIcon, User2Icon } from "lucide-react";
import { getBookingContext, getCurrentBooking, isQueueing } from "@/hooks/v2/useBookings";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import { formatAmount, splitClientName } from "@/lib/format";
import Remarks from "../cells/bookings/remarks";
import Actions from "../cells/bookings/actions";


export const getColumns = (actions: Partial<ColumnActions>): ColumnDef<Availability>[] => [
    {
        accessorKey: "site_code",
        header: "Site",
        cell: SiteCode,
        enableColumnFilter: false,
        enableHiding: false,
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
        id: "site_status",
        accessorFn: (row) => row.status === 1 ? "ACTIVE" : "INACTIVE",
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
            icon: GlobeIcon
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
            icon: User2Icon
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
        id: "availability",
        accessorFn: (row) => {
            const bookings = row.bookings;
            const { current, next } = getBookingContext(bookings);

            if (next) {
                if (next.booking_status === "RENEWAL") {
                    return "BOOKED";
                }

                if (isQueueing(next)) {
                    return "QUEUEING";
                }
            }

            if (current) {
                if (isQueueing(current)) {
                    return "QUEUEING";
                } else {
                    const difference = differenceInCalendarDays(new Date(current.date_to), new Date());
                    if (difference > 60) {
                        return "BOOKED";
                    }
                }

                return "AVAILABLE";
            }

            return "AVAILABLE";
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
            icon: BookOpenIcon
        }
    },
    {
        accessorKey: "site_rental",
        header: "rental",
        cell: ({ row }) => {
            const item: number = row.getValue("site_rental");

            return <p className="text-[0.65rem]">{formatAmount(item ?? 0)}</p>;
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
            icon: PhilippinePesoIcon
        }
    },
    {
        id: "client", // required when using accessorFn
        header: "Client",
        accessorFn: (row) => {
            const booking = getCurrentBooking(row.bookings);
            if (booking) {
                const { client, product } = splitClientName(booking.client)
                return `${client}|${product}`;
            }
        },
        cell: (row) => {
            const value = row.getValue<string>();
            if (!value) return "---";

            const [client, product] = value.split("|")

            return <div className="flex flex-col leading-tight">
                <p className="text-[.6rem] text-start uppercase font-semibold">{client}</p>
                {product &&
                    <p className="text-[.55rem] text-start">{product}</p>
                }
            </div>
        },
        enableColumnFilter: false,
        meta: {
            icon: BriefcaseBusinessIcon
        }
    },
    {
        accessorKey: "srp",
        header: "SRP",
        cell: ({ row }) => {
            const item: number = row.getValue("srp");

            return <p className="text-[0.65rem]">{formatAmount(item ?? 0)}</p>;
        },
        filterFn: (row, _, filterValue) => {
            const cellValue = Number(row.original.srp || 0);
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
            icon: PhilippinePesoIcon
        }
    },
    {
        id: "end_date",
        accessorFn: (row) => {
            const booking = getCurrentBooking(row.bookings);
            if (booking) {
                if (booking.booking_status === "PRE-TERMINATION") {
                    return format(subDays(new Date(booking.date_to), 1), 'yyyy-MM-dd')
                }
                return booking.date_to;
            }
        },
        header: "end date",
        cell: (row) => {
            const value = row.getValue<string | undefined>();

            const endDate = value ? format(new Date(value), "PP") : "---";

            return <p className="text-[0.65rem]">{endDate}</p>;
        },
        enableColumnFilter: false,
        meta: {
            icon: CalendarIcon
        }
    },
    {
        id: "remaining_days",
        accessorFn: (row) => {
            const booking = getCurrentBooking(row.bookings);
            if (booking) {
                return differenceInCalendarDays(new Date(booking.date_to), new Date());
            }
            return 0;
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
            console.log(cellValue, value)

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
            icon: Calendar1Icon
        }
    },
    {
        id: "days_vacant",
        accessorFn: (row) => {
            const booking = getCurrentBooking(row.bookings);
            if (booking) {
                return differenceInCalendarDays(new Date(), new Date(booking.date_to));
            }
            return 0;
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
            icon: Calendar1Icon
        }
    },
    {
        accessorKey: "remarks",
        header: () => {
            return <p className="text-start">remarks</p>;
        },
        cell: Remarks,
        enableColumnFilter: false,
        meta: {
            icon: QuoteIcon
        }
    },
    {
        id: "action",
        header: "Action",
        enableHiding: false,
        cell: (cell) => <Actions {...cell} actions={actions} />
    }
]
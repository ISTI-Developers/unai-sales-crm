import RemarksCell from "@/components/booking/remarks.cell";
import ActionCell from "@/components/bookings/actions";
import DateCell from "@/components/bookings/date";
import Cell from "@/components/bookings/structure";
import { SiteAvailability } from "@/interfaces/sites.interface";
import { getLatestBooking } from "@/lib/fetch";
import { formatAmount } from "@/lib/format";
import { ColumnDef } from "@tanstack/react-table";
import { BookOpen, BriefcaseBusiness, Building, Calendar, Calendar1, MapPin, Monitor, PhilippinePeso, Quote, User2 } from "lucide-react";

export const columns: ColumnDef<SiteAvailability>[] = [
    {
        accessorFn: (row) => row.structure_code,
        accessorKey: "structure",
        cell: Cell,
        enableColumnFilter: false,
        meta: {
            icon: Building
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
        accessorFn: (row) => row.remaining_days ? row.remaining_days <= 60 ? "AVAILABLE" : "BOOKED" : "AVAILABLE",
        header: undefined,
        cell: undefined,
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<Date>(columnId);
            return cellValue === filterValue.value;
        },
        meta: {
            hidden: true,
            filterType: "dropdown",
            allowedOptions: ["is"],
            icon: BookOpen
        }
    },
    {
        accessorKey: "site_code",
        header: "site",
        enableColumnFilter: false,
        cell: ({ row }) => {
            const item: string = row.getValue("site_code");
            return (
                <p className="text-[0.65rem] whitespace-nowrap font-semibold">
                    {item}
                </p>
            );
        },
        meta: {
            icon: Monitor
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
            item = `${client} ${item ? `(${item})` : "---"}`;
            const siteBookings = bookings.map(sb => ({ ...sb, is_prime: row.is_prime }))

            const booking = getLatestBooking(siteBookings);

            if (booking) {
                item = booking.client
            }
            return item ?? "---";
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
        accessorKey: "remaining_days",
        header: "days left",
        cell: ({ row }) => {
            const remainingDays: number = row.getValue("remaining_days");
            return (
                <p className="text-[0.65rem]">
                    {remainingDays
                        ? formatAmount(remainingDays, { style: "decimal" })
                        : "---"}
                </p>
            );
        },
        enableGlobalFilter: false,
        filterFn: (row, _, filterValue) => {
            const cellValue = Number(row.original.remaining_days || 0);
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
        accessorKey: "days_vacant",
        header: "days vacant",
        cell: ({ row }) => {
            const daysVacant: number = row.getValue("days_vacant")
            return (
                <p className="text-[0.65rem]">
                    {daysVacant > 0 ? formatAmount(daysVacant, { style: "decimal" }) : "---"}
                </p>
            );
        },
        enableGlobalFilter: false,
        filterFn: (row, _, filterValue) => {
            const cellValue = Number(row.original.days_vacant || 0);
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
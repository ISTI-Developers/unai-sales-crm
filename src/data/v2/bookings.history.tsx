/* eslint-disable react-hooks/rules-of-hooks */
import { useAccess } from "@/hooks/useClients";
import { BookingHistory } from "@/interfaces/bookings.interface";
import { formatAmount, formatTermDetails } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { BriefcaseBusinessIcon, Building2Icon, CalendarIcon, GlobeIcon, LoaderIcon, PhilippinePesoIcon, User2Icon, UsersIcon } from "lucide-react";
import AccountExecutives from "../cells/bookings/ae";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export const columns: ColumnDef<BookingHistory>[] = [
    {
        accessorKey: "structure_code",
        id: "structure_code", // give it an id, not accessorKey
        header: "Structure Code",
        cell: ({ row }) => {
            const item = row.original;

            return (
                <div className="text-left space-y-0.5 max-w-[250px] leading-snug">
                    <p className="text-xs font-semibold space-x-1">
                        <Link to={`..?b=${row.original.ID}`} className="hover:underline">
                            {item.site_code}
                        </Link>
                        <span className="text-[0.5rem]">{`(${item.size})`}</span>
                    </p>
                    <p className={cn("text-[0.5rem] leading-none uppercase font-semibold", item.booking_status === "CANCELLED" ? "text-red-400" : "text-zinc-400")}>
                        {item.address}
                    </p>
                    <p className={cn("text-[0.5rem] uppercase leading-none", item.booking_status === "CANCELLED" ? "text-red-400" : "text-zinc-400")}>
                        {item.facing}
                    </p>
                </div>
            );
        },
        enableColumnFilter: false,
        enableHiding: false,
        meta: {
            icon: Building2Icon
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
        id: "site_status",
        accessorFn: (row) => row.status === 1 ? "ACTIVE" : row.status === 3 ? "UNDER CONSTRUCTION" : "INACTIVE",
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
        accessorKey: "client",
        header: "Client",
        cell: ({ row }) => {
            const booking = row.original;
            return <p className="text-[0.6rem] max-w-[250px] flex flex-col leading-snug uppercase whitespace-break-spaces">
                <span className="font-semibold line-clamp-2">{booking.client}</span>
                <span className={cn("text-[0.5rem]", booking.booking_status === "CANCELLED" ? "text-red-400" : "text-zinc-400")}>
                    {booking.client === booking.old_client ?
                        `Previous: Same`
                        :
                        `Previous: ${booking.old_client}`
                    }
                </span>
            </p>;
        },
        enableColumnFilter: false,
        meta: {
            icon: BriefcaseBusinessIcon
        }
    },
    {
        id: "term_details",
        accessorFn: (row) => formatTermDetails(row.date_from, row.date_to, row.monthly_rate),
        header: "term details",
        cell: ({ row }) => {
            const { access: viewBookings } = useAccess("booking.viewBookings");
            const { access: viewAllBookings } = useAccess("booking.viewAll");
            const hasAccess = viewBookings || viewAllBookings;
            const termDuration = row.getValue<string>("term_details");
            const [term] = termDuration.split("@");

            return <p className="text-[0.6rem] flex flex-col leading-snug">
                <span>{hasAccess ? termDuration : term}</span>
                {hasAccess && <span className="text-[0.5rem]">{`(from SRP of ${formatAmount(row.original.srp)})`}</span>}
            </p>;
        },
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<Date>(columnId);
            return cellValue === filterValue.value;
        },
        enableGlobalFilter: false,
        enableColumnFilter: false,
        meta: {
            icon: CalendarIcon
        }
    },
    {
        id: "account_executives",
        accessorFn: (row) => row.account_executive.split(",").map(ae => ae.trim()),
        accessorKey: "account_executive",
        header: "account executives",
        cell: ({ row }) => <AccountExecutives accounts={row.original.account_executive} />,
        enableGlobalFilter: false,
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<string>(columnId);

            switch (filterValue.condition) {
                case "is":
                    return cellValue.includes(filterValue.value);
                case "is not":
                    return !cellValue.includes(filterValue.value);
                case "contains":
                    return filterValue.value.some((val: string) => cellValue.includes(val));
                default:
                    return true;
            }
        },
        meta: {
            filterType: "dropdown",
            allowedOptions: ["is", "is not", "contains"],
            icon: UsersIcon,
            isArray: true
        }
    },
    {
        id: "booking_status",
        accessorFn: (row) => {
            const { booking_status, addendum } = row;

            if (["CANCELLED", "PRE-TERMINATION"].includes(booking_status)) {
                return booking_status;
            }
            if (addendum) {
                return addendum;
            }
            return booking_status;
        },
        header: "Status",
        cell: ({ row }) => {
            const item: string = row.getValue("booking_status");
            return <Badge variant={item === "CANCELLED" ? "destructive" : "default"} className="text-[0.5rem] leading-none px-1.5 py-1 whitespace-nowrap">{item}</Badge>
        },
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<Date>(columnId);

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
        enableGlobalFilter: false,
        meta: {
            filterType: "dropdown",
            allowedOptions: ["is", "is not", "contains"],
            icon: LoaderIcon
        }
    },
    {
        id: "modified_at",
        accessorFn: (row) => row.modified_at,
        header: "Date Created",
        cell: ({ row }) => {
            const item: string = row.original.modified_at;
            return <p className="text-[0.5rem]">{format(new Date(item), "PPP")}</p>
        },
        enableColumnFilter: false,
        enableGlobalFilter: false,
        meta: {
            label: "Date Created",
            icon: CalendarIcon
        }
    },
]
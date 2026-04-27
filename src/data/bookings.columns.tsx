import RemarksCell from "@/components/booking/remarks.cell";
import ActionCell from "@/components/bookings/actions";
import DateCell from "@/components/bookings/date";
import Cell from "@/components/bookings/structure";
import { SiteAvailability } from "@/interfaces/sites.interface";
import { getLatestBooking } from "@/lib/fetch";
import { formatAmount } from "@/lib/format";
import { ColumnDef } from "@tanstack/react-table";


export const columns: ColumnDef<SiteAvailability>[] = [
    {
        accessorKey: "structure",
        cell: Cell,
    },
    {
        accessorKey: "site_code",
        header: "site",
        cell: ({ row }) => {
            const item: string = row.getValue("site_code");
            return (
                <p className="text-[0.65rem] whitespace-nowrap font-semibold">
                    {item}
                </p>
            );
        },
    },
    {
        accessorKey: "site_rental",
        header: "rental",
        cell: ({ row }) => {
            const item: number = row.getValue("site_rental");

            return <p className="text-[0.65rem]">{item ? formatAmount(item) : "---"}</p>;
        },
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
        filterFn: "includesString", // optional but makes it text-filterable
    },
    {
        accessorKey: "end_date",
        header: "end date",
        cell: DateCell,
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
    }, {
        accessorKey: "remarks",
        header: () => {
            return <p className="text-start">remarks</p>;
        },
        cell: RemarksCell,
    },
    {
        id: "action",
        header: "Action",
        cell: ActionCell
    }
]
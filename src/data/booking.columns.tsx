import { ActionCell } from "@/components/booking/action.cell";
import { AddressCell } from "@/components/booking/address.cell";
import DateCell from "@/components/booking/date.cell";
import RemarksCell from "@/components/booking/remarks.cell";
import { Booking } from "@/hooks/useBookings";
import { useClientAccess } from "@/hooks/useClients";
import { BookingTable } from "@/interfaces/sites.interface";
import { formatAmount } from "@/lib/format";
import { useAuth } from "@/providers/auth.provider";
import { ColumnDef } from "@tanstack/react-table";
import { differenceInDays } from "date-fns";
export const useBookingColumns = () => {
  const { user } = useAuth();
  const { access } = useClientAccess(19);
  const columns: ColumnDef<BookingTable>[] = [
    {
      accessorKey: "structure",
      header: "Structure",
      cell: AddressCell,
      filterFn: (row, columnId, filterValue) => {
        const item: string = row.getValue(columnId);
        return filterValue.includes(item);
      },
    },
    {
      accessorFn: (row) => row.address,
      accessorKey: "address",
      header: () => null,
      cell: () => null,
    },
    {
      accessorKey: "site",
      header: "site",
      cell: ({ row }) => {
        const item: string = row.getValue("site");
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
        let item: number = row.getValue("site_rental");
        const bookings: Booking[] = row.original.bookings;
        if (
          bookings.filter((booking) => booking.booking_status !== "CANCELLED")
            .length > 0
        ) {
          const activeBooking = bookings.find(
            (booking) => new Date(booking.date_from) <= new Date()
          );
          if (activeBooking) {
            item = activeBooking.site_rental;
          }
        }
        return <p className="text-[0.65rem]">{formatAmount(item ?? 0)}</p>;
      },
    },
    {
      accessorKey: "product",
      header: "client",
      cell: ({ row }) => {
        const bookings: Booking[] = row.original.bookings;
        const client: string = row.original.client ?? "";
        let item: string = row.getValue("product");

        item = `${client} ${item ? `(${item})` : "---"}`;
        if (
          bookings.filter((booking) => booking.booking_status !== "CANCELLED")
            .length > 0
        ) {
          const activeBooking = bookings.find(
            (booking) => new Date(booking.date_from) <= new Date()
          );
          if (activeBooking) {
            item = activeBooking.client;
          }
        }
        return <p className="text-[0.65rem]">{item ?? "---"}</p>;
      },
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
        const item = row.original;
        let remainingDays = item.remaining_days;

        if (
          item.bookings.filter(
            (booking) => booking.booking_status !== "CANCELLED"
          ).length > 0
        ) {
          const activeBooking = item.bookings.find(
            (booking) => new Date(booking.date_from) <= new Date()
          );
          if (activeBooking) {
            remainingDays = differenceInDays(
              new Date(activeBooking.date_to),
              new Date()
            );
          }
        }
        if (item.adjusted_end_date) {
          remainingDays = differenceInDays(
            new Date(item.adjusted_end_date),
            new Date()
          );
        }
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
        const item = row.original;
        let days_vacant = item.days_vacant ?? 0;
        if (
          item.bookings.filter(
            (booking) => booking.booking_status !== "CANCELLED"
          ).length > 0
        ) {
          days_vacant = 0;
        } else {
          if (item.adjusted_end_date) {
            if (new Date(item.adjusted_end_date) > new Date()) {
              days_vacant = 0;
            } else {
              days_vacant = differenceInDays(
                new Date(item.adjusted_end_date),
                new Date()
              );
            }
          }
        }
        return (
          <p className="text-[0.65rem]">
            {days_vacant > 0 ? formatAmount(days_vacant, { style: "decimal" }) : "---"}
          </p>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: () => {
        return <p className="text-start">remarks</p>;
      },
      cell: RemarksCell,
    },
  ];
  if (user && access) {
    if (access.edit || [1, 21].includes(user.ID as number)) {
      columns.push({
        header: "Actions",
        cell: ActionCell,
      });
    }
  }

  return { columns };
};

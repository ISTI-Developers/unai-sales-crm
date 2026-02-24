import { ActionCell } from "@/components/booking/action.cell";
import { AddressCell } from "@/components/booking/address.cell";
import DateCell from "@/components/booking/date.cell";
import RemarksCell from "@/components/booking/remarks.cell";
import { Booking } from "@/hooks/useBookings";
import { BookingTable } from "@/interfaces/sites.interface";
import { formatAmount } from "@/lib/format";
import { ColumnDef } from "@tanstack/react-table";
import { addDays, differenceInDays } from "date-fns";

export const columns: ColumnDef<BookingTable>[] = [
  {
    accessorFn: (row) => {
      const item = row;
      let endDate = item.end_date;
      let remainingDays = item.remaining_days;

      const activeBooking = item.bookings.find(
        (b) => new Date(b.date_from) <= new Date() && !['CANCELLED', 'PRE-TERMINATION'].includes(b.booking_status)
      );

      endDate = activeBooking
        ? item.adjusted_end_date
          ? new Date(activeBooking.date_from) < new Date(item.adjusted_end_date)
            ? activeBooking.date_from
            : item.adjusted_end_date
          : activeBooking.date_to
        : item.adjusted_end_date ?? endDate;

      remainingDays = endDate
        ? differenceInDays(new Date(endDate), new Date())
        : undefined;

      const status =
        !remainingDays || remainingDays <= 60 ? "Available" : "Booked";

      // Return a clean, filterable string
      return `${item.structure} | ${status} | ${item.address} | ${item.facing}`;
    },
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
        bookings.filter((booking) => !['CANCELLED', 'PRE-TERMINATION'].includes(booking.booking_status))
          .length > 0
      ) {
        const activeBooking = bookings.find(
          (booking) => new Date(booking.date_from) <= new Date()
        );
        if (activeBooking) {
          item = activeBooking.site_rental;
        }
      }
      return <p className="text-[0.65rem]">{item ? formatAmount(item) : "---"}</p>;
    },
  },
  {
    id: "client", // required when using accessorFn
    header: "Client",
    accessorFn: (row) => {
      const bookings: Booking[] = row.bookings;
      const client: string = row.client ?? "";
      let item = row.product ?? "";

      // build display label
      item = `${client} ${item ? `(${item})` : "---"}`;

      // check for active bookings
      if (
        bookings.some((b) => b.booking_status !== "CANCELLED")
      ) {
        const ongoingBookings = bookings.filter(
          (booking) => new Date(booking.date_from) <= new Date() && !['CANCELLED', 'PRE-TERMINATION'].includes(booking.booking_status)
        );

        const activeBooking = ongoingBookings.find(booking => booking.booking_status !== "QUEUEING");
        if (activeBooking) {
          item = activeBooking.client;
        }
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
      const item = row.original;
      let endDate = item.end_date;
      let remainingDays = item.remaining_days;

      const ongoingBookings = item.bookings.filter(
        (booking) => new Date(booking.date_from) <= new Date() && !['CANCELLED', 'PRE-TERMINATION'].includes(booking.booking_status)
      );

      const activeBooking = ongoingBookings.find(booking => booking.booking_status !== "QUEUEING");
      endDate = activeBooking ?
        item.adjusted_end_date ?
          new Date(activeBooking.date_from) < new Date(item.adjusted_end_date) ?
            activeBooking.date_from :
            item.adjusted_end_date :
          activeBooking.date_to
        : item.adjusted_end_date ?? endDate;

      remainingDays = endDate ? differenceInDays(
        addDays(new Date(endDate), 1),
        new Date()
      ) : undefined;

      remainingDays = remainingDays ? remainingDays >= 0 ? remainingDays : undefined : undefined;
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
      let endDate = item.end_date;
      let daysVacant = item.days_vacant ?? 0;

      const ongoingBookings = item.bookings.filter(
        (booking) => new Date(booking.date_from) <= new Date() && !['CANCELLED', 'PRE-TERMINATION'].includes(booking.booking_status)
      );

      const activeBooking = ongoingBookings.find(booking => booking.booking_status !== "QUEUEING");
      endDate = activeBooking ?
        item.adjusted_end_date ?
          new Date(activeBooking.date_from) < new Date(item.adjusted_end_date) ?
            activeBooking.date_from :
            item.adjusted_end_date :
          activeBooking.date_to
        : item.adjusted_end_date ?? endDate;

      daysVacant = endDate ? differenceInDays(
        new Date(),
        new Date(endDate),
      ) : 0;

      daysVacant = daysVacant ? daysVacant >= 0 ? daysVacant : 0 : 0;
      return (
        <p className="text-[0.65rem]">
          {daysVacant > 0 ? formatAmount(daysVacant, { style: "decimal" }) : "---"}
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
  {
    id: "action",
    header: "Actions",
    cell: ActionCell,
  }
]

import {
  useBookings,
  useCancelBooking,
  usePreBookings,
} from "@/hooks/useBookings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { formatAmount, formatTermDetails } from "@/lib/format";
import { useMemo } from "react";
import { CircleSlash2, MonitorUp } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import TagBooking from "./tag.booking";
import { cn } from "@/lib/utils";
import { useAccess } from "@/hooks/useClients";

const PresiteBookings = () => {
  const { data, isLoading, isError, error } = usePreBookings();
  const { data: bookings } = useBookings();
  const { mutate } = useCancelBooking();
  const { access: edit } = useAccess("booking.viewAll");
  const { access: remove } = useAccess("bookings.delete");
  const rows = useMemo(() => {
    if (!data || isLoading || !bookings) return null;

    return data
      .filter((item) =>
        bookings.some(
          (booking) =>
            booking.ID === item.booking_id && booking.site_code === "---"
        )
      )
      .map((item) => {
        return {
          ...item,
          term_details: formatTermDetails(
            item.date_from,
            item.date_to,
            item.monthly_rate
          ),
        };
      });
  }, [bookings, data, isLoading]);

  const onCancel = (ID: number) => {
    mutate({ booking_id: ID, reason: "" });
  };

  if (isError) return <>{JSON.stringify(error)}</>;
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="uppercase">
            <TableHead>Address</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>AE</TableHead>
            <TableHead>Term Details</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Status</TableHead>
            {(edit || remove) && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows ? (
            rows.length > 0 ? (
              rows.map((row) => {
                return (
                  <TableRow
                    key={row.ID}
                    className={cn(
                      "text-xs",
                      row.booking_status === "CANCELLED"
                        ? "bg-red-200 text-red-100 pointer-events-none"
                        : ""
                    )}
                  >
                    <TableCell>
                      <div>
                        <p className="font-semibold">{row.area}</p>
                        <p className="text-[0.6rem] italic">{row.address}</p>
                      </div>
                    </TableCell>
                    <TableCell>{row.client}</TableCell>
                    <TableCell className="text-[0.65rem]">
                      {row.account_executive.split(", ").map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{row.term_details}</p>
                        <p className="text-[0.65rem]">{`(from SRP of ${formatAmount(
                          row.srp
                        )})`}</p>
                      </div>
                    </TableCell>
                    <TableCell>{row.remarks}</TableCell>
                    <TableCell>{row.booking_status}</TableCell>
                    {(edit || remove) && (
                      <TableCell>
                        {row.booking_status !== "CANCELLED" && (
                          <>
                            <AlertDialog key="tag">
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                      <MonitorUp size={16} />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Assign</TooltipContent>
                              </Tooltip>
                              <TagBooking id={row.booking_id} />
                            </AlertDialog>
                            <AlertDialog key="cancel">
                              <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                  <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                      <CircleSlash2 size={16} />
                                    </Button>
                                  </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Cancel Booking
                                  </AlertDialogTitle>
                                </AlertDialogHeader>
                                Are you sure you want to cancel this booking?
                                <AlertDialogFooter>
                                  <AlertDialogCancel>No</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onCancel(row.booking_id)}
                                  >
                                    Yes
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="text-center">
                <TableCell colSpan={7}>No bookings found.</TableCell>
              </TableRow>
            )
          ) : (
            <TableRow>No pre-site bookings found.</TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PresiteBookings;

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBookingColumns } from "@/data/booking.columns";
import { DataTable } from "@/data/data-table";
import { useBookings } from "@/hooks/useBookings";
import { useAccess } from "@/hooks/useClients";
import { useAvailableSites, useSites } from "@/hooks/useSites";
import { BookingTable } from "@/interfaces/sites.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, Navigate, Route, Routes } from "react-router-dom";

const AddNewBooking = lazy(() => import("@/pages/booking/add.booking"));
const PresiteBookings = lazy(
  () => import("@/components/booking/presite.booking")
);
const Booking = () => {
  return (
    <Container title="Booking">
      <Helmet>
        <title>Booking | Sales Platform</title>
      </Helmet>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route
          path="/new"
          element={
            <Suspense fallback={<>Loading...</>}>
              <AddNewBooking />
            </Suspense>
          }
        />
        <Route path="/*" element={<Navigate to="/booking" replace />} />
      </Routes>
    </Container>
  );
};

const Main = () => {
  const { data: sites } = useSites();
  const { data: bookings } = useBookings();
  const { data, isError, isLoading, fetchStatus, error } = useAvailableSites();
  const { columns } = useBookingColumns();
  const { access: add } = useAccess("booking.add");

  const availableSites: BookingTable[] = useMemo(() => {
    if (!sites || !data || !bookings || isLoading) return [];

    const availableSites = new Set(data.map((item) => item.site));
    const inStoredNotInAvailable = sites.filter(
      (site) => !availableSites.has(site.site_code)
    );

    const siteList = inStoredNotInAvailable.map((item) => {
      const booking = bookings.filter(
        (booking) => booking.site_code === item.site_code
      );
      return {
        structure: item.structure_code,
        site: item.site_code,
        address: item.address,
        site_rental: 0,
        facing: item.board_facing,
        bookings: booking,
        date_from: undefined,
        end_date: undefined,
        product: undefined,
        client: undefined,
        remaining_days: undefined,
        days_vacant: null,
        remarks: item.remarks,
      };
    });
    const updatedAvailability = data.map((item) => {
      const booking = bookings.filter(
        (booking) => booking.site_code === item.site
      );
      
      const site = sites.find((siteItem) => siteItem.site_code === item.site);
      return {
        structure: item.structure,
        site: item.site,
        address: item.address,
        site_rental: item.site_rental,
        facing: site?.board_facing ?? "",
        bookings: booking,
        date_from: item.date_from,
        end_date: item.end_date,
        product: item.product,
        client: item.client,
        remaining_days: item.remaining_days,
        days_vacant:
          booking.filter((book) => book.booking_status !== "CANCELLED").length >
          0
            ? null
            : item.days_vacant,
        remarks: site ? site.remarks : null,
        adjusted_end_date: item.adjusted_end_date,
        adjustment_reason: item.adjustment_reason,
      };
    });
    return [...updatedAvailability, ...siteList];
  }, [sites, data, bookings, isLoading]);

  if (isError) return <>{error}</>;

  return (
    <AnimatePresence>
      <Page>
        {isLoading
          ? fetchStatus
          : data && (
              <>
                <DataTable columns={columns} data={availableSites} size={100}>
                  <div className="flex gap-4">
                    <Dialog key="pre-site">
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          View Pre-site Bookings
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl">
                        <DialogHeader>
                          <DialogTitle>Pre-Site Bookings</DialogTitle>
                          <DialogDescription>
                            Bookings listed below needs to be tagged when a new
                            site is available.
                          </DialogDescription>
                        </DialogHeader>
                        <Suspense fallback={<>Loading...</>}>
                          <PresiteBookings />
                        </Suspense>
                      </DialogContent>
                    </Dialog>
                    {add && (
                      <Button asChild variant="outline">
                        <Link to={"./new"}>
                          <Plus />
                          <span>Add Booking</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </DataTable>
              </>
            )}
      </Page>
    </AnimatePresence>
  );
};

export default Booking;

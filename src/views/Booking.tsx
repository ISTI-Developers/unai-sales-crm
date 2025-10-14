import construction from "@/assets/UnderConstruction.svg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { columns } from "@/data/booking.columns";
import { DataTable } from "@/data/data-table";
import { useBookings } from "@/hooks/useBookings";
import { useAccess } from "@/hooks/useClients";
import { useAvailableSites, useSites } from "@/hooks/useSites";
import { AvailableSites, BookingTable } from "@/interfaces/sites.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { getQuery } from "@/providers/api";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo } from "react";
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
  const queryClient = useQueryClient();
  const { data: sites } = useSites();
  const { data: bookings } = useBookings();
  const { data, isError, isLoading, fetchStatus, error } = useAvailableSites();
  const { access: edit } = useAccess("booking.update");
  const { access: add } = useAccess("booking.add");
  const hasCache = localStorage.getItem("cachedBookings");


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
        site_rental: item.site_rental ?? 0,
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


  useEffect(() => {
    if (!hasCache) return;
    const setup = async () => {
      const cache = await getQuery<AvailableSites[]>("bookings", ["sites", "available"]);
      if (fetchStatus === "fetching" && cache?.data) {
        queryClient.setQueryData(["sites", "available"], cache.data);
      }
    };
    setup();
  }, [hasCache, queryClient, fetchStatus]);

  if (isError) return <>{error}</>;

  return (
    <AnimatePresence>
      <Page>
        <Tabs defaultValue="all">
          <TabsList className="w-full justify-start px-1 gap-1">
            <TabsTrigger value="all" className="text-xs uppercase data-[state=active]:bg-zinc-200">Site Availability</TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs uppercase data-[state=active]:bg-zinc-200">Site Bookings</TabsTrigger>
            <TabsTrigger value="pre" className="text-xs uppercase data-[state=active]:bg-zinc-200">Other (pre-site) Bookings</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <DataTable columns={columns.filter(column => {
              if (!edit) return column.id !== "action";
              return column;
            })} data={availableSites} size={100} />
          </TabsContent>
          <TabsContent value="bookings">
            <img
              src={construction}
              title="Worker illustrations by Storyset"
              className="w-full max-w-[40vw] mx-auto"
            />
          </TabsContent>
          <TabsContent value="pre">
            <div className="flex gap-4">

              {add && (
                <Button asChild variant="outline">
                  <Link to={"./new"}>
                    <Plus />
                    <span>Add Booking</span>
                  </Link>
                </Button>
              )}
            </div>
            <Suspense fallback={<>Loading...</>}>
              <PresiteBookings />
            </Suspense>

          </TabsContent>
        </Tabs>
      </Page>
    </AnimatePresence>
  );
};

export default Booking;

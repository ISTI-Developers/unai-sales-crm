import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccess } from "@/hooks/useClients";
import { useAvailableSites } from "@/hooks/useSites";
import { AvailableSites } from "@/interfaces/sites.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { getQuery } from "@/providers/api";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, Navigate, Route, Routes, useSearchParams } from "react-router-dom";

const AddNewBooking = lazy(() => import("@/pages/booking/add.booking"));
const PresiteBookings = lazy(
  () => import("@/components/booking/presite.booking")
);
const SiteBookingsTab = lazy(() => import("@/pages/booking/site.booking"))
const SiteAvailabilityTab = lazy(() => import("@/pages/booking/availability.booking"))
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
        <Route
          path="/edit"
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
  const { isError, fetchStatus, error } = useAvailableSites();
  const [params, setParams] = useSearchParams();
  const { access: add } = useAccess("booking.add");
  const hasCache = localStorage.getItem("cachedBookings");
  const [value, setValue] = useState("all");

  const onValueChange = (val: string) => {
    setValue(val);
    setParams({ t: val });
  }

  useEffect(() => {
    const tab = params.get("t");
    if (tab) {
      setValue(tab);
    }
  }, [params]);

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
        <Tabs value={value} defaultValue="all" onValueChange={onValueChange}>
          <TabsList className="w-full justify-start px-1 gap-1">
            <TabsTrigger value="all" className="text-xs uppercase data-[state=active]:bg-zinc-200">Site Availability</TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs uppercase data-[state=active]:bg-zinc-200">Site Bookings</TabsTrigger>
            <TabsTrigger value="other" className="text-xs uppercase data-[state=active]:bg-zinc-200">Other Bookings</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Suspense fallback={<>Loading tab...</>}>
              <SiteAvailabilityTab />
            </Suspense>
          </TabsContent>
          <TabsContent value="bookings">
            <Suspense fallback={<>Loading tab...</>}>
              <SiteBookingsTab />
            </Suspense>
          </TabsContent>
          <TabsContent value="other">
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

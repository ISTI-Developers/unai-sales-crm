import { useBookings } from "@/hooks/useBookings";
import { useAvailableSites, useSites } from "@/hooks/useSites";
import { differenceInDays } from "date-fns";
import { useMemo } from "react";

const useSiteSummary = () => {
  const { data: sites } = useSites();
  const { data: bookings } = useBookings();
  const { data: unis } = useAvailableSites();

  const siteAvailability = useMemo(() => {
    if (!sites || !bookings || !unis)
      return { sites: 0, available: 0, booked: 0 };

    const availableSites = new Set(unis.map((item) => item.site));
    const inStoredNotInAvailable = sites.filter(
      (site) => !availableSites.has(site.site_code)
    );

    const available = unis.filter((site) => {
      const lessThan60 = site.remaining_days
        ? site.remaining_days <= 60
        : false;
      const isVacant = Boolean(site.days_vacant);

      return lessThan60 || isVacant;
    });
    const updatedAvailability = available.filter((site) => {
      const hasBooking = bookings.filter(
        (item) => item.site_code === site.site
      );

      if (hasBooking) {
        const activeBooking = hasBooking.find(
          (booking) =>
            new Date(booking.date_from) <= new Date() &&
            booking.booking_status !== "CANCELLED"
        );
        return activeBooking
          ? differenceInDays(new Date(activeBooking.date_to), new Date()) < 60
          : true;
      }

      return true;
    });

    return {
      sites: sites.length,
      available: updatedAvailability.length + inStoredNotInAvailable.length,
      booked: sites.length - (updatedAvailability.length + inStoredNotInAvailable.length),
    };
  }, [sites, unis, bookings]);

  const groupedSitesByRegion = useMemo(() => {
    if (!sites) return [];

    const regionCountMap = sites.reduce((acc, site) => {
      const region = site.region;
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(regionCountMap).map(([region, count]) => ({
      region,
      count,
    }));
  }, [sites]);

  return { siteAvailability, groupedSitesByRegion };
};

export default useSiteSummary;

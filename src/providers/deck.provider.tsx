import { useBookings } from "@/hooks/useBookings";
import { useDeck as useOneDeck } from "@/hooks/useDeck";
import { useOverridenSiteEndDates, useSitelandmarks, useSites } from "@/hooks/useSites";
import { ProviderProps } from "@/interfaces";
import { DeckProvider as DeckProviderType, DeckSite } from "@/interfaces/deck.interface";
import { getEndDate, getLatestBooking } from "@/lib/fetch";
import { haversineDistance } from "@/lib/utils";
import { DeckFilters, DeckOptions } from "@/misc/deckTemplate";
import { addDays, differenceInCalendarDays, format, isBefore } from "date-fns";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
export const DeckProviderContext = createContext<DeckProviderType | null>(null);

export const useDeck = (): DeckProviderType => {
  const context = useContext(DeckProviderContext);

  if (context === undefined || context == null) {
    throw new Error("useDeck must be used within DeckProvider");
  }

  return context;
};

export function DeckProvider({ children }: ProviderProps) {
  const [searchParams] = useSearchParams()
  const deckID = searchParams.get("token");

  const { data: landmarks } = useSitelandmarks();
  const { data: allSites } = useSites();
  const { data: bookings } = useBookings();
  const { data: adjustments } = useOverridenSiteEndDates();
  const { data: deckData } = useOneDeck(deckID);

  const [selectedSites, setSelectedSites] = useState<DeckSite[]>([]);
  const [selectedFilters, setFilters] = useState<Partial<DeckFilters>>({});
  const [selectedOptions, setOptions] = useState<Partial<DeckOptions>>({});
  const [title, setTitle] = useState<string>("New Deck")

  const isLoading =
    !allSites ||
    !bookings ||
    !adjustments ||
    !landmarks;

  const sites: DeckSite[] = useMemo(() => {
    if (isLoading) return [];

    const activeSites = allSites.filter(site => site.status === 1);

    const contracts = activeSites.map(site => {
      const siteBookings = bookings.filter(booking => booking.site_code === site.site_code);
      const adjustment = adjustments.find(adjustment => adjustment.site_code === site.site_code);
      const booking = getLatestBooking(siteBookings);
      const endDate = getEndDate(booking, adjustment);

      const availability = endDate ? format(addDays(new Date(endDate), 1), "MMM d, yyyy") : null;

      return {
        ...site,
        availability: availability,
      }
    })
    return contracts;

  }, [isLoading, allSites, bookings, adjustments])

  const searchedSites: DeckSite[] = useMemo(() => {
    if (!sites) return sites;
    const query = selectedFilters?.search?.trim().toLowerCase();
    if (!query) return sites;
    // Detect pattern like: 4cebceb039-1aa01
    const SITE_CODE_PATTERN = /\b\d[a-z0-9]{6}\d{3}-\d[a-z]{2}\d{2}\b/;

    // Check if query looks like one or multiple site codes
    const isSiteCodeSearch = SITE_CODE_PATTERN.test(query);

    if (isSiteCodeSearch) {
      const siteCodes = query.split(/\s+/); // split by any spaces
      return sites.filter(({ site_code }) =>
        siteCodes.includes(site_code.toLowerCase())
      );
    }

    // Otherwise, do a regular text-based filter
    return sites.filter(({ site_code, address, city, client }) =>
      [site_code, address, city, client ?? ""].some((field) =>
        field.toLowerCase().includes(query)
      )
    );
  }, [sites, selectedFilters?.search]);

  const filteredSites: DeckSite[] = useMemo(() => {
    let temp = searchedSites;

    if (selectedFilters.area?.length) {
      temp = temp.filter(site =>
        selectedFilters.area!.includes(site.city)
      );
    }
    if (selectedFilters.availability && selectedFilters.availability.length > 0) {
      const availability = selectedFilters.availability;

      if (availability.includes("open")) {
        temp = temp.filter(site => {
          if (!site.availability) return true;
          return isBefore(new Date(site.availability), new Date()) || differenceInCalendarDays(new Date(site.availability), new Date()) <= 60;
        })
        console.log(temp);
      }
      if (availability.includes("booked")) {
        temp = temp.filter(site => {
          if (!site.availability) return false;

          return differenceInCalendarDays(new Date(site.availability), new Date()) > 60;
        })
      }
      if (availability.includes("range")) {
        temp = temp.filter(site => {
          if (!site.availability) return true;
          if (availability.length > 1) {
            if (isBefore(new Date(site.availability), new Date())) return true;

            const formatted = format(site.availability, "MMMM yyyy");
            return availability.includes(formatted);
          }
          return true;
        })

      }
      // temp = temp.filter(site =>
      //   selectedFilters.area!.includes(site.city)
      // );
    }

    if (selectedFilters.landmark && selectedFilters.landmark.length > 0 && landmarks) {
      const selectedLandmarks = selectedFilters.landmark
      const selectedOptions = landmarks.filter((landmark) =>
        landmark.types.some((type) => selectedLandmarks.includes(type))
      );

      temp = temp.filter(site => {
        const { latitude, longitude } = site;

        return selectedOptions.some((landmark) => {
          const { latitude: lat, longitude: lng } = landmark;
          const distance = haversineDistance(
            { lat: parseFloat(latitude), lng: parseFloat(longitude) },
            { lat: parseFloat(lat), lng: parseFloat(lng) }
          );
          return distance <= 100;
        });
      })
    }

    // PRICE filter
    if (selectedFilters.price?.length) {
      temp = temp.filter(site => {
        const price = Number(site.price); // Convert from string → number
        if (isNaN(price)) return false;   // Defensive: skip bad data

        // Check if price matches ANY range
        return selectedFilters.price?.some(range => {
          const min = range.from ?? 0;
          const max = range.to === 0 ? Infinity : range.to;

          return price >= min && price <= max;
        });
      });
    }

    if (selectedFilters.site_owner && selectedFilters.site_owner.length > 0) {
      const owner = selectedFilters.site_owner;

      temp = temp.filter(site => owner.includes(site.site_owner))
    }

    return temp;
  }, [landmarks, searchedSites, selectedFilters]);

  useEffect(() => {
    if (!deckData || !deckID || isLoading) return;

    const loadedSites = sites.filter(site =>
      deckData.sites.some(s => s.site_code === site.site_code)
    );

    console.log(deckData.filters)
    setSelectedSites(loadedSites);
    setFilters(deckData.filters ?? {});
    setOptions(deckData.options ?? {});
    setTitle(deckData.title ?? "");

    console.count(`rendering ${new Date()}`);
  }, [deckData, deckID, isLoading, sites]);


  return <DeckProviderContext.Provider value={{ sites: filteredSites, isLoading, selectedSites, selectedFilters, selectedOptions, title, setTitle, setSelectedSites, setFilters, setOptions }}>
    {children}
  </DeckProviderContext.Provider>
}
import { createMapURL, syncPackages } from "@/components/deck/helpers.deck";
import { useBookings } from "@/hooks/useBookings";
import { useDeck as useOneDeck } from "@/hooks/useDeck";
import { fetchMap, getSiteImage, useOverridenSiteEndDates, useSitelandmarks, useSites } from "@/hooks/useSites";
import { ProviderProps } from "@/interfaces";
import { DeckProvider as DeckProviderType, DeckSite, DEFAULT_OPTIONS, DEFAULTS, displayOptions, optionsBaseContent } from "@/interfaces/deck.interface";
import { getEndDate, getLatestBooking } from "@/lib/fetch";
import { haversineDistance } from "@/lib/utils";
import { DeckFilters, DeckOptions } from "@/misc/deckTemplate";
import { useQueryClient } from "@tanstack/react-query";
import { addDays, differenceInCalendarDays, format, isBefore } from "date-fns";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
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
  const queryClient = useQueryClient();

  const hydratedDeckRef = useRef<string | null>(null);
  const { data: landmarks } = useSitelandmarks();
  const { data: allSites } = useSites();
  const { data: bookings } = useBookings();
  const { data: adjustments } = useOverridenSiteEndDates();
  const { data: deckData } = useOneDeck(deckID);
  const [option, setOption] = useState<string | undefined>("site_selection")
  const [selectedSite, setSelectedSite] = useState(0);
  const [selectedSites, setSelectedSites] = useState<DeckSite[]>([]);
  const [selectedFilters, setFilters] = useState<Partial<DeckFilters>>({});
  const [selectedOptions, setOptions] = useState<DeckOptions>(DEFAULT_OPTIONS);
  const [title, setTitle] = useState<string>("New Deck")

  const isLoading =
    !allSites ||
    !bookings ||
    !adjustments ||
    !landmarks;

  const sites: DeckSite[] = useMemo(() => {
    if (isLoading) return [];

    const contracts = allSites.map(site => {
      const siteBookings = bookings.filter(booking => booking.site_code === site.site_code);
      const adjustment = adjustments.find(adjustment => adjustment.site_code === site.site_code);
      const updatedBookings = siteBookings.map(sb => ({ ...sb, is_prime: site.is_prime }))

      const booking = getLatestBooking(updatedBookings);
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
    if (selectedFilters.status && selectedFilters.status.length > 0) {
      const status = selectedFilters.status;

      temp = temp.filter(site => status.includes(site.status))
    }

    return temp;
  }, [landmarks, searchedSites, selectedFilters]);

  const toggleFilter = (key: string, remove: boolean) => {
    setOptions(prev => {
      if (!prev) return prev;

      if (remove) {
        // Remove the key from filters
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key as keyof typeof prev]: _, ...rest } = prev;
        if (key === "rate_generator" && selectedOptions.settings.rate_basis) {
          return { ...rest, display_options: displayOptions.base }
        }
        return rest;
      }
      if (key === "display_options") {
        if (selectedOptions.settings.rate_basis) {
          return { ...prev, [key]: displayOptions.withRateGenerator }
        }
        return { ...prev, [key]: displayOptions.base }
      }
      if (key === "rate_generator" && selectedOptions.settings.rate_basis) {
        return { ...prev, [key]: optionsBaseContent[key as keyof typeof optionsBaseContent], display_options: displayOptions.withRateGenerator }
      }
      return { ...prev, [key]: optionsBaseContent[key as keyof typeof optionsBaseContent] }
    })
  }

  useEffect(() => {
    if (!deckData || !deckID || isLoading) return;

    if (hydratedDeckRef.current === deckID) return;

    const siteMap = new Map(
      (deckData.sites).map(s => [s.site_code, s])
    );

    const siteCodes = new Set(deckData.sites.map(s => s.site_code));

    const loadedSites = sites.filter(site =>
      siteCodes.has(site.site_code)
    );

    setSelectedSites(prev =>
      loadedSites.map(site => {
        const existing = prev.find(s => s.site_code === site.site_code);

        return {
          ...existing, // keep local fields
          ...site,     // overwrite with fresh backend data
          image: siteMap.get(site.site_code)?.image,
        };
      })
    );

    setFilters(deckData.filters ?? {});
    setOptions(!Array.isArray(deckData.options) ? {
      rate_adjustment: deckData.options.rate_adjustment ?? [],
      currency_exchange: deckData.options.currency_exchange ?? DEFAULT_OPTIONS.currency_exchange,
      packages: Array.isArray(deckData.options.packages) ? syncPackages(deckData.options?.settings.booking_terms, deckData.options.packages) : deckData.options.packages ?? DEFAULT_OPTIONS.packages,
      add_ons: deckData.options.add_ons ?? DEFAULT_OPTIONS.add_ons,
      settings: {
        rate_basis: deckData.options?.settings.rate_basis ?? "SINGLE",
        booking_terms: deckData.options?.settings.booking_terms ?? DEFAULTS.booking_terms,
        printing_cost: deckData.options?.settings.printing_cost ?? DEFAULTS.printing_cost,
        version: 1
      }

    } : DEFAULT_OPTIONS)

    setTitle(deckData.title ?? "");
    hydratedDeckRef.current = deckID;

  }, [deckData, deckID, isLoading, sites]);

  useEffect(() => {
    if (!selectedSites.length) return;

    selectedSites.forEach(site => {
      const mapURL = createMapURL({ latitude: site.latitude, longitude: site.longitude });

      queryClient.prefetchQuery({
        queryKey: ["sites", "image", site.site_code],
        queryFn: () => getSiteImage(site.site_code, site.image),
        staleTime: Infinity,
      });

      queryClient.prefetchQuery({
        queryKey: ["map", site.site_code],
        queryFn: ({ signal }) =>
          fetchMap(site.site_code, mapURL, signal),
        staleTime: Infinity,
        gcTime: Infinity,
      });
    });
  }, [selectedSites, queryClient]);

  useEffect(() => {
    const sitesToLoad = selectedSites.filter(site => !site.url);

    if (!sitesToLoad.length) return;

    let cancelled = false;

    (async () => {
      const updates = await Promise.all(
        sitesToLoad.map(async site => {
          const data = await queryClient.fetchQuery({
            queryKey: ["sites", "image", site.site_code],
            queryFn: () => getSiteImage(site.site_code, site.image),
            staleTime: Infinity,
          });

          return {
            site_code: site.site_code,
            ...data.selectedImage,
          };
        })
      );

      if (cancelled) return;

      const updateMap = new Map(
        updates.map(update => [update.site_code, update])
      );

      setSelectedSites(prev =>
        prev.map(site => {
          const update = updateMap.get(site.site_code);
          return update ? { ...site, ...update } : site;
        })
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSites, queryClient, setSelectedSites]);

  return <DeckProviderContext.Provider value={{
    sites: filteredSites,
    selectedSite,
    isLoading,
    selectedSites,
    selectedFilters,
    selectedOptions,
    title,
    option,
    setOption,
    setTitle,
    setSelectedSite,
    setSelectedSites,
    setFilters,
    setOptions,
    toggleFilter,
  }}>
    {children}
  </DeckProviderContext.Provider>
}
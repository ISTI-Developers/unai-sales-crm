import { Booking, useBookings } from "@/hooks/useBookings";
import {
  useAvailableSites,
  useOverridenSiteEndDates,
  useSitelandmarks,
  useSites,
} from "@/hooks/useSites";
import { List, ProviderProps } from "@/interfaces";
import {
  Landmarks,
  SiteDetailswithMapping,
  SiteImage,
} from "@/interfaces/sites.interface";
import { collator } from "@/lib/format";
import { haversineDistance } from "@/lib/utils";
import { addDays, differenceInDays, format } from "date-fns";
import { createContext, useContext, useMemo, useState } from "react";
export interface DeckSite extends SiteDetailswithMapping {
  availability: string | null;
  traffic_count: number;
  vicinity_population: number;
  client?: string;
  product?: string;
}

interface Filters {
  area?: List[];
  landmarks?: List[];
  price?: {
    from: number;
    to: number;
  }[];
  availability?: List[];
}
export interface Options {
  price_adjustment?: {
    amount: number;
    type: string;
    operation: string;
    apply_to: List[];
  }[];
  rate_generator?: {
    duration: 3 | 6 | 12;
    discount: number;
    type: string;
  }[];
  currency_exchange?: {
    currency: string;
    equivalent: number;
  };
  landmark_visibility?: {
    show: boolean;
  };
}
interface SelectedOptions {
  site_code: string;
  landmarks: Landmarks[];
  images?: SiteImage;
}
interface SiteMaps {
  site_code: string;
  map: string;
}

interface DeckProvider {
  sites: DeckSite[];
  search: string;
  filters: Filters;
  options: Options;
  availability: string;
  selectedOptions: SelectedOptions[];
  toAll: boolean;
  page: number;
  setPage: (page: number) => void;
  printStatus: number[];
  isGenerating: boolean;
  setGenerateStatus: (status: boolean) => void;
  setPrintStatus: React.Dispatch<React.SetStateAction<number[]>>;
  maps: SiteMaps[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<SelectedOptions[]>>;
  setMaps: React.Dispatch<React.SetStateAction<SiteMaps[]>>;
  setOptions: React.Dispatch<React.SetStateAction<Options>>;
  setToAll: React.Dispatch<React.SetStateAction<boolean>>;
  setAvailability: React.Dispatch<React.SetStateAction<string>>;
  selectedSites: DeckSite[];
  setSelectedSites: React.Dispatch<React.SetStateAction<DeckSite[]>>;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}
const DeckProviderContext = createContext<DeckProvider | null>(null);

export const useDeck = (): DeckProvider => {
  const context = useContext(DeckProviderContext);

  if (context === undefined || context == null) {
    throw new Error("useDeck must be used within DeckProvider");
  }

  return context;
};

export function DeckProvider({ children }: ProviderProps) {
  const { data: landmarks } = useSitelandmarks();
  const { data: rawSites } = useSites();
  const { data, isLoading } = useAvailableSites();
  const { data: bookings } = useBookings()
  const { data: adjustments } = useOverridenSiteEndDates();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({
    availability: [],
  });
  const [options, setOptions] = useState<Options>({});
  const [availability, setAvailability] = useState("all");
  const [selectedSites, setSelectedSites] = useState<DeckSite[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions[]>([]);
  const [maps, setMaps] = useState<SiteMaps[]>([]);
  const [toAll, setToAll] = useState(true);
  const [printStatus, setPrintStatus] = useState<number[]>([]);
  const [isGenerating, setGenerateStatus] = useState(false)



  const sites: DeckSite[] = useMemo(() => {
    if (isLoading || !data || !rawSites || !bookings || !adjustments) return [];

    const availableSites = new Set(data.map(d => d.site));

    const inStoredButNotInAvailable = rawSites.filter(
      site => !availableSites.has(site.site_code)
    );
    const getSiteBookings = (site_code: string) => {
      const siteBookings = bookings.filter(booking => booking.site_code === site_code);

      const activeBookings = siteBookings.filter(
        (booking) => {
          const from = new Date(booking.date_from);
          const to = new Date(booking.date_to);

          // Include upcoming OR currently active bookings
          return (
            booking.booking_status !== "CANCELLED" && booking.booking_status !== "QUEUEING" &&
            (from >= new Date() || (from <= new Date() && to >= new Date()))
          );
        }).sort((a, b) => new Date(a.date_from).getTime() - new Date(b.date_from).getTime())
      return activeBookings;
    }
    // 🧠 Utility to get site availability
    const getAvailability = (siteBookings: Booking[]) => {
      if (!siteBookings.length) return null;

      const now = new Date();

      // Sort by start date
      const sorted = [...siteBookings].sort(
        (a, b) => new Date(a.date_from).getTime() - new Date(b.date_from).getTime()
      );

      // Find ongoing (now is within date range)
      const ongoing = sorted.find(
        b => new Date(b.date_from) <= now && new Date(b.date_to) >= now
      );

      // Find next booking that starts *after now*
      const next = sorted.find(b => new Date(b.date_from) > now);

      // ✅ If there's a next booking, always prioritize its end date
      if (next) {
        return next.date_to;
      }

      // Otherwise fallback to ongoing’s end
      if (ongoing) {
        return ongoing.date_to;
      }

      return null;
    };

    // 🟩 Sites currently active / available
    const mappedAvailableSites = data
      .map(item => {
        const site = rawSites.find(s => s.site_code === item.site);
        const adjustment = adjustments.find(a => a.site_code === item.site);

        if (!site) {
          return null;
        }

        const siteBookings = getSiteBookings(item.site);
        const available = getAvailability(siteBookings);

        let availability = item.end_date ? format(addDays(new Date(item.end_date),1),"MMM d, yyyy") : null;

        if (available && !adjustment) {
          availability = format(addDays(new Date(available), 1), "MMM d, yyyy");
        }
        if (adjustment && !available && item.end_date) {
          if (new Date(adjustment.adjusted_end_date) > new Date(item.end_date)) {
            availability = format(addDays(new Date(adjustment.adjusted_end_date), 1), "MMM d, yyyy");
          }
        }
        if (adjustment && available) {
          if (new Date(adjustment.adjusted_end_date) > new Date(available)) {
            availability = format(addDays(new Date(adjustment.adjusted_end_date), 1), "MMM d, yyyy");
          } else {
            availability = format(addDays(new Date(available), 1), "MMM d, yyyy");
          }
        }

        return {
          ...site,
          client: available ? siteBookings.find(booking => booking.date_to === available)?.client ?? "" : `${item.client}(${item.product})`,
          availability: availability,
        } as DeckSite;
      })
      .filter((item) => item !== null);

    // 🟦 Sites in storage but not in active list
    const mappedSites = inStoredButNotInAvailable.map(item => {
      const siteBookings = getSiteBookings(item.site_code);
      const available = getAvailability(siteBookings);

      return {
        ...item,
        availability: available ? format(addDays(new Date(available), 1), "yyyy-MM-dd") : null,
      } as DeckSite;
    });

    const finalSites = [...mappedAvailableSites ?? [], ...mappedSites];

    const uniqueSites = [
      ...new Map(finalSites.map(item => [item.ID, item])).values()
    ];
    return uniqueSites;
  }, [isLoading, data, rawSites, bookings, adjustments]);


  const searchedSites: DeckSite[] = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sites;
    // Detect pattern like: 4cebceb039-1aa01
    const SITE_CODE_PATTERN = /\b\d[a-z]{6}\d{3}-\d[a-z]{2}\d{2}\b/;

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
  }, [sites, search]);


  const filteredSites: DeckSite[] = useMemo(() => {


    return searchedSites
      .filter((site) => {
        // City filter
        if (filters.area && filters.area.length > 0) {
          const areaFilters = filters.area.map((area) => area.value);
          if (!areaFilters.includes(site.city)) return false;
        }

        if (availability || filters.availability?.length) {
          const isSpecial = ["all", "open", "booked"].includes(availability);

          if (isSpecial) {
            if (availability === "open") {
              if (!site.availability) return true;
              const availableOn = new Date(
                new Date(site.availability).setDate(
                  new Date(site.availability).getDate() + 1
                )
              );
              if (differenceInDays(availableOn, new Date()) > 60) return false;
            }

            if (availability === "booked") {
              if (!site.availability) return false;
              const availableOn = new Date(site.availability);
              if (differenceInDays(availableOn, new Date()) <= 60) return false;
            }

            // "all" means skip availability filtering (i.e., do nothing)
          } else {
            const availableFormatted = site.availability
              ? format(addDays(new Date(site.availability), 1), "MMMM yyyy")
              : "";

            const match = filters.availability?.some(
              (item) => item.value === availableFormatted
            );
            if (!match) return false;
          }
        }

        // Landmarks filter (assuming a site has `site.landmarks`)
        if (filters.landmarks && filters.landmarks.length > 0) {
          if (!landmarks) return true;
          const landmarkFilters = filters.landmarks.map((item) => item.value);
          const selectedOptions = landmarks.filter((landmark) =>
            landmark.types.some((type) => landmarkFilters.includes(type))
          );
          const { latitude, longitude } = site;

          return selectedOptions.some((landmark) => {
            const { latitude: lat, longitude: lng } = landmark;
            const distance = haversineDistance(
              { lat: parseFloat(latitude), lng: parseFloat(longitude) },
              { lat: parseFloat(lat), lng: parseFloat(lng) }
            );
            return distance <= 100;
          });
        }

        // Price filter (assumes filters.price is an array of { from, to })
        if (
          filters.price &&
          filters.price.length !== 0 &&
          filters.price.every((item) => item.from !== 0 || item.to !== 0)
        ) {
          const match = filters.price.some((range) => {
            const price = Number(site.price ?? 0);
            return price >= range.from && (range.to === 0 ? price : price <= range.to);
          });
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => collator.compare(a.site_code, b.site_code));
  }, [
    searchedSites,
    filters.area,
    filters.availability,
    filters.landmarks,
    filters.price,
    availability,
    landmarks,
  ]);

  // const processedSites = useMemo(() => {
  //   console.count("rendering processed sites");
  // }, [selectedSites])


  const value = {
    sites: filteredSites,
    availability,
    search,
    filters,
    options,
    toAll,
    setToAll,
    setSearch,
    setOptions,
    setFilters,
    setSelectedOptions,
    selectedSites,
    setAvailability,
    setSelectedSites,
    selectedOptions,
    maps,
    setMaps,
    printStatus,
    setPrintStatus,
    isGenerating,
    setGenerateStatus,
    page, setPage
  };
  return (
    <DeckProviderContext.Provider value={value}>
      {children}
    </DeckProviderContext.Provider>
  );
}

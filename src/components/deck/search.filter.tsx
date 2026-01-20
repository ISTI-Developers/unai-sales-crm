import { useMemo } from "react";
import { useDeck } from "@/providers/deck.provider copy";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import Search from "../search";

const SearchFilter = () => {
  const {
    sites,
    search,
    setSearch,
    filters,
    availability,
    selectedSites,
    setSelectedSites,
    setSelectedOptions,
  } = useDeck();
  const hasFilters = useMemo(() => {
    return (
      search.length !== 0 ||
      (filters.area && filters.area.length !== 0) ||
      (filters.availability && availability !== "all") ||
      (filters.landmarks && filters.landmarks.length !== 0) ||
      (filters.price &&
        filters.price.every((item) => item.from !== 0 || item.to !== 0))
    );
  }, [search, filters, availability]);

  const canClearAll = useMemo(() => {
    if (sites.length === 0) return false;
    return (
      sites.length === selectedSites.length ||
      (sites.length !== selectedSites.length && selectedSites.length > 0) ||
      (sites.length !== selectedSites.length &&
        selectedSites.length > 0 &&
        !hasFilters)
    );
  }, [hasFilters, sites, selectedSites]);

  const canSelectAll = useMemo(() => {
    return hasFilters && sites.length !== selectedSites.length;
  }, [hasFilters, sites.length, selectedSites.length]);

  const showSelectOrClearOption = useMemo(() => {
    return canClearAll || canSelectAll;
  }, [canClearAll, canSelectAll]);

  return (
    <>
      <div className="flex gap-2 bg-white py-2">
        <Search setValue={setSearch} className="max-w-full h-8" />

        <AnimatePresence>
          {showSelectOrClearOption && (
            <motion.div
              key="select-all"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              {canSelectAll ? (
                <Button
                  variant="ghost"
                  className="bg-main-100 text-white hover:bg-main-500 hover:text-white"
                  size="sm"
                  onClick={() => {
                    setSelectedSites([...sites]);
                    setSelectedOptions([
                      ...sites.map((site) => {
                        return {
                          site_code: site.site_code,
                          landmarks: [],
                        };
                      }),
                    ]);
                  }}
                >
                  Select All
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedSites([]);
                    setSelectedOptions([]);
                  }}
                >
                  Clear Selection
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {hasFilters && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pl-3 text-xs text-slate-400 pb-1"
          >
            {`Showing ${sites.length} site(s) matching your filters`}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchFilter;

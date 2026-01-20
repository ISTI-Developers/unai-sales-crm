import { useDeck } from "@/providers/deck.provider";
import Search from "../search";
import { ListFilter } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import SiteList from "./site.list";
import { Button } from "../ui/button";
import FiltersContent from "./filters.content";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
const SiteSelection = () => {
  const { selectedSites, selectedFilters, setFilters, sites, setSelectedSites } = useDeck();

  const [open, onOpenChange] = useState(false);

  const selectAll = () => {
    setSelectedSites((prev) => {
      const prevIds = new Set(prev.map((p) => p.site_code)); // for fast lookup

      // Add only the ones not selected yet
      const toAdd = sites.filter((s) => !prevIds.has(s.site_code));
      return [...prev, ...toAdd];
    });
  };
  const canSelectAll = useMemo(() => {
    return Object.values(selectedFilters).filter(val => typeof val !== "string").length > 0 || !!(selectedFilters.search && selectedFilters.search.length > 2)
  }, [selectedFilters]);

  const activeFilters = selectedFilters ? Object.keys(selectedFilters).filter(key => key !== "search").length : 0;
  return (
    <>
      <h1 className="font-bold uppercase text-[0.6rem]">Select Sites</h1>
      <div className="flex gap-2">
        <Search setValue={(value) => setFilters(prev => {
          return { ...prev, search: value }
        })} className="bg-white text-xs h-6" />
        <div className="relative flex items-center justify-center">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button type="button" title="Filter" className="relative" onClick={() => onOpenChange(prev => !prev)}>
                <ListFilter size={14} />
                {activeFilters > 0 &&
                  <span className="absolute -top-2 -right-[5px] text-[0.4rem] bg-black h-3 w-3 flex items-center justify-center leading-none rounded-full text-white">{activeFilters}</span>}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Filter
            </TooltipContent>
          </Tooltip>

          <AnimatePresence>
            {open && (
              <>
                {/* Panel */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-0 left-full min-w-[300px] translate-x-2 bg-white shadow border p-2 rounded-lg z-[20]"
                >
                  <FiltersContent />
                </motion.div>

                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-[000] w-full h-full fixed top-0 left-0 z-[19] cursor-pointer pointer-events-auto"
                  onClick={() => onOpenChange(false)}
                />
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      {canSelectAll &&
        <div>
          <div className="text-[0.65rem] pb-1 pl-1 text-zinc-600">{`Showing ${sites.length} results`}</div>
          <div className="flex gap-1 justify-between">
            {canSelectAll && <Button onClick={selectAll} variant="outline" className="h-6 p-0 px-2 text-[0.6rem]" size="sm">Select All</Button>}
            {selectedSites.length > 0 && <Button onClick={() => setSelectedSites([])} variant="destructive" className="h-6 p-0 px-2 text-[0.6rem]" size="sm">Clear Selected</Button>}
          </div>
        </div>
      }
      {/* SITE LIST BELOW */}
      <SiteList />
    </>
  );
};

export default SiteSelection;

import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { useDeck } from "@/providers/deck.provider";
import { Loader2 } from "lucide-react";
import { useGeneratePowerpoint } from "@/hooks/usePrint";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type HeaderProps = {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
};

const Header = ({ page, setPage }: HeaderProps) => {
  const isPageOne = page === 1;
  const isPageZero = page === 0;

  const { print } = useGeneratePowerpoint();
  const { selectedSites, printStatus } = useDeck();

  const isPrintReady = printStatus === "Deck is ready!" || printStatus === "";

  return (
    <div className="w-full bg-white z-[2] flex items-center gap-4 justify-between pl-2">
      {isPageOne && (
        <Button onClick={() => setPage(0)} variant="outline">
          Back
        </Button>
      )}

      <div className={cn("flex flex-col", isPageZero ? "mr-auto" : "mr-auto")}>
        <h1 className="font-bold">
          {isPageZero ? "Site Selection" : "Site Adjustments"}
        </h1>
        {isPageZero ? (
          <p className="text-[0.65rem] text-slate-400">
            Click the sites you wish to add to your deck.
          </p>
        ) : (
          <p className="text-[0.65rem] text-slate-400">
            Apply adjustments to your selected sites.
          </p>
        )}
      </div>
      {/* {isPageOne && (
        <div className="mr-auto">
          <Button variant="outline" size="sm">
            SELECTION SUMMARY
          </Button>
        </div>
      )} */}
      {isPageZero ? (
        <>
          <AnimatePresence>
            {selectedSites.length !== 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Tooltip delayDuration={0}>
                  <TooltipTrigger>
                    <Badge
                      variant="outline"
                      className="h-5 min-w-5 rounded-full px-2 flex items-center justify-center gap-1 font-mono tabular-nums bg-emerald-100 border-emerald-400 text-emerald-500"
                    >
                      <p>{selectedSites.length}</p>
                      <p className="text-xs">sites selected</p>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="bg-opacity-40 backdrop-blur-md text-start border border-t-white max-h-[300px] overflow-y-auto">
                    {selectedSites.map((site) => (
                      <p key={site.site}>{site.site_code}</p>
                    ))}
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            onClick={() => setPage(1)}
            variant="outline"
            className="bg-main-400 hover:bg-main-500 text-white hover:text-white"
            disabled={selectedSites.length === 0}
          >
            Next
          </Button>
        </>
      ) : (
        <Button
          onClick={print}
          variant="ghost"
          className="bg-emerald-200 text-emerald-500 hover:bg-emerald-500 hover:text-emerald-800 disabled:px-2 shadow"
          disabled={!isPrintReady}
        >
          {printStatus !== "" && printStatus !== "Deck is ready!" ? (
            <Loader2
              className="animate-spin mr-2 w-4 h-4"
              aria-label="Loading"
            />
          ) : null}
          Generate
        </Button>
      )}
    </div>
  );
};

export default Header;

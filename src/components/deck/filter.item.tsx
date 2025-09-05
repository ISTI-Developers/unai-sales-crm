import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { ReactNode } from "react";
import { useDeck } from "@/providers/deck.provider";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const FilterItem = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  const { filters, setFilters } = useDeck();
  const fields = {
    area: [],
    landmarks: [],
    price: [{ from: 0, to: 0 }],
    availability: [],
  };

  const onAdd = () => {
    setFilters((prev) => {
      return {
        ...prev,
        [label as keyof typeof filters]: fields[label as keyof typeof fields],
      };
    });
  };

  const onRemove = () => {
    setFilters((prev) => {
      delete prev[label as keyof typeof prev];

      return { ...prev };
    });
  };
  return (
    <div className="border-b-2 border-slate-300">
      <div
        className={cn(
          "flex items-center justify-between hover:bg-slate-200 duration-200 p-1.5 px-2 text-sm font-semibold"
          //   filters[label as keyof typeof filters] ? "" : ""
        )}
      >
        <p className="capitalize">{label}</p>
        <Button
          variant="ghost"
          className="hover:bg-slate-200"
          onClick={() => {
            if (filters[label as keyof typeof filters]) {
              onRemove();
            } else {
              onAdd();
            }
          }}
        >
          {filters[label as keyof typeof filters] ? (
            <Minus size={14} />
          ) : (
            <Plus size={14} />
          )}
        </Button>
      </div>
      <AnimatePresence>
        {filters[label as keyof typeof filters] && (
          <motion.div
            key="area-filter"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="p-2 space-y-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default FilterItem;

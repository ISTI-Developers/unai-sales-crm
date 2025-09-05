import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { ReactNode } from "react";
import { useDeck } from "@/providers/deck.provider";
import { AnimatePresence, motion } from "framer-motion";
import { capitalize, cn } from "@/lib/utils";

const OptionItem = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => {
  const { options, setOptions } = useDeck();
  const fields = {
    price_adjustment: [
      {
        amount: 0,
        type: "flat",
        operation: "add",
        apply_to: [],
      },
    ],
    rate_generator: [
      {
        duration: 3,
        discount: 0,
        type: "flat",
      },
      {
        duration: 6,
        discount: 0,
        type: "flat",
      },
      {
        duration: 12,
        discount: 0,
        type: "flat",
      },
    ],
    currency_exchange: { currency: "PHP", equivalent: 1 },
    landmark_visibility: { show: false },
  } satisfies typeof options;

  const onAdd = () => {
    setOptions((prev) => {
      return {
        ...prev,
        [label as keyof typeof options]: fields[label as keyof typeof fields],
      };
    });
  };

  const onRemove = () => {
    setOptions((prev) => {
      delete prev[label as keyof typeof prev];

      return { ...prev };
    });
  };
  return (
    <div className="border-b-2 border-slate-300">
      <div
        className={cn(
          "flex items-center justify-between hover:bg-slate-200 duration-200 p-1.5 px-2 text-sm font-semibold"
          //   options[label as keyof typeof options] ? "" : ""
        )}
      >
        <p className="capitalize">{capitalize(label, "_")}</p>
        <Button
          variant="ghost"
          className="hover:bg-slate-200"
          onClick={() => {
            if (options[label as keyof typeof options]) {
              onRemove();
            } else {
              onAdd();
            }
          }}
        >
          {options[label as keyof typeof options] ? (
            <Minus size={14} />
          ) : (
            <Plus size={14} />
          )}
        </Button>
      </div>
      <AnimatePresence>
        {options[label as keyof typeof options] && (
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
export default OptionItem;

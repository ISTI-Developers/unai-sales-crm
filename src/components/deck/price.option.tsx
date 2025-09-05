import { Options, useDeck } from "@/providers/deck.provider";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { MultiComboBox } from "../multicombobox";
import { useMemo } from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import { List } from "@/interfaces";
import { motion, AnimatePresence } from "framer-motion";

const PriceOption = () => {
  const { options, selectedSites, setOptions, toAll, setToAll } = useDeck();

  const siteOptions = useMemo(() => {
    return selectedSites.map((site) => ({
      id: String(site.ID),
      label: site.site_code,
      value: site.site_code,
    }));
  }, [selectedSites]);

  const canAddMoreConfigurations = useMemo(() => {
    if (!options.price_adjustment) return false;

    const adjustedSites = options.price_adjustment.flatMap(
      (item) => item.apply_to
    );

    const remainingSites = selectedSites.filter(
      (site) => !adjustedSites.some((item) => item.value === site.site_code)
    );

    return (
      !toAll &&
      selectedSites.length > adjustedSites.length &&
      remainingSites.length > 0
    );
  }, [options.price_adjustment, toAll, selectedSites]);

  const handleAdd = () => {
    setOptions((prev) => ({
      ...prev,
      price_adjustment: [
        ...(prev.price_adjustment || []),
        {
          amount: 0,
          type: "flat",
          operation: "add",
          apply_to: [],
        },
      ],
    }));
  };

  const handleRemove = (index: number) => {
    setOptions((prev) => {
      const updated = [...(prev.price_adjustment || [])];
      updated.splice(index, 1);
      return { ...prev, price_adjustment: updated };
    });
  };

  const onPriceAdjustmentChange = (
    index: number,
    field: keyof NonNullable<Options["price_adjustment"]>[0],
    value: string | List[]
  ) => {
    setOptions((prev) => {
      const adjustments = [...(prev.price_adjustment ?? [])];

      adjustments[index] = {
        ...adjustments[index],
        [field]: value,
      };

      return {
        ...prev,
        price_adjustment: adjustments,
      };
    });
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-0.5">
        <Checkbox
          id="apply"
          checked={toAll}
          onCheckedChange={(checked) => setToAll(!!checked)}
        />
        <Label htmlFor="apply">Apply adjustments to all sites</Label>
      </div>
      {options.price_adjustment &&
        options.price_adjustment.map((config, index) => {
          const remainingOptions = siteOptions.filter(
            (site) =>
              !options.price_adjustment
                ?.flatMap((item) => item.apply_to)
                ?.some((item) => item.value === site.value)
          );
          return (
            <div key={index} className="flex gap-2 items-center">
              <motion.div
                className={cn(
                  "flex flex-col gap-2 p-0 w-full transition-all border border-transparent rounded-md",
                  !toAll ? "bg-white p-2 border-slate-200" : ""
                )}
              >
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={config.operation ?? ""}
                    onValueChange={(value) =>
                      onPriceAdjustmentChange(index, "operation", value)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Operation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add (+)</SelectItem>
                      <SelectItem value="subtract">Subtract (-)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={config.amount}
                    className="bg-white"
                    placeholder="Amount"
                    onChange={(e) =>
                      onPriceAdjustmentChange(index, "amount", e.target.value)
                    }
                  />
                  <Select
                    value={config.type ?? ""}
                    onValueChange={(value) =>
                      onPriceAdjustmentChange(index, "type", value)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat (--)</SelectItem>
                      <SelectItem value="percent">Percent (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <AnimatePresence mode="wait">
                  {!toAll && (
                    <motion.div
                      key="apply-to"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MultiComboBox
                        list={remainingOptions}
                        value={config.apply_to}
                        setValue={(id) =>
                          setOptions((prev) => {
                            const adjustments = [
                              ...(prev.price_adjustment ?? []),
                            ];
                            const current = adjustments[index];
                            if (!current) return prev;

                            const found = siteOptions.find(
                              (item) => item.id === id
                            );
                            if (!found) return prev;

                            const alreadyApplied = current.apply_to.some(
                              (site) => site.id === id
                            );

                            const updatedApplyTo = alreadyApplied
                              ? current.apply_to.filter(
                                  (site) => site.id !== id
                                )
                              : [...current.apply_to, found];

                            adjustments[index] = {
                              ...current,
                              apply_to: updatedApplyTo,
                            };

                            return {
                              ...prev,
                              price_adjustment: adjustments,
                            };
                          })
                        }
                        title="sites"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              <Button
                variant="outline"
                className={cn(
                  "h-6 text-red-300 transition-all",
                  !toAll && (options.price_adjustment?.length ?? 0) > 1
                    ? "mx-0 w-6 p-1 opacity-100"
                    : "-mx-1 w-0 p-0 pointer-events-none opacity-0"
                )}
                onClick={() => handleRemove(index)}
              >
                <Minus size={16} />
              </Button>
            </div>
          );
        })}
      {canAddMoreConfigurations && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={options.price_adjustment?.some(
            (item) => item.apply_to.length === 0
          )}
        >
          <Plus size={16} className="mr-1" />
          Add new
        </Button>
      )}
    </div>
  );
};

export default PriceOption;

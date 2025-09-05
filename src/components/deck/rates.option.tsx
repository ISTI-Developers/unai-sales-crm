import { Options, useDeck } from "@/providers/deck.provider";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const RatesGeneratorOption = () => {
  const { options, setOptions } = useDeck();
  const onPriceAdjustmentChange = (
    index: number,
    field: keyof NonNullable<Options["rate_generator"]>[0],
    value: string | number
  ) => {
    setOptions((prev) => {
      const adjustments = [...(prev.rate_generator ?? [])];

      adjustments[index] = {
        ...adjustments[index],
        [field]: value,
      };

      return {
        ...prev,
        rate_generator: adjustments,
      };
    });
  };
  return (
    <div className="space-y-2 text-sm">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-4 font-semibold">
          <p>Duration</p>
          <p>Discount</p>
          <p>Type</p>
        </div>
        {options.rate_generator &&
          options.rate_generator.map((config, index) => {
            return (
              <div key={config.duration} className="grid grid-cols-3 gap-4 items-center">
                <p>{config.duration} months</p>
                <Input
                  type="number"
                  className="bg-white"
                  value={config.discount}
                  onChange={(e) =>
                    onPriceAdjustmentChange(
                      index,
                      "discount",
                      Number(e.target.value ?? 0)
                    )
                  }
                />
                <Select
                  value={config.type ?? ""}
                  onValueChange={(value) =>
                    onPriceAdjustmentChange(index, "type", value)
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat (--)</SelectItem>
                    <SelectItem value="percent">Percent (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default RatesGeneratorOption;

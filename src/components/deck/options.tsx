import { Label } from "../ui/label";
import { Settings } from "lucide-react";
import OptionItem from "./option.item";
import PriceOption from "./price.option";
import CurrencyExchangeOption from "./currency.option";
import RatesGeneratorOption from "./rates.option";
import LandmarkVisibilityOptions from "./landmark.options";
const Options = () => {
  return (
    <div className="p-4 bg-slate-100 h-[calc(100vh-9.75rem)] rounded-lg overflow-y-auto">
      <div className="flex justify-between items-center">
        <Label className="flex gap-2 items-center border-b-2 border-slate-300 w-full pb-2">
          <Settings size={16} />
          <p className="font-semibold">Deck Options</p>
        </Label>
      </div>
      <div className="flex flex-col gap-2">
        <OptionItem label="price_adjustment">
          <PriceOption />
        </OptionItem>
        <OptionItem label="rate_generator">
          <RatesGeneratorOption />
        </OptionItem>
        <OptionItem label="currency_exchange">
          <CurrencyExchangeOption />
        </OptionItem>
        <OptionItem label="landmark_visibility">
          <LandmarkVisibilityOptions />
        </OptionItem>
      </div>
    </div>
  );
};

export default Options;

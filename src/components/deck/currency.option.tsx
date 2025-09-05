import { useDeck } from "@/providers/deck.provider";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const CurrencyExchangeOption = () => {
  const { options, setOptions } = useDeck();
  const currencyOptions = ["PHP", "USD", "EUR", "JPY"];
  return (
    <div className="space-y-2">
      <p className="text-sm">
        Choose your preferred currency and its conversion rate to PHP. For
        reference, see the{" "}
        <a
          className="underline text-sky-500"
          target="_blank"
          rel="noopener"
          href="https://www.bsp.gov.ph/sitepages/statistics/exchangerate.aspx"
        >
          BSP Exchange Rate
        </a>{" "}
        for up-to-date values.
      </p>
      <div>
        <Label>Currency</Label>
        <Select
          value={options.currency_exchange?.currency ?? ""}
          onValueChange={(value) =>
            setOptions((prev) => {
              return {
                ...prev,
                currency_exchange: {
                  currency: value,
                  equivalent: prev.currency_exchange?.equivalent ?? 1,
                },
              };
            })
          }
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {currencyOptions.map((currency) => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>PESO Equivalent</Label>
        <Input
          className="bg-white"
          type="number"
          value={options.currency_exchange?.equivalent ?? 0}
          onChange={(e) =>
            setOptions((prev) => {
              return {
                ...prev,
                currency_exchange: {
                  currency: prev.currency_exchange?.currency ?? "PHP",
                  equivalent: Number(e.target.value ?? 1),
                },
              };
            })
          }
        />
      </div>
    </div>
  );
};

export default CurrencyExchangeOption;

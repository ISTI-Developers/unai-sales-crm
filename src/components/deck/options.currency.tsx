import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useDeck } from '@/providers/deck.provider';
import InputNumber from '../ui/number-input';

const CurrencyExchangeOption = () => {
    const { selectedOptions, setOptions } = useDeck();
    const currencyOptions = ["PHP", "USD", "EUR", "JPY"];
    return (
        <>
            <p className="text-[0.6rem] leading-tight">
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
                <Label className='text-[0.6rem] uppercase font-semibold'>Currency</Label>
                <Select
                    value={selectedOptions.currency_exchange?.currency ?? ""}
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
                    <SelectTrigger className='h-7 bg-white text-xs'>
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
                <Label className='text-[0.6rem] uppercase font-semibold'>PESO Equivalent</Label>
                <InputNumber
                    className='h-7 bg-white text-xs'
                    type="number"
                    value={selectedOptions.currency_exchange?.equivalent ?? 0}
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
            {/* <Label className='text-[0.6rem] uppercase font-semibold'></Label> */}
        </>
    )
}

export default CurrencyExchangeOption
import { useDeck } from "@/providers/deck.provider"
import { Label } from "../ui/label"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { RateBasis } from "@/misc/deckTemplate";
import { cn } from "@/lib/utils";
import InputNumber from "../ui/number-input";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DEFAULTS } from "@/interfaces/deck.interface";
import { ScrollArea } from "../ui/scroll-area";
import { createAddOn, syncAddOns, syncPackages } from "./helpers.deck";

function DeckSettings() {
    const { selectedOptions, setOptions } = useDeck();

    const { rate_basis, booking_terms, printing_cost } = selectedOptions.settings;


    const handleChangeBasis = (value: RateBasis) => {
        const bookingTerms = value === "MULTIPLE"
            ? [
                { duration: 3, label: "3 Months" },
                { duration: 6, label: "6 Months" },
                { duration: 12, label: "12 Months" },
            ]
            : DEFAULTS.booking_terms
        setOptions(prev => {
            let addOns = prev.add_ons;
            if (
                value === "MULTIPLE" &&
                !addOns.some(a => a.key === "installation_dismantling")
            ) {
                addOns = [
                    ...addOns,
                    createAddOn(
                        "installation_dismantling",
                        "Installation & Dismantling",
                        bookingTerms,
                        value
                    ),
                ];
            }
            return {
                ...prev,
                settings: {
                    ...prev.settings,
                    rate_basis: value,
                    booking_terms: bookingTerms,
                },
                packages: syncPackages(bookingTerms, prev.packages),
                add_ons: syncAddOns(bookingTerms, addOns)
            }
        });
    };
    return (
        <div className="p-2 lg:pl-0 flex flex-col gap-2">
            <h1 className="font-bold uppercase text-[0.6rem]">Settings</h1>
            <ScrollArea className="h-[50vh] lg:h-[82vh]">
                <div className="space-y-2 pb-2">
                    <section className="space-y-1">
                        <Label>Rate Basis</Label>
                        <RadioGroup value={rate_basis} onValueChange={(value) => {
                            handleChangeBasis(value as RateBasis)
                        }}>
                            <Label id="rate-basis-monthly" className={cn("relative border-2 p-2 rounded-lg transition-all", selectedOptions.settings.rate_basis === "SINGLE" ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "")}>
                                <h1 className="text-xs uppercase font-bold">Single</h1>
                                <span className="text-[0.65rem] text-normal">Standard monthly rate for each site or given term length</span>
                                <RadioGroupItem value="SINGLE" id="rate-basis-monthly" className="absolute top-2 right-2" />
                            </Label>
                            <Label id="rate-basis-terms" className={cn("relative border-2 p-2 rounded-lg transition-all", selectedOptions.settings.rate_basis === "MULTIPLE" ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "")}>
                                <h1 className="text-xs uppercase font-bold">Multiple</h1>
                                <span className="text-[0.65rem] text-normal">Rates are displayed based on term lengths.</span>
                                <RadioGroupItem value="MULTIPLE" id="rate-basis-terms" className="absolute top-2 right-2" />
                            </Label>
                        </RadioGroup>
                    </section>
                    <hr />
                    <section className="space-y-1">
                        <Label>Months</Label>
                        <div className="flex flex-col gap-2">
                            {booking_terms.map((item, index) => {
                                return <div key={index} className={cn("grid gap-2", booking_terms.length > 1 ? "grid-cols-[1fr_auto]" : "")}>
                                    <Input
                                        value={item.duration}
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            const duration = isNaN(value) ? 0 : value;

                                            setOptions(prev => {
                                                const bookingTerms = prev.settings.booking_terms.map((term, i) =>
                                                    i === index
                                                        ? {
                                                            ...term,
                                                            duration,
                                                            label: `${duration} Months`,
                                                        }
                                                        : term
                                                );

                                                return {
                                                    ...prev,
                                                    settings: {
                                                        ...prev.settings,
                                                        booking_terms: bookingTerms,
                                                    },
                                                    packages: syncPackages(bookingTerms, prev.packages),
                                                    add_ons: syncAddOns(bookingTerms, prev.add_ons),
                                                };
                                            });
                                        }}
                                    />
                                    {/* <Input className="w-full" value={item.label} /> */}
                                    {booking_terms.length > 1 &&
                                        <Button variant="destructive" size="icon" onClick={() => {
                                            setOptions(prev => {
                                                const bookingTerms = prev.settings.booking_terms.filter((_, i) => i !== index)
                                                return {
                                                    ...prev,
                                                    settings: {
                                                        ...prev.settings,
                                                        booking_terms: bookingTerms,
                                                    },
                                                    packages: syncPackages(bookingTerms, prev.packages),
                                                    add_ons: syncAddOns(bookingTerms, prev.add_ons),
                                                }
                                            });
                                        }}>
                                            <Minus />
                                        </Button>
                                    }
                                </div>
                            })}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button disabled={rate_basis === "SINGLE"} size="sm" variant="outline" className="w-fit ml-auto disabled:pointer-events-auto" onClick={() => {
                                        const duration = booking_terms[booking_terms.length - 1].duration + 1;
                                        setOptions(prev => ({
                                            ...prev,
                                            settings: {
                                                ...prev.settings,
                                                booking_terms: [
                                                    ...prev.settings.booking_terms,
                                                    {
                                                        duration: duration,
                                                        label: `${duration} Months`,
                                                    },
                                                ],
                                            },
                                            packages: {
                                                ...prev.packages,
                                                [duration]: { value: 0, type: "FLAT" }
                                            },
                                            add_ons: syncAddOns([
                                                ...prev.settings.booking_terms,
                                                {
                                                    duration: duration,
                                                    label: `${duration} Months`,
                                                },
                                            ], prev.add_ons)
                                        }));
                                    }}>
                                        <Plus />
                                        Add Month
                                    </Button>
                                </TooltipTrigger>
                                {rate_basis === "SINGLE" && <TooltipContent>Change the rate basis to MULTIPLE to add months.</TooltipContent>}
                            </Tooltip>
                        </div>
                    </section>
                    <hr />
                    <section className="space-y-1">
                        <Label>Printing Cost</Label>
                        <div className="flex flex-col gap-1">
                            {Object.entries(printing_cost).map(([key, value]) => (
                                <div key={key} className="grid grid-cols-2 items-center">
                                    <span className="uppercase text-xs font-semibold">{key.replace(/_/g, " ")}</span>
                                    <InputNumber
                                        value={value}
                                        onChange={(e) =>
                                            setOptions(prev => ({
                                                ...prev,
                                                settings: {
                                                    ...prev.settings,
                                                    printing_cost: {
                                                        ...prev.settings.printing_cost,
                                                        [key]: e.target.value ?? 0,
                                                    },
                                                },
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </ScrollArea>
        </div>
    )
}



export default DeckSettings
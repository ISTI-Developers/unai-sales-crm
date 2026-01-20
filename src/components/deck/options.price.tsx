import { useMemo } from 'react'
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useDeck } from '@/providers/deck.provider';
import { PriceAdjustment, PriceRange, Range, Sites } from '@/misc/deckTemplate';
import InputNumber from '../ui/number-input';
import { Button } from '../ui/button';
import { PhilippinePeso, PlusIcon, Trash2 } from 'lucide-react';
import MultiComboBoxWithAll from '../multicomboboxwithall';
import { priceAdjustment } from '@/interfaces/deck.interface';
import { v4 } from 'uuid';
const PriceAdjustmentOption = () => {
    const { selectedOptions, selectedSites, setOptions } = useDeck();

    const max = useMemo(() => {
        return Math.max(...selectedSites.map(x => Number(x.price)));
    }, [selectedSites]);

    if (!selectedOptions.price_adjustment) return;

    return (
        <>
            {selectedOptions.price_adjustment.map(adjustment => {
                return <div className='flex flex-col gap-1 bg-zinc-200 p-2 rounded-lg relative'>
                    <PriceAdjustmentField max={max} {...adjustment} />
                </div>
            })}
            <Button disabled={selectedSites.length === 1 || selectedOptions.price_adjustment.some(adj => adj.apply_to === "ALL")} className='h-7 w-fit text-[0.65rem] px-2 pl-1.5 ml-auto' size={"sm"} variant={"outline"} onClick={() => {
                setOptions(prev => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        price_adjustment: [...prev.price_adjustment!, { ...priceAdjustment, id: v4(), apply_to: { type: "sites", list: [] } }]
                    };
                });
            }}>
                <PlusIcon />
                <p>Add New</p>
            </Button>
        </>
    )
}

const PriceAdjustmentField = ({ max = 999999, amount, operation, type, apply_to, id }: { max?: number; } & PriceAdjustment) => {

    const { setOptions, selectedSites, selectedOptions } = useDeck();

    const applyTo = useMemo(() => {
        if (apply_to === "ALL") return apply_to;

        if (apply_to.type === "sites") return "SITES";

        return "PRICE_RANGE";
    }, [apply_to])

    const onChange = (key: string, value: string | number) => {
        let val: string | number | Sites | Range = value;
        if (key === "apply_to") {
            if (value === "SITES") {
                val = {
                    type: "sites",
                    list: [],
                }
            } else if (value === "PRICE_RANGE") {
                val = {
                    type: "range",
                    range: {
                        from: 0,
                        to: max
                    }
                }
            }
        }
        setOptions(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                price_adjustment: prev.price_adjustment?.map(adj =>
                    adj.id === id
                        ? { ...adj, amount: key === "type" ? 0 : adj.amount, [key]: key === "amount" ? Number(val) : val } // update only one key
                        : adj
                )
            };
        });
    }

    return <>
        {selectedOptions.price_adjustment!.length > 1 && <button type='button' className='absolute top-1 right-1 h-5 w-5 bg-red-400 flex items-center justify-center text-white rounded-md' onClick={() => setOptions(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                price_adjustment: prev.price_adjustment?.filter(adj => adj.id !== id)
            }
        })}>
            <Trash2 size={12} />
        </button>}
        <Label className='text-[0.6rem] uppercase font-semibold'>Amount:</Label>
        <div className='flex items-center bg-white rounded-md shadow'>
            <Select value={operation} onValueChange={(value) => onChange("operation", value)}>
                <SelectTrigger showIcon={false} className='border-none shadow-none w-fit px-2 pl-3 h-7'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='+'>+</SelectItem>
                    <SelectItem value='-'>-</SelectItem>
                </SelectContent>
            </Select>
            <InputNumber min={0} max={type === "%" ? 100 : max} value={amount} className='h-7 border-none shadow-none text-end' onChange={(e) => onChange("amount", e.target.value)} />
            <Select value={type} onValueChange={(value) => onChange("type", value)}>
                <SelectTrigger showIcon={false} className='border-none shadow-none w-fit px-2 pr-3 h-7'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='---'>--</SelectItem>
                    <SelectItem value='%'>%</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className='flex items-center gap-1 pt-1'>
            <Label className='text-[0.55rem] uppercase font-semibold'>Apply to:</Label>
            <Select value={applyTo} onValueChange={(value) => onChange("apply_to", value)}>
                <SelectTrigger className='h-7 bg-white text-xs w-fit'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='ALL' disabled={selectedOptions.price_adjustment?.findIndex(adj => adj.id === id) !== 0}>All</SelectItem>
                    <SelectItem value='SITES' disabled={selectedSites.length < 2}>Select Sites</SelectItem>
                    <SelectItem value='PRICE_RANGE' disabled={selectedSites.length < 2}>Price Range</SelectItem>
                </SelectContent>
            </Select>
        </div>
        {apply_to !== "ALL" && apply_to.type === "sites" &&
            <AdjustmentSiteOptions value={apply_to} onValueChange={(value) => {
                setOptions(prev => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        price_adjustment: prev.price_adjustment?.map(adj => adj.id === id ? {
                            ...adj, apply_to: {
                                type: "sites",
                                list: value
                            }
                        } : adj)
                    }
                })
            }} />
        }
        {apply_to !== "ALL" && apply_to.type === "range" &&
            <AdjustmentPriceOptions value={apply_to.range} max={max} onValueChange={(value, key) => {
                setOptions(prev => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        price_adjustment: prev.price_adjustment?.map(adj => adj.id === id ? {
                            ...adj, apply_to: {
                                type: "range",
                                range: {
                                    ...(
                                        typeof adj.apply_to === "object" &&
                                            "type" in adj.apply_to &&
                                            adj.apply_to.type === "range"
                                            ? adj.apply_to.range
                                            : { from: 0, to: max }
                                    ),
                                    [key]: Number(value)
                                }
                            }
                        } : adj)
                    }
                })
            }} />}
    </>
}

const AdjustmentSiteOptions = ({ value, onValueChange }: { value: Sites; onValueChange: (value: string[]) => void }) => {
    const { selectedSites } = useDeck();

    const options = useMemo(() => {
        // Filter out sites already selected
        return selectedSites
            // .filter(site => !alreadySelectedSites.includes(site.site_code))
            .map(site => site.site_code);
    }, [selectedSites]);

    // console.log(options);
    return <div className='flex items-center gap-1 pt-1'>
        <Label className='text-[0.55rem] uppercase font-semibold'>SELECT:</Label>
        <MultiComboBoxWithAll value={value.list} options={options} onValueChange={onValueChange} />
    </div>
}

const AdjustmentPriceOptions = ({ value, onValueChange }: { value: PriceRange; max: number; onValueChange: (value: string, key: string) => void }) => {

    return (
        <div>
            <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1 bg-white pl-1 rounded-md'>
                    <PhilippinePeso size={14} />
                    <InputNumber className='focus-visible:ring-0 border-none shadow-none h-7 w-full pl-0' value={value.from} onChange={(e) => onValueChange(e.target.value, "from")} />
                </div>
                <span>-</span>
                <div className='flex items-center gap-1 bg-white pl-1 rounded-md'>
                    <PhilippinePeso size={14} />
                    <InputNumber className='focus-visible:ring-0 border-none shadow-none h-7 w-full pl-0' value={value.to} onChange={(e) => onValueChange(e.target.value, "to")} />
                </div>
            </div>
        </div>
    )
}

export default PriceAdjustmentOption
import { useDeck } from '@/providers/deck.provider'
import { Button } from '../ui/button';
import { ADD_ON_TEMPLATES } from '@/interfaces/deck.interface';
import { Label } from '../ui/label';
import InputNumber from '../ui/number-input';
import { Trash2 } from 'lucide-react';
import { Switch } from '../ui/switch';
import { createAddOn } from './helpers.deck';
import { ScrollArea } from '../ui/scroll-area';

function AddOn() {
    const { selectedOptions, setOptions } = useDeck();
    const { add_ons, settings } = selectedOptions;

    return (
        <div className='flex flex-col gap-4 h-[50vh]'>
            <h1 className="font-bold uppercase text-[0.6rem]">Add Ons</h1>
            <ScrollArea className='h-[55vh] lg:h-full'>
                <div className='flex flex-col gap-4'>
                    {add_ons.map((addOn, addOnIndex) => {
                        return <section key={addOn.key} className='space-y-2'>
                            <Label className='flex items-center justify-between'>
                                <p>{addOn.label}</p>
                                <Button
                                    className="size-6"
                                    size="icon"
                                    variant="destructive"
                                    onClick={() =>
                                        setOptions(prev => ({
                                            ...prev,
                                            add_ons: prev.add_ons.filter(a => a.key !== addOn.key),
                                        }))
                                    }
                                >
                                    <Trash2 />
                                </Button>
                            </Label>
                            {Object.entries(addOn.rates).map(([duration, rate]) => {
                                return <div key={duration} className='grid grid-cols-2 gap-2 items-center'>
                                    {settings.rate_basis === "SINGLE" ?
                                        <Label>FREE #</Label>
                                        : <Label>{duration} Months</Label>}
                                    <div className='flex flex-col gap-2'>
                                        {addOn.key === "material_printing" && settings.rate_basis === "MULTIPLE" &&
                                            <div className='flex items-center justify-end gap-1'>
                                                <Label>Free?</Label>
                                                <Switch
                                                    checked={rate.type === "FREE"}
                                                    onCheckedChange={(checked) => {
                                                        setOptions(prev => ({
                                                            ...prev,
                                                            add_ons: prev.add_ons.map((a, i) =>
                                                                i === addOnIndex
                                                                    ? {
                                                                        ...a,
                                                                        rates: {
                                                                            ...a.rates,
                                                                            [Number(duration)]: {
                                                                                ...a.rates[Number(duration)],
                                                                                type: checked ? "FREE" : "PAID",
                                                                            },
                                                                        },
                                                                    }
                                                                    : a
                                                            ),
                                                        }));
                                                    }}
                                                />
                                            </div>
                                        }
                                        {rate.type === "FREE" &&
                                            <InputNumber
                                                value={rate.value}
                                                isMoney={false}
                                                onChange={(e) => {
                                                    const value = Number(e.target.value);

                                                    setOptions(prev => ({
                                                        ...prev,
                                                        add_ons: prev.add_ons.map((a, i) =>
                                                            i === addOnIndex
                                                                ? {
                                                                    ...a,
                                                                    rates: {
                                                                        ...a.rates,
                                                                        [Number(duration)]: {
                                                                            ...a.rates[Number(duration)],
                                                                            value: isNaN(value) ? 0 : value,
                                                                        },
                                                                    },
                                                                }
                                                                : a
                                                        ),
                                                    }));
                                                }}
                                            />
                                        }
                                    </div>
                                </div>
                            })}
                        </section>
                    })}
                </div>
                {ADD_ON_TEMPLATES.map(addOn => {
                    const hasAddOn = add_ons.some(ao => ao.key === addOn.key);
                    return !hasAddOn && <Button
                        variant="outline"
                        size="sm"
                        className='w-full'
                        onClick={() =>
                            setOptions(prev => ({
                                ...prev,
                                add_ons: [
                                    ...prev.add_ons,
                                    createAddOn(
                                        addOn.key,
                                        addOn.label,
                                        prev.settings.booking_terms,
                                        prev.settings.rate_basis
                                    ),
                                ],
                            }))
                        }
                    >
                        Add {addOn.label}
                    </Button>
                })}
            </ScrollArea >
        </div>

    )
}

export default AddOn
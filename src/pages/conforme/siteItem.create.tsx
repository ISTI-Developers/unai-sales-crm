import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/datepicker';
import { Label } from '@/components/ui/label';
import InputNumber from '@/components/ui/number-input';
import { Separator } from '@/components/ui/separator';
import SiteCombobox from '@/components/ui/site-combobox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Cart, SiteRow } from '@/interfaces/requests.interface';
import { Site } from '@/interfaces/sites.interface';
import { formatAmount } from '@/lib/format';
import { cn, getAddOnTotal, getSiteInstallationCost, getSiteMaterial } from '@/lib/utils';
import { ChevronsDownUp, ChevronsUpDown, RotateCcw, Trash2Icon } from 'lucide-react';
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { LEDContainer } from './create';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import LEDSelector from '@/components/conforme/led-selector';
import { addDays, differenceInMonths } from 'date-fns';

interface SiteItemProps {
    item: SiteRow;
    index: number;
    cart: Cart;
    setCart: Dispatch<SetStateAction<Cart>>;
}
function SiteItem({ item, cart, setCart, index }: SiteItemProps) {
    const [open, setOpen] = useState(false);
    const [expand, setExpand] = useState(false);
    const isSiteEmpty = !item.site || Object.keys(item.site).length === 0;
    const hasAddOns = item.add_ons.installation !== 0 || item.add_ons.material !== 0 || item.add_ons.site;

    const removeSite = (index: number) => {
        setCart(prev => ({
            ...prev,
            sites: prev.sites.filter((_, i) => i !== index),
        }));
    };

    const addOnTotal = getAddOnTotal(item);
    const monthDifference = useMemo(() => differenceInMonths(addDays(item.date.to, 2), item.date.from), [item.date]);

    return <div className='border rounded-lg p-4 flex flex-col gap-4'>
        <header className='relative'>
            {item.site &&
                <>
                    {item.site.ID ?
                        <div className='flex gap-4 items-center'>
                            <div>
                                <p className='font-semibold'>{`${item.site.site_code} (${item.site.size})`}</p>
                                <p className='text-[0.65rem] leading-tight'>{item.site.address}</p>
                                <p className='text-[0.65rem] leading-tight'>{item.site.board_facing}</p>
                            </div>
                            <Button type='button' className='' variant="outline" size="sm" onClick={() => setCart((prev) => ({
                                ...prev,
                                sites: prev.sites.map((row, i) =>
                                    i === index
                                        ? {
                                            ...row,
                                            site: {} as Site,
                                        }
                                        : row
                                ),
                            }))}>
                                <RotateCcw />
                                <p>Change Site</p>
                            </Button>
                        </div> :
                        <SiteCombobox
                            value={item.site}
                            selectedSites={cart.sites
                                .filter((_, i) => i !== index)
                                .map(row => row.site)}
                            onValueChange={(site) => {
                                setCart((prev) => ({
                                    ...prev,
                                    sites: prev.sites.map((row, i) =>
                                        i === index
                                            ? {
                                                ...row,
                                                site: site,
                                                srp: site.price,
                                                package_rate: "0"
                                            }
                                            : row
                                    ),
                                }));
                            }}
                        />}
                </>
            }
            <div className='absolute top-0 right-0 flex gap-1'>
                <Button variant="ghost" size="icon" className='text-red-600' onClick={() => removeSite(index)} ><Trash2Icon /></Button>
            </div>
        </header>
        <main
            data-disabled={isSiteEmpty}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_2fr_1fr] gap-4 items-start data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[disabled=true]:select-none"
        >
            <div>
                <Label>From</Label>
                <DatePicker
                    date={item.date.from}
                    disabled={isSiteEmpty}
                    min={new Date()}
                    className='text-xs'
                    withIcon={false}
                    onDateChange={(value) => {
                        if (!value) {
                            value = new Date()
                        };

                        setCart((prev) => ({
                            ...prev,
                            sites: prev.sites.map((row, i) =>
                                i === index
                                    ? {
                                        ...row,
                                        date: {
                                            from: value,
                                            to: row.date.to > value ? row.date.to : value
                                        },
                                    }
                                    : row
                            ),
                        }))
                    }} />
                <div className='flex items-center gap-1 pt-2 text-xs'>
                    <Label className='text-xs'>Duration: </Label>
                    <p>{`${monthDifference} month/s`}</p>
                </div>
            </div>
            <div>
                <Label>To</Label>
                <DatePicker date={item.date.to}
                    disabled={isSiteEmpty}
                    className='text-xs'
                    min={item.date.from}
                    withIcon={false}
                    onDateChange={(value) => {
                        if (!value) {
                            value = new Date()
                        };

                        setCart((prev) => ({
                            ...prev,
                            sites: prev.sites.map((row, i) =>
                                i === index
                                    ? {
                                        ...row,
                                        date: {
                                            ...row.date,
                                            to: value
                                        },
                                    }
                                    : row
                            ),
                        }))
                    }} />
            </div>
            <div>
                <Label>Monthly SRP</Label>
                <InputNumber
                    value={item.srp}
                    disabled
                />
            </div>
            <div>
                <Label>Monthly Rate</Label>
                <InputNumber
                    value={item.package_rate}
                    disabled={isSiteEmpty}
                    onChange={(e) => {
                        setCart((prev) => ({
                            ...prev,
                            sites: prev.sites.map((row, i) =>
                                i === index
                                    ? {
                                        ...row,
                                        package_rate: e.target.value,
                                    }
                                    : row
                            ),
                        }));
                    }}
                />
            </div>

            <div className='flex flex-col gap-1'>
                <Label className='leading-1'>Free Add Ons (optional)</Label>
                <div className={cn("transition-all p-[9px] px-3 flex gap-2 border rounded-md overflow-hidden",
                    hasAddOns ? "flex-col" : "border-white p-0",
                    expand ? "max-h-[1000px]" : "max-h-[80px] flex-row items-center justify-between"
                )}>
                    {(!expand && hasAddOns) ?
                        <>
                            <p className='text-xs'>{formatAmount(addOnTotal)} <span className='text-[0.65rem] text-zinc-400'> expand to view add ons</span></p>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button type='button' onClick={() => setExpand(true)}>
                                        <ChevronsUpDown size={15} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Expand
                                </TooltipContent>
                            </Tooltip>
                        </> :
                        <>
                            {hasAddOns && <>
                                {item.add_ons.installation > 0 &&
                                    <div className='flex justify-between items-center gap-4'>
                                        <p className='text-[0.65rem]'>{item.add_ons.installation}x Installation/Dismantling</p>
                                        <p className='text-xs'>{formatAmount(getSiteInstallationCost(item.site.size, item.site.region) * item.add_ons.installation)}</p>
                                    </div>
                                }
                                {item.add_ons.material > 0 &&
                                    <div className='flex justify-between items-center'>
                                        <p className='text-[0.65rem]'>{item.add_ons.material}x Material Printing</p>
                                        <p className='text-xs'>{formatAmount(getSiteMaterial(item.site.size, item.site.site_code, item.site.region) * item.add_ons.material)}</p>
                                    </div>
                                }
                                {item.add_ons.site &&
                                    <>
                                        <Separator />
                                        <LEDContainer site={item.add_ons.site} />
                                    </>}
                                <Separator />
                                <div className='flex justify-between items-center gap-4'>
                                    <p className='text-[0.65rem]'>Grand Total</p>
                                    <p className='text-xs'>{formatAmount(getAddOnTotal(item))}</p>
                                </div>
                            </>}
                            <div className='flex gap-4'>
                                <Button type='button' onClick={() => setOpen(prev => !prev)} variant="outline" size="sm" className="w-full" disabled={isSiteEmpty}>
                                    {hasAddOns ?
                                        <p>Edit</p>
                                        :
                                        <p>Configure</p>}
                                </Button>
                                {hasAddOns &&
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button type='button' onClick={() => setExpand(false)}>
                                                <ChevronsDownUp size={15} />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Collapse
                                        </TooltipContent>
                                    </Tooltip>
                                }
                            </div>
                        </>}
                    <Dialog modal={false} open={open} onOpenChange={setOpen}>
                        {open &&
                            <div className='fixed top-0 left-0 bg-[#000]/10 w-full h-full z-[11]' onClick={() => setOpen(false)} />
                        }
                        <DialogContent aria-describedby={undefined} className='sm:max-w-2xl' onInteractOutside={(e) => {
                            e.preventDefault();
                        }}>
                            <DialogHeader>
                                <DialogTitle>Configure Add Ons</DialogTitle>
                            </DialogHeader>
                            <main className='space-y-2'>
                                <section className='grid grid-cols-2 gap-2'>
                                    <div>
                                        <Label className='text-xs'>Installation/Dismantling (qty)</Label>
                                        <Input type='number' className='w-fit' min={0} value={item.add_ons.installation} onChange={(e) => {
                                            setCart((prev) => ({
                                                ...prev,
                                                sites: prev.sites.map((row, idx) =>
                                                    idx === index
                                                        ? {
                                                            ...row,
                                                            add_ons: {
                                                                ...row.add_ons,
                                                                installation: e.target.valueAsNumber,
                                                            },
                                                        }
                                                        : row
                                                ),
                                            }));
                                        }} />
                                    </div>
                                    <div>
                                        <Label className='text-xs'>Material Printing (qty)</Label>
                                        <Input type='number' className='w-fit' min={0} value={item.add_ons.material} onChange={(e) => {
                                            setCart((prev) => ({
                                                ...prev,
                                                sites: prev.sites.map((row, idx) =>
                                                    idx === index
                                                        ? {
                                                            ...row,
                                                            add_ons: {
                                                                ...row.add_ons,
                                                                material: e.target.valueAsNumber,
                                                            },
                                                        }
                                                        : row
                                                ),
                                            }));
                                        }} />
                                    </div>
                                </section>
                                <Separator />
                                <LEDSelector item={item} index={index} setCart={setCart} />
                            </main>
                            <DialogFooter>
                                <Button type='button' onClick={() => setOpen(false)}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div>
                <Label>Net Amount</Label>
                <InputNumber
                    value={(Number(item.package_rate) * monthDifference) - addOnTotal}
                    disabled
                />
                <p className='text-[0.55rem] italic pt-2'>Monthly Rate x Term Duration - Add Ons</p>
            </div>
        </main>
    </div>
}

export default SiteItem
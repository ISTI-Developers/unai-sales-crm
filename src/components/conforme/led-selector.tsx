import { Dispatch, SetStateAction, useMemo } from 'react'
import { Label } from '../ui/label'
import { LEDBoards as data, LEDBoardConfigured, LEDBoardOption } from '@/data/LEDBoards'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import InputNumber from '../ui/number-input';
import { DatePicker } from '../ui/datepicker';
import { Separator } from '../ui/separator';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { getAddOnTotal } from '@/lib/utils';
import { Cart, SiteRow } from '@/interfaces/requests.interface';

interface LEDSelectorProps {
    item: SiteRow;
    index: number;
    setCart: Dispatch<SetStateAction<Cart>>
}
function LEDSelector({ item, index, setCart }: LEDSelectorProps) {
    const options: LEDBoardOption[] = useMemo(() => {
        if (!data) return [];

        return data.map(item => {
            return {
                ID: item.ID,
                site_code: item.site_code,
                address: item.address,
                board_facing: item.board_facing,
                size: item.size,
                spots_count: item.spots_count,
                spots_price: item.spots_price,
            }
        })
    }, [])

    const LED = useMemo(() => {
        return options.find(
            option => option.site_code === item.add_ons.site?.site_code
        );
    }, [options, item.add_ons.site?.site_code]);

    const manageSite = (index: number, site?: LEDBoardOption) => {
        let configuredSite: LEDBoardConfigured | undefined;
        if (site) {
            configuredSite = {
                site_code: site.site_code,
                address: site.address,
                spots_count: 0,
                spots_price: site.spots_price,
                from: new Date(),
                to: addDays(new Date(), 1),
            }
        }
        setCart((prev) => ({
            ...prev,
            sites: prev.sites.map((siteItem, idx) =>
                idx === index
                    ? {
                        ...siteItem,
                        add_ons: {
                            ...siteItem.add_ons,
                            site: configuredSite ?? undefined,
                        },
                    }
                    : siteItem
            ),
        }));
    }

    const onSiteDetailChange = (siteIndex: number, field: keyof LEDBoardConfigured, value: unknown) => {
        setCart((prev) => ({
            ...prev,
            sites: prev.sites.map((row, index) =>
                index === siteIndex
                    ? {
                        ...row,
                        add_ons: {
                            ...row.add_ons,
                            site: {
                                ...row.add_ons.site!,
                                [field]: value,
                            },
                        },
                    }
                    : row
            ),
        }));
    }
    return (
        <section key={item.site.ID} className='space-y-2'>
            <header>
                <Label>Digital Board Details (optional)</Label>
            </header>
            <div className='flex items-center w-full gap-4'>
                <Select value={LED?.site_code ?? ""} onValueChange={(value) => {
                    const site = options.find(opt => opt.site_code === value);
                    manageSite(index, site)
                }}>
                    <SelectTrigger className='w-full max-w-[20rem] text-start'>
                        <SelectValue placeholder="Select LED Board" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map(option => {
                            return <SelectItem value={option.site_code} key={option.site_code}>
                                <p className='font-semibold'>{option.site_code}</p>
                                <p className='text-[0.65rem]'>{option.address}</p>
                                <p className='text-[0.65rem] text-zinc-500'>{option.board_facing}</p>
                            </SelectItem>
                        })}
                    </SelectContent>
                </Select>
                {item.add_ons.site && <Button size="sm" variant="outline" className='text-[0.65rem] bg-red-200 text-red-600 border-red-400 hover:bg-red-400 hover:text-white' onClick={() => manageSite(index)}>Remove Digital Board</Button>}
            </div>
            {(LED && item.add_ons.site) && <>
                <Separator />
                <div className='flex gap-4'>
                    <div>
                        <Label className='text-[0.65rem]'>{`Spots (${LED.spots_count} available)`}</Label>
                        <Input type='number' className='w-full max-w-[150px]' min={0} max={LED.spots_count} value={item.add_ons.site.spots_count} onChange={(e) => {
                            onSiteDetailChange(index, "spots_count", e.target.value)
                        }} />
                    </div>
                    <div>
                        <Label className='text-[0.65rem]'>Rate per Spot</Label>
                        <InputNumber disabled className='w-full max-w-140px' value={item.add_ons.site.spots_price} groupClassName='w-full max-w-[150px]' min={0}
                            onChange={(e) => {
                                onSiteDetailChange(index, "spots_price", e.target.value)
                            }} />
                    </div>
                </div>
                <div className="flex gap-4 items-end">
                    <div>
                        <Label className='text-[0.65rem]'>From</Label>
                        <DatePicker date={item.add_ons.site.from} min={new Date()} onDateChange={(value) => {
                            if (!value) {
                                value = new Date()
                            };

                            onSiteDetailChange(index, "from", value)
                        }} />
                    </div>
                    <div>
                        <Label className='text-[0.65rem]'>To</Label>
                        <DatePicker date={item.add_ons.site.to} min={item.add_ons.site.from} onDateChange={(value) => {
                            if (!value) {
                                value = item.add_ons.site?.from ?? new Date()
                            };
                            onSiteDetailChange(index, "to", value)
                        }} />
                    </div>
                    {differenceInCalendarDays(item.add_ons.site.to, item.add_ons.site.from) !== 0 &&
                        <p className='pb-2'>{differenceInCalendarDays(item.add_ons.site.to, item.add_ons.site.from)} day/s</p>
                    }
                </div>
            </>}
            <Separator />
            <div>
                <Label>Add On Total</Label>
                <InputNumber disabled value={getAddOnTotal(item)} groupClassName='w-fit' />
            </div>

        </section>
    )
}

export default LEDSelector
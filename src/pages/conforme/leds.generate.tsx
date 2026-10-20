import SiteImagePicker from '@/components/site-image-picker';
import { Label } from '@/components/ui/label';
import { useImage } from '@/hooks/useSites';
import { Conforme, ConformeLED } from '@/interfaces/requests.interface';
import { formatAmount, formatDateRange } from '@/lib/format';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

interface LEDsTabProps {
    conforme: Conforme;
    setConforme: Dispatch<SetStateAction<Conforme>>
}
function LEDsTab({ conforme, setConforme }: LEDsTabProps) {
    const leds = conforme.leds;
    return (
        <div className='space-y-4'>
            {leds.map(site => {
                return <SiteItem key={site.ID} site={site} setConforme={setConforme} />
            })}
        </div>
    )
}

const SiteItem = ({ site, setConforme }: { site: ConformeLED; setConforme: Dispatch<SetStateAction<Conforme>> }) => {
    const { data } = useImage(site.site_code);
    const initializedRef = useRef(false)

    const termDate = formatDateRange(new Date(site.start), new Date(site.end));
    const days = Math.round(differenceInCalendarDays(addDays(new Date(site.end), 1), new Date(site.start)) / 30) * 30;

    const contract_rate = site.package_rate;
    let spots_count = site.spots_count;

    if (contract_rate > 0) {
        spots_count = Math.floor(contract_rate / days / site.spots_price);
    }

    const contractAmount = site.is_free ? 0 : contract_rate > 0 ? contract_rate : spots_count * days * site.spots_price;

    useEffect(() => {
        if (initializedRef.current || !data) return;
        setConforme(prev => ({
            ...prev,
            leds: prev.leds.map(item =>
                site.ID === item.ID ? { ...item, image: data.selectedImage?.url } : item
            )
        }))
        initializedRef.current = true;
    }, [data, site])

    return <div className='p-2 border rounded-lg space-y-2'>
        <main className='grid grid-cols-[auto_0.75fr_1fr] gap-4'>
            <SiteImagePicker site_code={site.site_code} value={site.image} onValueChange={(value) => setConforme(prev => ({
                ...prev,
                leds: prev.leds.map(item =>
                    site.ID === item.ID ? { ...item, image: value } : item
                )
            }))} />
            <div className='text-xs leading-tight'>
                <p className='font-semibold'>{site.site_code}</p>
                <p>{site.address}</p>
                <p className='font-light italic text-[0.65rem]'>{site.board_facing}</p>
                <p className='font-light text-[0.65rem]'>{site.size}</p>
            </div>
            <div className='text-xs leading-tight flex flex-col gap-1'>
                <div>
                    <Label className='text-[0.6rem] uppercase'>Term Duration</Label>
                    <p>{`${termDate} (${days} days)`}</p>
                </div>
                <div>
                    <Label className='text-[0.6rem] uppercase'>Spots Details</Label>
                    <p>{`${spots_count} spots/day`}</p>
                </div>
                <div>
                    <Label className='text-[0.6rem] uppercase'>Contract Amount</Label>
                    <p>{site.is_free ? `${formatAmount(contract_rate)} (FREE)` : `${formatAmount(contractAmount)} + VAT`}</p>
                </div>
            </div>
        </main>
    </div>
}

export default LEDsTab
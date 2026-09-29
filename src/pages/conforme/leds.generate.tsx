import { Label } from '@/components/ui/label';
import { Conforme, ConformeLED } from '@/interfaces/requests.interface';
import { formatAmount, formatDateRange } from '@/lib/format';
import { addDays, differenceInCalendarDays } from 'date-fns';

interface LEDsTabProps {
    conforme: Conforme;
}
function LEDsTab({ conforme }: LEDsTabProps) {
    const leds = conforme.leds;
    return (
        <div className='space-y-4'>
            {leds.map(site => {
                return <SiteItem key={site.ID} site={site} />
            })}
        </div>
    )
}

const SiteItem = ({ site }: { site: ConformeLED }) => {
    const termDate = formatDateRange(new Date(site.start), new Date(site.end));
    const days = Math.round(differenceInCalendarDays(addDays(new Date(site.end), 1), new Date(site.start)) / 30) * 30;

    const contract_rate = site.package_rate;
    let spots_count = site.spots_count;

    if (contract_rate > 0) {
        spots_count = Math.floor(contract_rate / days / site.spots_price);
    }

    const contractAmount = site.is_free ? 0 : contract_rate > 0 ? contract_rate : spots_count * days * site.spots_price;


    return <div className='p-2 border rounded-lg space-y-2'>
        <main className='grid grid-cols-[0.75fr_1fr] gap-4'>
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
import { Label } from '@/components/ui/label';
import { useImage } from '@/hooks/useSites';
import { Conforme, ConformeSite } from '@/interfaces/requests.interface';
import { formatAmount, formatDateRange } from '@/lib/format';
import { addDays, differenceInCalendarMonths } from 'date-fns';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react'

interface SitesTabProps {
    conforme: Conforme;
    setConforme: Dispatch<SetStateAction<Conforme>>
}
function SitesTab({ conforme, setConforme }: SitesTabProps) {
    const sites = conforme.sites;
    return (
        <div className='space-y-4'>
            {sites.map(site => {
                return <SiteItem key={site.ID} site={site} setConforme={setConforme} />
            })}
        </div>
    )
}

const SiteItem = ({ site, setConforme }: { site: ConformeSite; setConforme: Dispatch<SetStateAction<Conforme>> }) => {
    const { data } = useImage(site.site_code);
    const initializedRef = useRef(false)

    const termDate = formatDateRange(new Date(site.start), new Date(site.end));
    const months = differenceInCalendarMonths(addDays(new Date(site.end), 1), new Date(site.start));

    useEffect(() => {
        if (initializedRef.current || !data) return;
        setConforme(prev => ({
            ...prev,
            sites: prev.sites.map(item =>
                site.ID === item.ID ? { ...item, image: data.selectedImage?.url } : item
            )
        }))
        initializedRef.current = true;
    }, [data, site])

    return <div className='p-2 border rounded-lg space-y-2'>
        <main className='grid grid-cols-[auto_0.75fr_1fr] gap-4'>
            {data?.selectedImage?.url &&
                <img src={data.selectedImage.url} className='aspect-video object-cover object-top max-w-[150px] rounded-md' />
            }
            <div className='text-xs leading-tight'>
                <p className='font-semibold'>{site.site_code}</p>
                <p>{site.address}</p>
                <p className='font-light italic text-[0.65rem]'>{site.board_facing}</p>
                <p className='font-light text-[0.65rem]'>{site.size}</p>
            </div>
            <div className='text-xs leading-tight flex flex-col gap-1'>
                <div>
                    <Label className='text-[0.6rem] uppercase'>Term Duration</Label>
                    <p>{`${termDate} (${months} months)`}</p>
                </div>
                <div>
                    <Label className='text-[0.6rem] uppercase'>Monthly Rate</Label>
                    <p>{formatAmount(site.monthly_rate)} + VAT</p>
                </div>
            </div>
        </main>
    </div>
}

export default SitesTab
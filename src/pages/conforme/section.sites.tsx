import {
    differenceInCalendarMonths, addDays

} from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { capitalize } from '@/lib/utils';
import { formatAmount, formatDateRange } from '@/lib/format';
import { Conforme } from '@/interfaces/requests.interface';

function SitesSection({ conforme }: { conforme: Conforme }) {
    return (
        <main data-page-block className='text-[0.55rem]'>
            <Table className="w-full">
                <TableHeader>
                    <TableRow className='border-none'>
                        {['site_image', 'site_details', 'term_duration', 'monthly_rate', 'total_rate'].map(header => {
                            return (
                                <TableHead
                                    key={header}
                                    className="uppercase text-center !leading-tight text-[0.5rem] font-semibold text-white bg-[#0092E0]"
                                >
                                    {capitalize(header, "_")}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {conforme.sites.map(site => {
                        return <TableRow key={site.ID} className='border-none text-[0.5rem] leading-tight'>
                            <TableCell>
                                <img src={site.image} alt="" className='aspect-video max-w-[100px]' />
                            </TableCell>
                            <TableCell>
                                <p>{site.site_code}</p>
                                <p>{site.address}</p>
                                <p className='text-[0.45rem]'>{site.board_facing}</p>
                                <p>{`SIZE: ${site.size}`}</p>
                            </TableCell>
                            <TableCell>
                                <p>{formatDateRange(new Date(site.start), new Date(site.end))}</p>
                                <p>{differenceInCalendarMonths(addDays(new Date(site.end), 1), new Date(site.start))} months</p>
                            </TableCell>
                            <TableCell>{formatAmount(site.monthly_rate)}</TableCell>
                            <TableCell>{formatAmount(site.monthly_rate * differenceInCalendarMonths(addDays(new Date(site.end), 1), new Date(site.start)))}</TableCell>
                        </TableRow>
                    })}
                </TableBody>
            </Table>
            <div className='border-t'>
                <Table className="w-fit ml-auto">
                    <TableBody>
                        <TableRow className='border-none text-[0.5rem] leading-tight'>
                            <TableCell align='right' className='p-0.5 px-1'>TOTAL (vat exc.)</TableCell>
                            <TableCell align='right' className='p-0.5 px-1'>{formatAmount(conforme.sites.reduce((acc, site) => {
                                const duration = differenceInCalendarMonths(addDays(new Date(site.end), 1), new Date(site.start));

                                acc += site.monthly_rate * duration;
                                return acc;
                            }, 0))}</TableCell>
                        </TableRow>
                        <TableRow className='border-none text-[0.5rem] leading-tight'>
                            <TableCell align='right' className='p-0.5 px-1'>VAT</TableCell>
                            <TableCell align='right' className='p-0.5 px-1'>{formatAmount(conforme.sites.reduce((acc, site) => {
                                const duration = differenceInCalendarMonths(addDays(new Date(site.end), 1), new Date(site.start));

                                acc += (site.monthly_rate * duration) * .12;
                                return acc;
                            }, 0))}</TableCell>
                        </TableRow>
                        <TableRow className='border-none text-[0.5rem] leading-tight'>
                            <TableCell align='right' className='p-0.5 px-1'>GRAND TOTAL (vat inc.)</TableCell>
                            <TableCell align='right' className='p-0.5 px-1'>{formatAmount(conforme.sites.reduce((acc, site) => {
                                const duration = differenceInCalendarMonths(addDays(new Date(site.end), 1), new Date(site.start));

                                acc += (site.monthly_rate * duration) * 1.12;
                                return acc;
                            }, 0))}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </main>
    )
}

export default SitesSection
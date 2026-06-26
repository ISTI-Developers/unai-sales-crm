import { ReportTable } from '@/interfaces/reports.interface'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import ReportsTab from '@/pages/clients/reports.tab';
import { Button } from '../ui/button';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function ClientReport({ data }: { data: ReportTable }) {
    const client = data.client;
    const brand = data.brand;

    return (
        <Sheet modal={false}>
            <SheetTrigger asChild>
                <div className="group truncate">
                    <p title={client} className="text-xs leading-3 group-hover:underline cursor-pointer">
                        {client}
                    </p>
                    <p title={brand} className="text-[0.6rem] font-normal italic group-hover:underline cursor-pointer">
                        {brand}
                    </p>
                </div>
            </SheetTrigger>
            <SheetContent className='sm:max-w-lg' aria-describedby={undefined} tabIndex={-1}>
                <SheetHeader className='pb-4 flex flex-row justify-between items-start gap-4'>
                    <SheetTitle className='text-base'>
                        <p>{client}</p>
                        <p className='font-light text-sm'>{brand}</p>
                    </SheetTitle>
                    <Button variant="link" size="sm" className='px-0 !mt-0' asChild>
                        <Link to={`/clients/${(client).replace(/ /g, "_").replace(/\//g, "-")}`} title={client} onClick={() => localStorage.setItem("client", String(data.client_id))} className="hover:underline">
                            <SquareArrowOutUpRight />
                            View Client
                        </Link>
                    </Button>
                </SheetHeader>
                <ReportsTab clientID={data.client_id} className='max-h-[70vh]' />
            </SheetContent>
        </Sheet>
    )
}

export default ClientReport
import { SiteAvailability } from '@/interfaces/sites.interface'
import { CellContext } from '@tanstack/react-table'

import CreateBooking from './create';
import ViewBooking from './view';

function ActionCell({ row }: CellContext<SiteAvailability, unknown>) {
    const site = row.original;
    return (
        <div className='flex items-center justify-center gap-2'>
            <CreateBooking site={site} />
            <ViewBooking site={site} />
        </div>
    )
}

export default ActionCell
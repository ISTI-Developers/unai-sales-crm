import { SiteAvailability } from '@/interfaces/sites.interface'
import { CellContext } from '@tanstack/react-table'

import CreateBooking from './create';
import ViewBooking from './view';
import { useAccess } from '@/hooks/useClients';

function ActionCell({ row }: CellContext<SiteAvailability, unknown>) {
    const site = row.original;
    const { access: add } = useAccess("booking.add")
    return (
        <div className='flex items-center justify-center gap-2'>
            {add &&
                <CreateBooking site={site} />
            }
            <ViewBooking site={site} />
        </div>
    )
}

export default ActionCell
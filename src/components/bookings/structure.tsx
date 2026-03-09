import { SiteAvailability } from '@/interfaces/sites.interface'
import { CellContext } from '@tanstack/react-table'
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
function Cell({ row }: CellContext<SiteAvailability, unknown>) {
    const item = row.original;
    const remaining = row.getValue("remaining_days") as number;
    return (
        <div>
            <div className='flex items-center gap-1 pb-1'>
                <p className='text-xs font-semibold'>{item.structure_code}</p>
                <Badge
                    variant="outline"
                    className={cn('rounded-full uppercase text-[0.6rem] leading-tight px-1.5',
                        remaining <= 60 ? "bg-red-200/40 border-red-500 text-red-500" : "bg-sky-100 text-sky-500 border-sky-500"
                    )}>{remaining <= 60 ? "AVAILABLE" : "BOOKED"}</Badge>
            </div>
            <p className="uppercase text-[0.5rem] leading-tight italic flex flex-col">
                <span>{item.address}</span>
                <span>{item.board_facing}</span>
            </p>
        </div>
    )
}

export default Cell
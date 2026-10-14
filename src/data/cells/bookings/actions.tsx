import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAccess } from "@/hooks/useClients";
import { Availability, ColumnActions } from "@/interfaces/bookings.interface"
import { CellContext } from "@tanstack/react-table"
import { ReceiptTextIcon, TagIcon } from "lucide-react";

function Actions({ row, actions }: CellContext<Availability, unknown> & { actions: Partial<ColumnActions> }) {
    const site = row.original;
    const { onOpen, onBook } = actions;
    const { access: add } = useAccess("booking.add")
    const isActive = site.status === 1;
    return (
        <div className='flex items-center justify-center gap-2'>
            {add &&
                <Tooltip>
                    <TooltipTrigger asChild={isActive} className={!isActive ? "cursor-disabled" : ""}>
                        <Button variant="ghost" aria-disabled={!isActive} size="icon" className="size-7 bg-emerald-100 hover:bg-emerald-400 text-emerald-600 hover:text-emerald-600 aria-disabled:pointer-events-none aria-disabled:opacity-50" onClick={() => onBook?.(site)}>
                            <TagIcon />
                        </Button>
                    </TooltipTrigger>
                    {!isActive &&
                        <TooltipContent>Please re-activate the site to make a booking</TooltipContent>
                    }
                </Tooltip>
            }
            <Button variant="ghost" size="icon" className='size-7 bg-yellow-100 hover:bg-yellow-400 text-yellow-600 hover:text-yellow-600' onClick={() => onOpen?.(site)}>
                <ReceiptTextIcon />
            </Button>
        </div>
    )
}

export default Actions
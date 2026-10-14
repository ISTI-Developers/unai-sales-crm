import { AvatarGroup } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import UserAvatar from '@/components/ui/user-avatar';
import { useAccess } from '@/hooks/useClients';
import { useUsers } from '@/hooks/useUsers';
import { getBookingContext, getDisplayStatus } from '@/hooks/v2/useBookings';
import { Availability, BookingContext, TaggedBooking } from '@/interfaces/bookings.interface';
import { formatAmount, formatDuration, formatTermDetails, splitClientName } from '@/lib/format';
import { cn } from '@/lib/utils';
import { subDays } from 'date-fns';
import { BanIcon, InfoIcon, PenIcon } from 'lucide-react';
import { useMemo } from 'react';
interface ViewProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activeRow: Availability;
    onEdit: (booking: TaggedBooking, context: BookingContext) => void;
    onCancel: (booking: TaggedBooking) => void
}
const headers = ["status", "client", "AE", "SRP", "term details", "action"];
    
function View({ open, onOpenChange, activeRow: site, onEdit, onCancel }: ViewProps) {
    const bookings = site.bookings;
    const { access: edit } = useAccess("booking.update");

    const sortedBookings = useMemo(() => {
        const getPriority = (booking: TaggedBooking) => {
            if (booking.booking_status === "CANCELLED") return 2;
            if (booking.booking_status === "PRE-TERMINATION") return 1;

            return 0;
        };

        return [...bookings].sort((a, b) => {
            // 1. Normal bookings first
            // 2. PRE-TERMINATION
            // 3. CANCELLED
            const priorityDiff = getPriority(a) - getPriority(b);

            if (priorityDiff !== 0) {
                return priorityDiff;
            }

            // Within each group:
            // latest booking period first
            const aDate = new Date(a.date_from).getTime();
            const bDate = new Date(b.date_from).getTime();

            if (aDate !== bDate) {
                return bDate - aDate;
            }

            // Same date_from → newest/higher ID first
            return b.ID - a.ID;
        });
    }, [bookings]);
    const context = useMemo(() => getBookingContext(sortedBookings), [sortedBookings]);
    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
            {open && <div onClick={() => onOpenChange(false)} className='fixed inset-0 pointer-events-all bg-black/20 z-30' />}
            <DialogContent onInteractOutside={(event) => {
                event.preventDefault();
            }} className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>{`${site.site_code} Booking Records`}</DialogTitle>
                    <DialogDescription>{site.address}</DialogDescription>
                </DialogHeader>
                <main>
                    {sortedBookings.length === 0 ? <>No records found for this site.</> :
                        <Table>
                            <TableCaption>End of list</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    {headers.filter(header => !edit ? header !== "action" : header).map((header) => {
                                        return (
                                            <TableHead
                                                key={header}
                                                className={cn(
                                                    "uppercase text-xs font-bold",
                                                    header === "action" ? "text-center" : ""
                                                )}
                                            >
                                                {header}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedBookings.map((item) => {
                                    return <Item key={item.ID} item={item} context={context} onEdit={() => onEdit(item, context)} onCancel={() => onCancel(item)} />
                                })}
                            </TableBody>
                        </Table>}
                </main>
            </DialogContent>
        </Dialog>
    )
}

const Item = ({ item, context, onEdit, onCancel }: { item: TaggedBooking; context: BookingContext; onEdit: () => void; onCancel: () => void }) => {
    const { client, product } = splitClientName(item.client);

    const status = getDisplayStatus(item, context)

    const termDuration = formatDuration(new Date(item.date_from), new Date(item.date_to))

    const isDone = ["CANCELLED", "COMPLETED", "PRE-TERMINATED", "STOPPED"].includes(status);

    return <TableRow className={cn("relative text-xs min-h-8",
        status === "PRE-TERMINATED" && "bg-yellow-50 text-yellow-700",
        status === "CANCELLED" && "bg-red-50 text-red-600",
        status === "RUNNING" && "bg-emerald-50 text-emerald-600",
        ["UPCOMING", "QUEUEING"].includes(status) && "bg-sky-50/50 text-sky-700")}>
        <TableCell><StatusColumn booking={item} context={context} /></TableCell>
        <TableCell className="text-[0.65rem] leading-tight uppercase">
            <p className='font-semibold'>{client}</p>
            <p className='truncate max-w-[200px]'>{product}</p>
        </TableCell>
        <TableCell className="text-[0.65rem]">
            <AEColumn AE={item.account_executive} />
        </TableCell>
        <TableCell className="text-[0.65rem]">
            {formatAmount(item.srp)}
        </TableCell>
        <TableCell className="text-[0.65rem]">
            <p>
                {formatTermDetails(item.date_from, item.booking_status === "PRE-TERMINATION" ? subDays(new Date(item.date_to), 1) : item.date_to, item.monthly_rate)}
            </p>
            <p>{termDuration}</p>
        </TableCell>
        <TableCell className="text-[0.65rem] flex gap-1 items-center justify-center">
            {!isDone &&
                <>
                    <Button variant="ghost" size="icon" className="size-7 bg-sky-100 hover:bg-sky-400 text-sky-600 hover:text-sky-600" onClick={onEdit}>
                        <PenIcon />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7 text-red-600 hover:text-red-600" onClick={onCancel}>
                        <BanIcon />
                    </Button>
                </>}
        </TableCell>
    </TableRow>
}

const StatusColumn = ({ booking, context }: { booking: TaggedBooking; context: BookingContext }) => {

    const status = getDisplayStatus(booking, context)
    const isDone = ["CANCELLED", "COMPLETED", "PRE-TERMINATED", "STOPPED"].includes(status);
    return <div className='leading-tight'>
        <Tooltip>
            <TooltipTrigger asChild>
                <div>
                    <div className='relative w-fit'>
                        <p className='font-semibold text-xs'>{status}</p>
                        <InfoIcon size={12} className='absolute top-0 -right-4' />
                    </div>
                    {isDone &&
                        <p className='text-[0.65rem] italic'>{booking.addendum}</p>
                    }
                </div>
            </TooltipTrigger>
            <TooltipContent align='start' className='max-w-sm'>
                {booking.remarks}
            </TooltipContent>
        </Tooltip>
    </div>
}

const AEColumn = ({ AE }: { AE: string }) => {
    const { data: users = [] } = useUsers();
    const strippedAE = AE.trim();

    const avatars = useMemo(() => {
        const AEs = strippedAE.split(",");
        return users.filter(user => {
            const name = `${user.first_name} ${user.last_name}`;
            return AEs.some(ae => ae.trim().toLowerCase() === name.toLowerCase());
        })
    }, [strippedAE, users])

    if (avatars.length === 0) {
        return <>---</>
    }

    return <AvatarGroup>
        {avatars.map(avatar => {
            return <UserAvatar key={avatar.ID} tooltip={`${avatar.first_name} ${avatar.last_name}`} className='size-8 text-[0.65rem]' fallbackClassName='bg-white' fallback={`${avatar.first_name[0]}${avatar.last_name[0]}`} image={avatar.image ?? null} />
        })}
    </AvatarGroup>
}

export default View
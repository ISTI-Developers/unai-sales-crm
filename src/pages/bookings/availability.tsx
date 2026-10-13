import ResponsiveTable from '@/data/responsive-table';
import { getColumns } from '@/data/v2/bookings';
import useAvailableSites from "@/hooks/useAvailableSites";
import { Availability, BookingContext, TaggedBooking } from '@/interfaces/bookings.interface';
import { useState } from 'react';
import View from './view';
import Edit from './edit';
import Cancel from './cancel';
import Book from './book';
import { useClients } from '@/hooks/useClients';
const SiteAvailability = () => {
    useClients();
    const availableSites = useAvailableSites();
    const [activeRow, setActiveRow] = useState<Availability | undefined>(undefined);
    const [activeBooking, setActiveBooking] = useState<TaggedBooking | undefined>(undefined);
    const [context, setContext] = useState<BookingContext | undefined>(undefined)
    const [view, setView] = useState(false);
    const [book, setBook] = useState(false);
    const [edit, setEdit] = useState(false);
    const [cancel, setCancel] = useState(false);

    const columns = getColumns({
        onBook: (row) => {
            setActiveRow(row)
            setBook(true);
        },
        onOpen: (row) => {
            setActiveRow(row)
            setView(true);
        }
    })
    return (
        <>
            <ResponsiveTable columns={columns} data={availableSites} size={100} />
            {activeRow && (
                <>
                    <View
                        open={view}
                        activeRow={activeRow}
                        onOpenChange={(open) => {
                            setView(open);

                            if (!open) {
                                setActiveRow(undefined);
                            }
                        }}
                        onEdit={(booking, ctx) => {
                            setActiveBooking(booking);
                            setContext(ctx)
                            setEdit(true);
                        }}
                        onCancel={(booking) => {
                            setActiveBooking(booking);
                            setCancel(true);
                        }}
                    />
                    <Book activeRow={activeRow} open={book} onOpenChange={(open) => {
                        setBook(open)
                        if (!open) {
                            setActiveRow(undefined)
                        }
                    }} />
                </>
            )}

            {activeBooking && (
                <>
                    <Cancel
                        booking={activeBooking}
                        open={cancel}
                        onOpenChange={open => {
                            setCancel(open);

                            if (!open) {
                                setActiveBooking(undefined)
                            }
                        }} />
                    <Edit
                        open={edit}
                        booking={activeBooking}
                        context={context}
                        onOpenChange={(open) => {
                            setEdit(open);

                            if (!open) {
                                setActiveBooking(undefined);
                            }
                        }}
                    />
                </>
            )}
        </>
    )
}

export default SiteAvailability
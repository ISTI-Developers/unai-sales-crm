import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCancelBooking } from "@/hooks/v2/useBookings";
import { TaggedBooking } from "@/interfaces/bookings.interface";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface CancelProps {
    booking: TaggedBooking;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function Cancel({ open, onOpenChange, booking }: CancelProps) {
    const { mutate: cancelBooking, isPending } = useCancelBooking()
    const [reason, setReason] = useState("")

    const onCancel = () => {
        cancelBooking(
            {
                booking_id: booking.ID,
                reason: reason,
            },
            {
                onSuccess: async (data) => {
                    if (data?.acknowledged) {
                        onOpenChange(false);
                    }
                },
            }
        );
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>
                        Cancelation Confirmation
                    </DialogTitle>
                </DialogHeader>

                <p>Reason for cancellation:</p>

                <Textarea
                    value={reason}
                    onChange={(e) =>
                        setReason(e.target.value)
                    }
                />

                <DialogFooter>
                    <Button
                        disabled={isPending}
                        variant="destructive"
                        onClick={onCancel}
                    >
                        {isPending && (
                            <Loader2 className="animate-spin" />
                        )}
                        Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default Cancel
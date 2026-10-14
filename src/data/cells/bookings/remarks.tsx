import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAccess } from '@/hooks/useClients';
import { useUpdateRemarks } from '@/hooks/useSites';
import { Availability } from '@/interfaces/bookings.interface'
import { cn } from '@/lib/utils';
import { CellContext } from '@tanstack/react-table'
import { PenLineIcon } from 'lucide-react';
import { useState } from 'react';

function Remarks({ row }: CellContext<Availability, unknown>) {
    const site = row.original;
    const { mutate: updateRemarks } = useUpdateRemarks();
    const [remark, setRemark] = useState(site.remarks ?? "");
    const [toggle, onToggle] = useState(false);
    const { access: addBooking } = useAccess("booking.add");

    const onSubmit = () => {
        updateRemarks(
            { site_code: site.site_code, remarks: remark },
            {
                onSuccess: () => {
                    setRemark(remark);
                    onToggle(false);
                },
            }
        );
    };
    return (
        <div className='text-[0.65rem] max-w-[250px] relative group flex flex-col gap-2'>
            {!toggle ? (
                <>
                    <p className="text-start">{remark}</p>
                    {addBooking && (
                        <Button
                            onClick={() => onToggle((prev) => !prev)}
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:bg-transparent w-full justify-end"
                            )}
                        >
                            <PenLineIcon size={5} />
                        </Button>
                    )}
                </>
            ) : (
                <>
                    <Textarea
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        className="text-[0.65rem]"
                    />
                    <div className="flex gap-2 items-center ml-auto">
                        <Button
                            type="reset"
                            variant="ghost"
                            className="text-xs h-7"
                            onClick={() => {
                                onToggle(false);
                                setRemark(site.remarks ?? "")
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="ghost"
                            onClick={onSubmit}
                            className="w-fit text-xs h-7 bg-emerald-400 hover:bg-emerald-500 text-white hover:text-white flex gap-4 disabled:cursor-not-allowed"
                        // className={cn("flex gap-4 ml-auto", loading && "pl-2.5")}
                        >
                            {/* {loading && <LoaderCircle className="animate-spin" />} */}
                            Save
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

export default Remarks
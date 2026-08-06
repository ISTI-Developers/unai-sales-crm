import { WeekInfo } from "@/lib/utils"
import { ScrollArea } from "../ui/scroll-area";
import { useCreateMinute, useDeleteMinute, useMeetings, useUpdateMinute } from "@/hooks/useMeetings";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { RawMinutes } from "@/interfaces/meeting.interface";
import { Button } from "../ui/button";
import { InputGroup, InputGroupAddon, InputGroupTextarea } from "../ui/input-group";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useAccess } from "@/hooks/useClients";

interface MeetingWorkspaceProps {
    selectedWeek: WeekInfo;
    year: number
}
function MeetingWorkspace({ selectedWeek, year }: MeetingWorkspaceProps) {
    const { data, isLoading } = useMeetings([selectedWeek.isoWeek], year);
    const { access } = useAccess("meetings.edit")
    const [isEdit, setIsEdit] = useState(false)
    const [activity, setActivity] = useState<string>()
    const { mutate: updateActivity } = useUpdateMinute();
    const { mutate: insertActivity } = useCreateMinute();
    const { mutate: deleteActivity } = useDeleteMinute(selectedWeek.isoWeek, year);
    const [open, setOpen] = useState(false)

    const minutes = useMemo(() => {
        if (!data || isLoading) return;

        if (data.length === 0) return;

        return data[0];
    }, [data, isLoading])

    const onSubmit = () => {
        if (!activity) return;

        if (activity.trim().length === 0) {
            toast({
                description: `Report should not be empty.`,
                variant: "warning",
            });
            return;
        }

        if (minutes) {
            if (!data) return;
            const reportID = Number(minutes.ID);
            updateActivity(
                {
                    week: selectedWeek.isoWeek,
                    ID: reportID,
                    activity: activity,
                    year: year,
                },
                {
                    onSuccess: () => {
                        setIsEdit(false)
                        setActivity("")
                        toast({
                            description: `Your activity has been updated!`,
                            variant: "success",
                        });
                    },
                }
            );
        } else {
            insertActivity(
                {
                    activity: activity,
                    week: selectedWeek.isoWeek,
                    year: year,
                },
                {
                    onSuccess: () => {
                        setIsEdit(false)
                        setActivity("")
                        toast({
                            description: `Your minutes has been saved!`,
                            variant: "success",
                        });
                    },
                }
            );
        }
    }
    const onDelete = () => {
        if (!minutes) return;

        deleteActivity(minutes.ID, {
            onSuccess: () => {
                setIsEdit(false)
                setActivity("")
                setOpen(false);
                toast({
                    description: `Week ${selectedWeek.isoWeek} minutes has been deleted successfully.`,
                    variant: "success",
                });
            },
        })
    }

    useEffect(() => {
        setActivity(undefined);
        setIsEdit(false);
    }, [selectedWeek, year])

    return (
        <main className="flex-1 overflow-hidden p-4 space-y-4 ">
            <header className="flex justify-between gap-4 items-start">
                <div>
                    <h1 className="text-2xl font-bold">
                        {`Sales Meeting Wk${selectedWeek?.isoWeek}`}
                    </h1>
                    <span className="text-sm">{`${format(selectedWeek.start, "MMM dd")} - ${format(selectedWeek.end, "MMM dd")}, ${format(selectedWeek.end, "yyyy")}`}</span>
                </div>
                <div className="flex items-center gap-2">
                    {access && minutes &&
                        <>
                            {
                                isEdit ?
                                    <>
                                        < Button onClick={() => {
                                            setIsEdit(false);
                                            setActivity("");
                                        }} size="sm" className="px-4 rounded-2xl bg-zinc-100/70 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-600 border-zinc-600" variant="outline">Cancel</Button>
                                        <Button onClick={onSubmit} size="sm" className="px-4 rounded-2xl bg-emerald-100/70 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-600 border-emerald-600" variant="outline">Save</Button>
                                    </>
                                    :
                                    <>
                                        <Button onClick={() => {
                                            setIsEdit(true);
                                            setActivity(minutes.activity)
                                        }} size="sm" className="px-4 rounded-2xl bg-yellow-100/70 hover:bg-yellow-100 text-yellow-600 hover:text-yellow-600 border-yellow-600" variant="outline">Edit</Button>
                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <Button size="sm" className="px-4 rounded-2xl" variant="destructive">Delete</Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="max-w-60 mr-4">
                                                <div className="text-xs flex flex-col gap-2">
                                                    <p>Are you sure you want to remove this report?</p>
                                                    <div className="flex gap-2 justify-end items-center">
                                                        <Button type="button" variant="ghost" size="sm">
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            className="w-fit"
                                                            onClick={onDelete}
                                                        >
                                                            Proceed
                                                        </Button>
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </>
                            }
                        </>
                    }
                    {!minutes && activity && activity.length > 0 && <>
                        < Button onClick={() => {
                            setIsEdit(false);
                            setActivity("");
                        }} size="sm" className="px-4 rounded-2xl" variant="ghost">Clear</Button>
                        <Button onClick={onSubmit} size="sm" className="px-4 rounded-2xl bg-emerald-100/70 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-600 border-emerald-600" variant="outline">Save</Button>
                    </>}

                </div>
            </header >
            <hr />
            <ScrollArea className="h-[70vh] border rounded-xl">
                <div>
                    {isLoading ? <div className="p-4 animate-pulse">Retrieving minutes...</div> :
                        !minutes || isEdit ? access ? <MeetingForm activity={activity} setActivity={setActivity} /> : <div className="p-4">No minutes found.</div> :
                            <MeetingContent minutes={minutes} />}
                </div>
            </ScrollArea>
        </main >
    )
}

interface MeetingContentProps {
    minutes: RawMinutes;
}
const MeetingContent = ({ minutes }: MeetingContentProps) => {
    return <div className="whitespace-break-spaces p-2 pb-8">
        {minutes.activity}
    </div>
}
interface MeetingFormProps {
    activity?: string;
    setActivity: (activity: string) => void;
}
const MeetingForm = ({ activity, setActivity }: MeetingFormProps) => {
    return <InputGroup className=" !h-[69vh]">
        <InputGroupAddon align="block-start" className="bg-zinc-50">
            Toolbar coming soon 😉
        </InputGroupAddon>
        <InputGroupTextarea value={activity} placeholder="Enter your minutes here..." onChange={(e) => setActivity(e.target.value)} className="h-full outline-none focus:outline-none focus:ring-0 focus-visible:outline-none resize-none scrollbar-none" />
    </InputGroup>
}

export default MeetingWorkspace
import { RawMinutes, WeekRow } from "@/interfaces/meeting.interface";
import { ColumnDef, CellContext } from "@tanstack/react-table";
import { generateWeeks } from "./reports.columns";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast, useToast } from "@/hooks/use-toast";
import { useCreateMinute, useDeleteMinute, useUpdateMinute } from "@/hooks/useMeetings";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Pen, Plus, Trash2, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

const WeekCell = (cell: CellContext<WeekRow, unknown>) => {
    const value = cell.getValue() as RawMinutes | null;
    const { mutate: deleteActivity } = useDeleteMinute()
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(false);

const onDelete = async (ID: number) => {
        if (ID) {
            deleteActivity(ID, {
                onSuccess: () => {
                    setOpen(false);
                    toast({
                        title: "Deletion Success",
                        description: `Your activity has been cleared.`,
                        variant: "success",
                    });
                },
            }
            );
        }
    };

    return <div>
        {open ? <ActivityForm week={cell.column.id} edit={edit} setEdit={setEdit} setOpen={setOpen} data={value} /> : <>
            <div className={cn("relative group p-2 flex items-center", value ? "justify-start" : "justify-center")}>
                <p className={cn("block indent-0 transition-all", !value ? "group-hover:hidden" : "whitespace-break-spaces text-xs")}>
                    {value ? value.activity : "---"}
                </p>
                {!value ? <Button variant={null} onClick={() => setOpen(true)} className="hidden group-hover:flex w-full text-[0.6rem] p-1 px-2 h-5 gap-1">
                    <Plus size={12} /> Add Minutes
                </Button> :
                    <div className="absolute w-full flex items-center justify-center">
                        <div className="ml-auto flex gap-2 pr-2 h-full">
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 overflow-hidden w-full transition-all">
                                <Tooltip delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={null}
                                            onClick={() => {
                                                setEdit(true);
                                                setOpen(true);
                                            }}
                                            className="p-1 h-6 w-6 rounded-full border border-amber-400 bg-gray-100 hover:bg-amber-400 hover:text-white text-amber-400 transition-all z-[2]"
                                        >
                                            <Pen size={16} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="z-[3]">Edit</TooltipContent>
                                </Tooltip>
                                <Popover>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger asChild>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={null}
                                                    className="p-1 h-6 w-6 rounded-full border border-red-400 bg-gray-100 hover:bg-red-400 hover:text-white text-red-400 transition-all z-[2]"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </PopoverTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent className="z-[3]">
                                            Delete
                                        </TooltipContent>
                                    </Tooltip>
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
                                                    onClick={() => {
                                                        onDelete(value.ID)
                                                    }}
                                                >
                                                    Proceed
                                                </Button>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>}
            </div>
        </>}
    </div>
}
const ActivityForm = ({
    week,
    setOpen,
    edit,
    setEdit,
    data,
}: {
    week: string;
    edit: boolean;
    setEdit: (bool: boolean) => void;
    setOpen: (bool: boolean) => void;
    data: RawMinutes | null;
}) => {
    const { toast } = useToast();
    const [activity, setActivity] = useState("");
    const [loading, setLoading] = useState(false);
    const { mutate: insertActivity } = useCreateMinute();
    const { mutate: updateActivity } = useUpdateMinute();

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (activity.trim().length === 0) {
            toast({
                description: `Report should not be empty.`,
                variant: "warning",
            });
            setLoading(false)
            return;
        }

        if (edit) {
            if (!data) return;
            const reportID = Number(data.ID);
            updateActivity(
                {
                    week: weeks.indexOf(week) + 1,
                    ID: reportID,
                    activity: activity
                },
                {
                    onSuccess: () => {
                        setOpen(false);
                        setEdit(false)
                        setLoading(false)
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
                    week: weeks.indexOf(week) + 1,
                },
                {
                    onSuccess: () => {
                        setOpen(false);
                        toast({
                            description: `Your minutes has been saved!`,
                            variant: "success",
                        });
                    },
                    onError: () => {
                        setLoading(false);
                    },
                }
            );
        }
    }

    useEffect(() => {
        if (data) {
            setActivity(data.activity)
        }
    }, [data])

    const weeks = useMemo(() => generateWeeks(), []);

    return <form onSubmit={onSubmit} className="flex flex-col items-end relative gap-2">
        <Textarea
            value={activity}
            className="border-none outline-none min-h-[300px] focus-visible:ring-0 px-1 py-1 text-xs"
            // onKeyDown={(e) => {
            //     if (e.key === "Enter" && !e.shiftKey) {
            //         e.preventDefault();
            //         if (!loading && activity.length > 0) {
            //             e.currentTarget.form?.requestSubmit();
            //         }
            //     }
            // }}

            onChange={(e) => setActivity(e.target.value)}
            placeholder="Enter the minutes here..."
        />
        <div className="flex gap-2 items-center">
            <Button
                type="submit"
                variant="ghost"
                disabled={loading || activity.length === 0}
                className="p-1 h-6 w-6 rounded-full border border-emerald-400 bg-emerald-100 hover:bg-emerald-400 hover:text-white text-emerald-400 transition-all z-[2]"
            >
                <Check size={16} />
            </Button>
            <Button
                type="reset"
                variant="ghost"
                onClick={() => {
                    setEdit(false);
                    setOpen(false);
                }}
                className="p-1 h-6 w-6 rounded-full border border-zinc-400 bg-zinc-100 hover:bg-zinc-400 hover:text-white text-zinc-400 transition-all z-[2]"
            >
                <X size={16} />
            </Button>
        </div>
    </form>
}

export const columns: ColumnDef<WeekRow>[] = generateWeeks().map(week => ({
    accessorKey: week,
    header: week,
    cell: WeekCell
}))


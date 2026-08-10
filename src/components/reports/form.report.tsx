import { ChangeEvent, useEffect, useMemo, useState } from "react"
import { InputGroup, InputGroupTextarea, InputGroupAddon } from "../ui/input-group"
import { Activity, ReportTags } from "@/interfaces/reports.interface";
import Combobox from "../combo-box";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { catchError } from "@/providers/api";
import { FileIcon, Loader, Paperclip, SaveIcon, SendIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import { useInsertReport, useUpdateReport } from "@/hooks/useReports";
import { generateWeeks } from "@/lib/utils";
import { getFridayFromISOWeek } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth.provider";
import { toast } from "@/hooks/use-toast";

interface ReportFormProps {
    report?: Activity;
    modal?: boolean;
    onOpenChange: (open: boolean) => void;
    yearweek: number;
    selectedWeeks: number[];
    clientID: number;
}

function ReportForm({ report, onOpenChange, modal, yearweek, selectedWeeks, clientID }: ReportFormProps) {
    const { user } = useAuth();

    const queryClient = useQueryClient();
    const [activity, setActivity] = useState<string | undefined>("");
    const [tags, setTags] = useState<ReportTags[]>([])
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setLoading] = useState(false);
    const { mutate: insertReport, isPending: isInsertPending } = useInsertReport();
    const { mutate: updateReport, isPending: isUpdatePending } = useUpdateReport();

    const weeks = useMemo(generateWeeks, []);
    const weekMap = new Map(weeks.map(week => ([week.yearweek, week])))
    const week = weeks.find(week => week.isCurrent)!

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        try {
            setLoading(true);
            if (!e.target.files) throw new Error("File not found");
            const file = e.target.files[0];
            const maxSizeMB = 2;
            const maxSizeBytes = maxSizeMB * 1024 * 1024;
            if (file) {
                if (file.size > maxSizeBytes) {
                    e.target.value = ""; // Clear the file input
                    throw new Error(`File is too large. Max size is ${maxSizeMB}MB.`);
                } else {
                    setSelectedFile(file);
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                }
            }
        } catch (error) {
            catchError(error);
        } finally {
            setLoading(false)
        }
    };

    const onSubmit = () => {
        if (!activity) return;
        let dateSubmitted = new Date();
        let weekSelected = week;
        if (yearweek !== week.yearweek) {
            weekSelected = weekMap.get(yearweek)!;
            dateSubmitted = getFridayFromISOWeek(new Date().getFullYear(), weekSelected.isoWeek) ?? new Date();
        }

        if (report) {
            updateReport({
                activity: {
                    ID: report.ID,
                    activity,
                    tags,
                    file: report.file,
                    file_id: report.file_id
                },
                file: selectedFile
            }, {
                onSuccess: () => {
                    onOpenChange(false);
                    setActivity("")
                    queryClient.refetchQueries({
                        queryKey: ["reports", new Date().getFullYear(), user?.ID, selectedWeeks]
                    })
                    console.log(["reports", new Date().getFullYear(), user?.ID, [weekSelected.isoWeek], clientID])
                    queryClient.invalidateQueries({
                        queryKey: ["reports", new Date().getFullYear(), user?.ID, [weekSelected.isoWeek], clientID],
                    })
                    toast({
                        description: `Your report has been updated!`,
                        variant: "success",
                    });
                }
            })
        } else {
            insertReport({
                activity: {
                    activity,
                    tags,
                    client_id: clientID,
                    date_submitted: dateSubmitted
                },
                file: selectedFile,
            }, {
                onSuccess: () => {
                    onOpenChange(false);
                    setActivity("")
                    toast({
                        description: `Your report has been submitted!`,
                        variant: "success",
                    });
                    console.log(["reports", new Date().getFullYear(), user?.ID, [weekSelected.isoWeek], clientID])
                    queryClient.invalidateQueries({
                        queryKey: ["reports", new Date().getFullYear(), user?.ID, [weekSelected.isoWeek], clientID],
                    })
                    queryClient.refetchQueries({
                        queryKey: ["reports", dateSubmitted.getFullYear(), user?.ID, selectedWeeks],
                    });
                }
            })
        }
    }
    useEffect(() => {
        if (report) {
            setActivity(report.activity);
            setTags(report.tags ?? [])
        }
    }, [report])
    return (
        <InputGroup className='rounded-2xl p-1 pb-1.5 relative'>
            <InputGroupTextarea placeholder="Enter your activities here" autoFocus className='outline-none focus:outline-none min-h-[60px]' value={activity}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!isUpdatePending && !isInsertPending) {
                            onSubmit();
                        }
                    }
                }}
                onChange={(e) => setActivity(e.target.value)} />
            <InputGroupAddon align="block-end" className="p-0 flex-wrap">
                <Combobox value={tags} onValueChange={setTags} />
                <AnimatePresence mode="wait">
                    {previewUrl ?
                        (<motion.div
                            key="file"
                            initial={{ opacity: 0, scale: 0.9, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="text-[0.65rem] px-1 pl-2 max-w-[100px] h-7 flex items-center gap-1 rounded-full border shadow">
                            <FileIcon size={16} className="shrink-0" />
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer" className="truncate underline text-blue-500">{selectedFile?.name}</a>
                            <button type="button" onClick={() => {
                                setPreviewUrl(null);
                                setSelectedFile(null);
                                setLoading(false);
                            }}>
                                <XIcon size={16} />
                            </button>
                        </motion.div>)
                        :
                        (<motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.9, y: 4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            transition={{ duration: 0.18, ease: "easeOut" }} >
                            <Label htmlFor="attachment" className="h-7 flex items-center justify-center rounded-full cursor-pointer border shadow px-2" >
                                {isLoading ? <Loader size={14} className="animate-spin" /> : <Paperclip size={14} />}
                                <Input id="attachment" type="file" disabled={isLoading} className="hidden" accept="image/*,application/pdf" onChange={(e) => {

                                    onFileChange(e);
                                }} />
                            </Label>
                        </motion.div>)}
                </AnimatePresence>
                <div className="ml-auto flex gap-1">
                    <Button variant="outline" size="icon" className="size-7 rounded-full text-xs border-emerald-400 bg-emerald-100 hover:bg-emerald-400 text-emerald-600" type="submit" onClick={onSubmit}>
                        {report ? <SaveIcon /> : <SendIcon className="translate-y-[1px] translate-x-[-1px]" />}
                    </Button>
                </div>
            </InputGroupAddon>
            <Button variant="outline" size="icon" data-hidden={modal ? (!activity && activity?.length === 0) && tags.length === 0 : false} className="data-[hidden=true]:hidden absolute top-1 right-1 size-7 rounded-full text-xs text-red-300 bg-red-200/50 border-red-300" onClick={() => {
                onOpenChange(false);
                setActivity("");
                setTags([])
            }}><XIcon /></Button>
        </InputGroup >
    )
}

export default ReportForm
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import { format, formatDistanceToNow, getISOWeek, isMonday } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { generateWeeks } from "@/data/reports.columns"
import { useClientReports, useInsertReport, useUpdateReport } from "@/hooks/useReports"
import { capitalize } from "@/lib/utils"
import { useSettings } from "@/providers/settings.provider"
import { useAuth } from "@/providers/auth.provider"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/providers/api"
import { useAccess } from "@/hooks/useClients"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

type ReportsTabProps = {
    clientID: number,
}

const ReportsTab = ({ clientID }: ReportsTabProps) => {
    const { user } = useAuth();
    const { access: canView } = useAccess("reports.viewAll")
    const { access: canEdit } = useAccess("reports.add")
    const weeks = useMemo(() => generateWeeks(), [])
    const { weekAccess } = useSettings();
    const currentISOWeek = getISOWeek(new Date());
    const { mutate: insert } = useInsertReport();
    const { mutate: update } = useUpdateReport(clientID);

    const { data: reports = [], isLoading } = useClientReports(clientID)

    const currentActivity = useMemo(() => {
        return reports.find(
            (report) =>
                getISOWeek(report.date_modified) === currentISOWeek &&
                report.date_modified.getFullYear() === new Date().getFullYear()
        )
    }, [reports, currentISOWeek])

    const canCreateActivityForLastWeek = useMemo(() => {
        if (weekAccess.find(week => week.week === weeks[currentISOWeek - 2])) {
            return true;
        }
        const isItMonday = isMonday(new Date());

        if (isItMonday) {
            return new Date().getHours() < 23;
        }
        return false
    }, [weekAccess, weeks, currentISOWeek])

    const [report, setReport] = useState("")
    const [onEdit, setEdit] = useState(false)
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (user === null) {
            toast({
                variant: "warning",
                description: "An error has occured"
            })
            return;
        }

        if (!user.sales_unit) {
            toast({
                variant: "destructive",
                description: "You cannot submit this report."
            })
            return;
        }

        if (currentActivity) {
            const reportData = {
                report_id: currentActivity.ID,
                user_id: user.ID as number,
                date: new Date().toISOString(),
                report: report,
                file_path: currentActivity.file ?? "",
                file: selectedFile ?? null,
                file_id: currentActivity.file_id,
            }
            update(reportData, {
                onSuccess: () => {
                    setEdit(false);
                    toast({
                        description: `Your report has been saved!`,
                        variant: "success",
                    });
                },
                onError: () => {
                    setLoading(false);
                },
            })
        } else {
            const reportData = {
                client_id: clientID,
                sales_unit_id: user.sales_unit.sales_unit_id,
                date: new Date().toISOString(),
                file: selectedFile,
                report: report,
                user_id: user.ID as number
            };
            insert(reportData, {
                onSuccess: () => {
                    setEdit(false);
                    toast({
                        description: `Your report has been saved!`,
                        variant: "success",
                    });
                },
                onError: () => {
                    setLoading(false);
                },
            })
        }

    }

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        try {
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
        }
    };
    useEffect(() => {
        if (!onEdit) {
            setReport(currentActivity?.activity ?? "")
            setPreviewUrl(currentActivity?.file ?? null)
        }
    }, [currentActivity?.activity, currentActivity?.file, onEdit])

    const latestReport = reports[0]

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            {/* Header */}
            <main className="space-y-4 p-4 bg-zinc-50 rounded-xl">
                <header className="flex justify-between items-start">
                    <div>
                        {latestReport && (
                            <div className="text-xs text-zinc-400 italic flex items-center gap-2">
                                {`It's been ${formatDistanceToNow(latestReport.date_submitted)} since the last activity`}
                                <Tooltip>
                                    <TooltipTrigger><InfoIcon size={14} /></TooltipTrigger>
                                    <TooltipContent>
                                        Last activity created on {format(latestReport.date_submitted, "PPPp")} by{" "}
                                        {capitalize(latestReport.account_name)}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                    {canEdit && canCreateActivityForLastWeek &&
                        <Button variant="outline" size="sm">
                            Create {weeks[currentISOWeek - 2]} Activity
                        </Button>
                    }
                </header>
                {canView &&
                    <form className="space-y-4" onSubmit={onSubmit}>
                        <Textarea
                            id="activity"
                            placeholder="No activity made for this week yet."
                            value={report}
                            disabled={!onEdit}
                            className="placeholder:text-zinc-400 disabled:opacity-100 disabled:cursor-default resize-none rounded-lg bg-white disabled:bg-opacity-30 disabled:text-zinc-400"
                            onChange={(e) => setReport(e.target.value)}
                        />
                        {previewUrl && (
                            <div className="text-sm text-gray-700">
                                Attachment:
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline ml-2"
                                >
                                    {selectedFile ? selectedFile.name : "View"}
                                </a>
                            </div>
                        )}
                        {canEdit && user?.sales_unit &&
                            <div className="flex justify-between items-end">
                                <Input
                                    id="attachment"
                                    type="file"
                                    className="w-fit"
                                    accept="image/*,application/pdf"
                                    disabled={!onEdit}
                                    onChange={onFileChange}
                                />
                                <div className="flex justify-end gap-2">
                                    {!onEdit ? (
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="bg-main-100 hover:bg-main-400"
                                            onClick={() => setEdit(true)}
                                        >
                                            Edit
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                type="reset"
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setEdit(false)
                                                    setReport(currentActivity?.activity ?? "")
                                                    setSelectedFile(null);
                                                    setPreviewUrl(null);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" size="sm" disabled={loading} className="bg-emerald-400 text-emerald-50 hover:bg-emerald-500">
                                                Submit
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        }
                    </form>
                }
            </main>
            <ScrollArea>
                <footer className="max-h-[400px] grid gap-4">
                    {reports.map(report => {
                        return <div key={report.ID} className="p-4 border shadow-sm rounded-2xl flex items-center gap-4 justify-between">
                            <Avatar>
                                <AvatarFallback className="text-xs">
                                    {report.account_code}
                                </AvatarFallback>
                            </Avatar>
                            <div className="mr-auto grid leading-tight">
                                <span className="font-semibold text-sm">{report.account_name}</span>
                                <span className="text-sm text-zinc-500">{report.activity}</span>
                            </div>
                            <p className="text-xs mb-auto">{format(report.date_modified, "PP")}</p>
                        </div>
                    })}
                </footer>
            </ScrollArea>
            {/* Reports Table */}
        </div >
    )
}

export default ReportsTab

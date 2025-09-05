import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import { format, getISOWeek, isMonday } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { generateWeeks } from "@/data/reports.columns"
import { useClientReports, useInsertReport, useUpdateReport } from "@/hooks/useReports"
import { capitalize } from "@/lib/utils"
import { useSettings } from "@/providers/settings.provider"
import { useAuth } from "@/providers/auth.provider"
import { toast } from "@/hooks/use-toast"
import { catchError } from "@/providers/api"

type ReportsTabProps = {
    clientID: number
    canEdit: boolean
}

const ReportsTab = ({ clientID, canEdit }: ReportsTabProps) => {
    const { user } = useAuth();
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
        <div className="space-y-2">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <p className="font-semibold text-sm">Client Reports</p>
                    {latestReport && (
                        <p className="text-xs text-zinc-400 italic">
                            Last activity created on {format(latestReport.date_submitted, "PPPp")} by{" "}
                            {capitalize(latestReport.account_name)}
                        </p>
                    )}
                </div>
                {canEdit &&
                    <Button variant="outline" size="sm" disabled={!canCreateActivityForLastWeek}>
                        Create {weeks[currentISOWeek - 2]} Activity
                    </Button>
                }
            </header>

            <hr />

            {canEdit &&
                <>
                    < main className="space-y-4">
                        <form className="space-y-2" onSubmit={onSubmit}>
                            <Label htmlFor="activity">Current Week Activity ({weeks[currentISOWeek - 1]})</Label>
                            <Textarea
                                id="activity"
                                placeholder="You haven't made an activity for this week. Click edit to create now."
                                value={report}
                                disabled={!onEdit}
                                className="rounded-sm placeholder:text-zinc-400 disabled:opacity-100 disabled:cursor-default resize-none"
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
                            <Input
                                id="attachment"
                                type="file"
                                className="w-fit mr-auto"
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
                                        <Button type="submit" size="sm" className="bg-emerald-400 text-emerald-50 hover:bg-emerald-500">
                                            Submit
                                        </Button>
                                    </>
                                )}
                            </div>
                        </form>
                    </main>
                    <hr />
                </>
            }


            {/* Reports Table */}
            <footer className="max-h-[350px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="sticky top-0 bg-white">
                            <TableHead>ACTIVITY</TableHead>
                            <TableHead>AE</TableHead>
                            <TableHead>DATE</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.ID}>
                                <TableCell>{report.activity}</TableCell>
                                <TableCell className="uppercase">{report.account_code}</TableCell>
                                <TableCell className="whitespace-nowrap">{format(report.date_modified, "PP")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </footer>
        </div >
    )
}

export default ReportsTab

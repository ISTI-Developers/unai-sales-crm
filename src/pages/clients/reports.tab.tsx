import { format, formatDistanceToNow } from "date-fns"
import { useClientReports } from "@/hooks/useReports"
import { capitalize, cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"
import ReportCard from "@/components/reports/card.report"

type ReportsTabProps = {
    clientID: number,
    className?: string,
}

const ReportsTab = ({ clientID, className }: ReportsTabProps) => {
    const { data: reports = [], isLoading } = useClientReports(clientID)

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
                                    <TooltipTrigger tabIndex={-1}><InfoIcon size={14} /></TooltipTrigger>
                                    <TooltipContent>
                                        Last activity created on {format(latestReport.date_submitted, "PPPp")} by{" "}
                                        {capitalize(latestReport.ae)}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </header>
            </main>
            <ScrollArea>
                <footer className={cn("max-h-[60vh] grid gap-4", className)}>
                    {reports.map(report => {
                        return <ReportCard report={report} />
                    })}
                </footer>
            </ScrollArea>
            {/* Reports Table */}
        </div >
    )
}

export default ReportsTab

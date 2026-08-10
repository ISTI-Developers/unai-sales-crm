import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResponsiveTable from "@/data/responsive-table";
import { columns } from "@/data/week.reports.columns";
import { useReportsByWeek } from "@/hooks/useReports"
import { ReportPreview } from "@/interfaces/reports.interface";
import { useWeeks } from "@/lib/utils";
import { format } from "date-fns";
import { useMemo, useState } from "react";

function PresentationView() {
    const currentWeek = useWeeks().current();
    const { weeks } = useWeeks();
    const [selectedWeek, setSelectedWeek] = useState(currentWeek.isoWeek)
    const { data, isLoading } = useReportsByWeek([selectedWeek]);
    const week = useWeeks().getByISO(selectedWeek)

    const reports: ReportPreview[] = useMemo(() => {
        if (!data || isLoading) return [];
        const statusOrder = ["HOT", "ACTIVE", "ON/OFF", "POOL"];

        const hasReports = data.filter(client => !Array.isArray(client.reports));
        const sortedClients = [...hasReports].sort(
            (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
        );

        console.log(sortedClients);
        return sortedClients.map(client => {
            return {
                ...client,
                activity: client.reports[week.yearweek]
            }
        });
    }, [data, isLoading, week.yearweek])

    if (!data && isLoading) return <>Loading reports...</>;
    if (!data) return <>No reports found for this week</>
    return (
        <div>
            <ResponsiveTable toolbarOrientation="horizontal" size={100} data={reports} columns={columns}>
                <div className="mr-auto">
                    <Select value={String(selectedWeek)} onValueChange={(value) => setSelectedWeek(Number(value))}>
                        <SelectTrigger className="h-7 shadow-none text-xs">
                            <SelectValue placeholder="Select Week" />
                        </SelectTrigger>
                        <SelectContent>
                            {weeks.map(week => {
                                const label = `Wk ${week.isoWeek} • ${format(week.start, "MMM dd")}-${format(week.end, "MMM dd")}`
                                return <SelectItem key={week.isoWeek} value={String(week.isoWeek)}>
                                    {label}
                                </SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </ResponsiveTable>
        </div>
    )
}

export default PresentationView
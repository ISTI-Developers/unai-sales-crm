import { ReportPreview } from "@/interfaces/reports.interface"
import { Row } from "@tanstack/react-table"
import UserAvatar from "../ui/user-avatar";
import { Badge } from "../ui/badge";

function ActivityPresentation({ row }: { row: Row<ReportPreview> }) {
    const reports = [...row.original.activity].sort((a, b) => new Date(b.date_modified).getTime() - new Date(a.date_modified).getTime());

    return (
        <div className="flex flex-col gap-6">
            {reports.map(report => {
                return <div key={report.ID} className="flex items-center gap-2">
                    <UserAvatar fallback={report.ae_code} image={report.image} sales_unit={report.sales_unit} className="size-6" fallbackClassName="text-[0.5rem]" />
                    <div className="w-full flex flex-col gap-1">
                        <p className="max-w-2xl">{report.activity}</p>
                        {report.tags && report.tags.length > 0 &&
                            <div className='flex flex-wrap gap-1'>
                                {report.tags.map(tag => <Badge key={tag} className='rounded-full bg-main-100/80 hover:bg-main-100/70 capitalize h-4 px-2 text-[0.6rem] whitespace-nowrap'>{tag.toLowerCase()}</Badge>)}
                            </div>
                        }
                    </div>
                </div>
            })}
        </div>
    )
}

export default ActivityPresentation
import { Activity, ReportTable } from '@/interfaces/reports.interface';
import { cn, generateWeeks } from '@/lib/utils';
import { useSettings } from '@/providers/settings.provider'
import { CellContext } from '@tanstack/react-table';
import { isMonday } from 'date-fns';
import { useMemo, useState } from 'react'
import { Badge } from '../ui/badge';
import { PenLine, PlusIcon, Trash2 } from 'lucide-react';
import ReportForm from './form.report';
import { Button } from '../ui/button';
import { useReports } from '@/providers/reports.provider';
import { useDeleteReport } from '@/hooks/useReports';
import { toast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/auth.provider';
import { useAccess } from '@/hooks/useClients';

function ReportCell({ column, row }: CellContext<ReportTable, unknown>) {
    const { user } = useAuth();
    const { selectedWeeks, openReportSheet } = useReports();
    const queryClient = useQueryClient();
    const { weekAccess } = useSettings();
    const { access: canDelete } = useAccess("reports.delete")
    const client = row.original;
    const reports = client[column.id as keyof typeof client] as Activity[] | string;

    const [openForm, setOpenForm] = useState(false)
    const [isNewReport, setIsNewReport] = useState(false)
    const [openPopover, onOpenPopoverChange] = useState(false)
    const { mutate: deleteReport } = useDeleteReport();

    const isOpen = useMemo(() => {
        const weeks = generateWeeks();
        const currentWeek = weeks.find(week => week.isCurrent)!
        const columnWeek = weeks.find(week => week.yearweek === Number(column.id));

        if (weekAccess.find((wk) => wk.week === column.id)) {
            return true;
        }
        if (columnWeek?.isoWeek === currentWeek?.isoWeek) {
            return true;
        }
        if (columnWeek?.isoWeek === currentWeek?.isoWeek - 1) {
            const isItMonday = isMonday(new Date());
            const currentTime = new Date().getHours();
            if (isItMonday) {
                return currentTime < 23;
            }
            return false;
        }
        return false;
    }, [column.id, weekAccess]);


    const processedReports = useMemo(() => {
        if (typeof reports === "string") return undefined;
        return [...reports].sort((a, b) => {
            return new Date(b.date_modified).getTime() - new Date(a.date_modified).getTime();
        })
    }, [reports])

    const latestReport = useMemo(() => {
        if (!processedReports) return;

        return processedReports[0];

    }, [processedReports]);

    const canEditDelete = useMemo(() => {
        if (!user || !latestReport) return false;
        const name = `${user.first_name} ${user.last_name}`;
        return canDelete && name.toUpperCase() === latestReport.ae.toUpperCase()
    }, [user, latestReport, canDelete])

    const handleDeleteReport = (ID: number) => {
        if (!latestReport) return;

        deleteReport({ ID: ID }, {
            onSuccess: () => {
                toast({
                    variant: "success",
                    description: "report has been deleted successfully"
                })
                onOpenPopoverChange(false)
                queryClient.refetchQueries({
                    queryKey: ["reports", new Date().getFullYear(), user?.ID, selectedWeeks]
                })
            }
        })
    }

    return (
        <div className='w-full relative flex items-center'>
            {openForm ?
                <ReportForm report={isNewReport ? undefined : latestReport} onOpenChange={(open) => {
                    setOpenForm(open);
                    setIsNewReport(false);
                }} yearweek={Number(column.id)} selectedWeeks={selectedWeeks} clientID={client.ID} />
                :
                <>
                    {latestReport ?
                        <div className=' p-2 flex flex-col gap-2 items-start group h-full w-full'>

                            <div className='relative text-sm max-w-lg whitespace-break-spaces'>
                                {latestReport.activity}
                                {processedReports && processedReports.length > 1 &&
                                    <Button variant="outline" data-report-button onClick={() => {
                                        openReportSheet({
                                            client: client,
                                            columnID: column.id,
                                        })
                                    }} title="View All" size="icon" className='absolute -right-6 top-0 shrink-0 size-5 bg-emerald-400 text-white rounded-full flex items-center justify-center text-[0.65rem] leading-tight'>
                                        <p className='pointer-events-none'>{processedReports.length}</p>
                                    </Button>
                                }
                            </div>

                            {latestReport.tags &&
                                <div className='flex flex-wrap gap-1'>
                                    {latestReport.tags.map(tag => <Badge key={tag} className='rounded-full bg-main-100/80 hover:bg-main-100/70 capitalize h-5 text-[0.6rem]'>{tag.toLowerCase()}</Badge>)}
                                </div>
                            }
                            {isOpen &&
                                <div className='absolute bottom-0 right-0 p-1 flex items-end gap-1 opacity-0 transition-all group-hover:opacity-100'>
                                    <Button variant="outline" title="New" size="icon" onClick={() => {
                                        setOpenForm(true);
                                        setIsNewReport(true)
                                    }} className='size-7 rounded-full flex items-center justify-center text-[0.65rem] leading-tight'>
                                        <PlusIcon />
                                    </Button>
                                    {canEditDelete &&
                                        <>
                                            <Button variant="outline" title="Edit" size="icon" onClick={() => setOpenForm(true)} className='size-7 rounded-full flex items-center justify-center text-[0.65rem] leading-tight'>
                                                <PenLine />
                                            </Button>
                                            <Popover open={openPopover} onOpenChange={onOpenPopoverChange}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" title="Delete" size="icon" className='size-7 rounded-full flex items-center justify-center text-[0.65rem] leading-tight border-red-300 bg-red-50 hover:bg-red-50 hover:text-red-300 text-red-300'>
                                                        <Trash2 />
                                                    </Button>
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
                                                                onClick={() => {
                                                                    handleDeleteReport(latestReport.ID)
                                                                }}
                                                            >
                                                                Proceed
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </>
                                    }
                                </div>
                            }
                        </div>
                        : <div className='relative group w-full h-full'>
                            <p className={cn('opacity-100', isOpen ? "group-hover:opacity-0" : "")}>---</p>
                            {isOpen &&
                                <button type='button' onClick={() => setOpenForm(true)} className='absolute top-0 left-0 hidden group-hover:flex w-full h-full cursor-pointer items-center gap-2 justify-center'>
                                    <PlusIcon size={16} />
                                    <span>New Activity</span>
                                </button>
                            }
                        </div>}
                </>}
            {/* */}
        </div >
    )
}

export default ReportCell
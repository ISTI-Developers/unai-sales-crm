import { Activity } from '@/interfaces/reports.interface'
import { format, isToday } from 'date-fns';
import UserAvatar from '../ui/user-avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { PenLine, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ReportCardProps {
    report: Activity;
    className?: string;
    onSelect?: (report: Activity) => void;
    onDelete?: (ID: number) => void;
}
function ReportCard({ report, onSelect, onDelete, className }: ReportCardProps) {
    const [openPopover, onOpenPopoverChange] = useState(false)
    let timestamp = format(report.date_modified, "MM/dd");
    if (isToday(report.date_modified)) {
        timestamp = format(report.date_modified, "p");
    }
    return (
        <div className={cn("relative group p-4 border shadow-sm rounded-2xl flex items-start gap-4 justify-between", className)}>
            <UserAvatar fallback={report.ae_code} image={report.image} sales_unit={report.sales_unit} />
            <div className="mr-auto grid leading-tight">
                <span className="font-semibold text-sm capitalize">{report.ae}</span>
                <span className="text-sm text-zinc-500 pr-4">{report.activity}</span>
                <div className='flex flex-wrap gap-1 pt-1'>
                    {report.tags?.map(tag => <Badge key={tag} className='rounded-full bg-main-100/70 hover:bg-main-100/70 capitalize h-5 text-[0.6rem]'>{tag.toLowerCase()}</Badge>)}
                </div>
            </div>
            <p className="text-xs mb-auto whitespace-nowrap text-zinc-500">{timestamp}</p>
            {onSelect && onDelete && <div className='absolute bottom-1 right-1 p-1 flex items-end h-full gap-1 opacity-0 transition-all group-hover:opacity-100'>
                <Button variant="outline" title="Edit" size="icon" onClick={() => {
                    onSelect?.(report)
                }} className='size-7 rounded-full flex items-center justify-center text-[0.65rem] leading-tight'>
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
                                        onDelete?.(report.ID)
                                    }}
                                >
                                    Proceed
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>}
        </div>
    )
}

export default ReportCard
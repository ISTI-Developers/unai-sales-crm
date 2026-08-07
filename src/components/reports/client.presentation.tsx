import { ReportPreview } from '@/interfaces/reports.interface'
import { Row } from '@tanstack/react-table'
import UserAvatar from '../ui/user-avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
// import Status from '../status';
function ClientPresentation({ row }: { row: Row<ReportPreview> }) {
    const data = row.original;
    const client = data.client;
    const brand = data.brand;
    const aes = data.account_executives.map(ae => ae);

    return (
        <div>
            <div className="max-w-[275px] pb-1">
                <p title={client} className="text-xs leading-3 whitespace-break-spaces font-medium line-clamp-2">
                    {client}
                </p>
                <p title={brand} className="text-[0.6rem] font-normal italic truncate">
                    {brand}
                </p>
            </div>
            <div className='flex items-center gap-1 max-w-[300px] flex-wrap'>
                {/* <Status status={data.status} className="rounded-full text-[0.6rem] h-5 px-1.5 w-fit" /> */}
                {aes.map(ae => {
                    return <Tooltip>
                        <TooltipTrigger asChild>
                            <div className='flex items-center gap-2 border p-1 py-0.5 rounded-full'>
                                <UserAvatar image={ae.image} fallback={ae.code} sales_unit={ae.su} className='size-4 border' fallbackClassName="text-[0.375rem]" />
                                <p className='text-[0.6rem] font-medium'>{ae.code}</p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className='rounded-full'>{ae.ae}</TooltipContent>
                    </Tooltip>
                })}
            </div>
        </div>
    )
}

export default ClientPresentation
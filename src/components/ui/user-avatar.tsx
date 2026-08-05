import { cn, reportsSummaryConfig } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

interface UserAvatarProps {
    tooltip?: string;
    image: string | null;
    fallback: string;
    sales_unit?: string
    className?: string
}

function UserAvatar({ tooltip, image, fallback, sales_unit, className }: UserAvatarProps) {
    const color = sales_unit ?
        reportsSummaryConfig[
            sales_unit
                .split(" ")
                .join("_") as keyof typeof reportsSummaryConfig
        ]?.color : "#d22735";
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Avatar className={cn("border-2", className)}
                    style={{
                        borderColor: color,
                        backgroundColor: `${color}10`,
                        color: color,
                    }}>
                    <AvatarImage src={`${import.meta.env.VITE_SERVER}images/${image}`} className="object-cover object-top" />
                    <AvatarFallback className="text-xs uppercase font-semibold bg-inherit">
                        {fallback}
                    </AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            {tooltip && <TooltipContent className='capitalize'>{tooltip}</TooltipContent>}
        </Tooltip>
    )
}

export default UserAvatar
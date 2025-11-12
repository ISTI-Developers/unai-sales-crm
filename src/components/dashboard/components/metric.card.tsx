import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ChevronRightIcon, LucideProps, Minus, TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface TrendProps {
    rate: number;
    trend: string;
    description?: string;
}
interface MetricCardProps {
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    title: string;
    link: string;
    count?: string | number;
    trend?: TrendProps
    style?: React.CSSProperties
}
const MetricCard = ({ icon: Icon, title, link, count, style, trend }: MetricCardProps) => {
    const TrendIcon = trend ? trend.trend === "up" ? TrendingUpIcon : TrendingDownIcon : Minus;
    return (
        <Card className="p-4 min-w-[250px] rounded-lg flex flex-col gap-2 ">
            <CardTitle className="flex items-center justify-between gap-2 pb-2">
                <div className="rounded-full w-fit p-1.5" style={style}>
                    <Icon size={16} />
                </div>
                <p className="mr-auto font-normal text-sm">{title}</p>
                <Button asChild variant="outline" size="icon" className="h-7 w-7">
                    <Link to={`/${link}`}>
                        <ChevronRightIcon />
                    </Link>
                </Button>
            </CardTitle>
            <CardContent className="p-0 flex items-center gap-1.5 mt-auto">
                {count ? <p className="font-semibold text-2xl">{formatNumber(count)}</p> : <div className='h-7 bg-zinc-200 w-full rounded-md animate-pulse' />}
                {trend &&
                    <div className={cn("text-xs flex items-center  rounded gap-1  h-6 px-1",
                        trend.trend === "up" ? "bg-emerald-100 text-emerald-700" : "bg-[#fee2e2] text-red-700"
                    )}>
                        <TrendIcon size={12} strokeWidth={2.5} />
                        <span>{trend.rate}%</span>
                    </div>}
            </CardContent>
            {trend &&
                <CardFooter className="p-0">
                    <p className="text-zinc-400 text-[0.65rem] leading-tight">{trend.description}</p>
                </CardFooter>
            }
        </Card>
    )
}

export default MetricCard
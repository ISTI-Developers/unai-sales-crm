import { capitalize, cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { lrtStationMap } from '@/misc/legendMap';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

const LRTLegend = ({ activeStation, setActiveStation }: { activeStation: string; setActiveStation: (station: string) => void }) => {
    return (
        <div id='legend' className='absolute top-0 left-0 bg-[#ffffff64] border p-4 pt-2 backdrop-blur-sm z-10 flex flex-col gap-2'>
            <div className='space-y-1.5'>
                <p className='font-bold border-b'>Legend</p>
                <div className='grid gap-2'>
                    {lrtStationMap.slice(0, 5).map(legend => {
                        return <LegendItem key={legend.id} color={legend.color}>{legend.label}</LegendItem>
                    })}
                </div>
                <hr />
                <div className='grid gap-2'>
                    {lrtStationMap.slice(5).map(legend => {
                        return <LegendItem key={legend.id} color={legend.color}>{legend.label}</LegendItem>
                    })}
                </div>
            </div>
            <hr />
            <div className='flex items-center gap-1'>
                <Label>Active Station:</Label>
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className='uppercase'>{capitalize(activeStation, "_")}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {['edsa', 'gil_puyat'].map(station => {
                            return <DropdownMenuItem onClick={() => setActiveStation(station)}>{capitalize(station, "_")}</DropdownMenuItem>
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

const LegendItem = ({ color, children }: { color: string; children: ReactNode }) => {
    return <div className='flex gap-1 items-center select-none'>
        <div className={cn('w-4 h-4')} style={{ background: color }} />
        <span className='text-[0.65rem] uppercase font-semibold'>{children}</span>
    </div>
}

export default LRTLegend
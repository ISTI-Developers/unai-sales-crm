import { useMemo, useState } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { icons } from "@/data/icons"
import { Button } from "./button"
import { vibrantColors } from "@/lib/utils"
import { Check, Hash } from "lucide-react"

function IconPicker({ icon, setIcon }: { icon: string; setIcon: (icon: string) => void }) {
    const [open, setOpen] = useState(false)
    const [Icon, label] = useMemo(() => {
        return [icons.find(i => i.value === icon)?.Icon ?? Hash, icons.find(i => i.value === icon)?.label ?? "Number"];
    }, [icon])
    return (
        <Popover modal={false} open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="bg-slate-200 rounded-md h-8 text-sm text-start px-3 flex items-center gap-2"
                >
                    {icon ? <>
                        <Icon size={16} strokeWidth={3} />
                        <span className="text-xs">{label}</span>
                    </> : 'Select icon'}
                </button>
            </PopoverTrigger>

            <PopoverContent
                side="bottom"
                align="start"
                className="z-[100] min-w-[var(--radix-popover-trigger-width)] pointer-events-auto"
            >
                <div className="flex flex-wrap">
                    {icons.map(option => {
                        const Icon = option.Icon;
                        return <Button type="button" key={option.value} variant="ghost" size="icon" data-active={icon === option.value} onClick={() => setIcon(option.value)}
                            className="data-[active=true]:bg-emerald-200 hover:data-[active=true]:bg-emerald-200 data-[active=true]:text-emerald-500 hover:data-[active=true]:text-emerald-500 ">
                            <Icon />
                        </Button>
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}
export function ColorPicker({ color, setColor }: { color: string; setColor: (color: string) => void }) {
    const [open, setOpen] = useState(false)
    return (
        <Popover modal={false} open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="bg-slate-200 rounded-md h-8 text-sm text-start px-3 flex items-center gap-2"
                >
                    {color ? <>
                        <div className="w-4 h-4 rounded-sm " style={{ backgroundColor: color }} />
                        <span className="text-xs">{color}</span>
                    </> : "Select color"}
                </button>
            </PopoverTrigger>

            <PopoverContent
                side="bottom"
                align="start"
                className="z-[100] min-w-[var(--radix-popover-trigger-width)] pointer-events-auto"
            >
                <div className="flex flex-wrap gap-2">
                    {vibrantColors.map(option => {
                        return <div key={option} className="relative">
                            {color === option && <div className="absolute w-6 h-6 flex justify-center items-center bg-white/20 text-white">
                                <Check size={16} strokeWidth={3} />
                            </div>}
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 border" style={{ backgroundColor: option }} onClick={() => {
                                setColor(option)
                            }} />
                        </div>
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default IconPicker

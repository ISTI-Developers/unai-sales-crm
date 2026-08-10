import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { TableIcon } from "lucide-react"

interface TablePickerProps {
    onSelect: (rows: number, columns: number) => void
    maxRows?: number
    maxColumns?: number
    isActive: boolean
}

export function TablePicker({
    onSelect,
    maxRows = 10,
    maxColumns = 10,
    isActive = false
}: TablePickerProps) {
    const [open, setOpen] = useState(false)
    const [hovered, setHovered] = useState({
        rows: 0,
        columns: 0,
    })

    const handleSelect = () => {
        if (!hovered.rows || !hovered.columns) return

        onSelect(hovered.rows, hovered.columns)
        setOpen(false)
        setHovered({ rows: 0, columns: 0 })
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" data-active={isActive} size="icon" className="size-7 data-[active=true]:bg-gray-200">
                    <TableIcon />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-auto p-3"
                onMouseLeave={() =>
                    setHovered({
                        rows: 0,
                        columns: 0,
                    })
                }
            >
                <div className="mb-2 text-center text-sm font-medium">
                    {hovered.rows && hovered.columns
                        ? `${hovered.columns} × ${hovered.rows}`
                        : "Insert table"}
                </div>

                <div
                    className="grid gap-1"
                    style={{
                        gridTemplateColumns: `repeat(${maxColumns}, 1.25rem)`,
                    }}
                >
                    {Array.from({
                        length: maxRows * maxColumns,
                    }).map((_, index) => {
                        const row = Math.floor(index / maxColumns) + 1
                        const column = (index % maxColumns) + 1

                        const active =
                            row <= hovered.rows &&
                            column <= hovered.columns

                        return (
                            <button
                                key={`${row}-${column}`}
                                type="button"
                                aria-label={`${column} columns x ${row} rows`}
                                className={cn(
                                    "h-5 w-5 rounded-sm border transition-colors",
                                    active
                                        ? "border-primary bg-zinc-200"
                                        : "border-border bg-white hover:bg-muted"
                                )}
                                onMouseEnter={() =>
                                    setHovered({
                                        rows: row,
                                        columns: column,
                                    })
                                }
                                onClick={handleSelect}
                            />
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { WidgetData } from "@/misc/dashboardLayoutMap";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Hash, Trash2 } from "lucide-react";
import { icons } from "@/data/icons";
import { useWidgetData } from "@/lib/fetch";
import { useState } from "react";
import WeeklyReportsCard from "./weeklyReportsCard";

const ResponsiveGridLayout = WidthProvider(Responsive);

const Editor = ({ widgets, isEditable, onDelete }: { widgets: WidgetData[]; isEditable: boolean; onDelete: (id: string) => void }) => {
    const [breakpoint, setBreakpoint] = useState("lg");
    const [cols, setCols] = useState(12);
    const ROW_HEIGHT = 35;
    const COLS = { lg: 12, md: 9, sm: 6, xs: 3, xxs: 1 };
    return (
        <div
            className="relative"
            style={isEditable ? {
                backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
                backgroundSize: `calc(100% / ${cols}) ${ROW_HEIGHT + 14}px`,
                minHeight: `${ROW_HEIGHT}px`
            } : undefined}
        >
            <ResponsiveGridLayout
                layouts={{
                    lg: widgets.flatMap(w => w.layouts.lg ?? []),
                    md: widgets.flatMap(w => w.layouts.md ?? []),
                    sm: widgets.flatMap(w => w.layouts.sm ?? []),
                    xs: widgets.flatMap(w => w.layouts.xs ?? []),
                    xxs: widgets.flatMap(w => w.layouts.xxs ?? []),
                }}
                cols={COLS}
                rowHeight={ROW_HEIGHT}
                isDraggable={isEditable}
                isResizable={false}
                onLayoutChange={(_, allLayouts) => {
                    console.log(allLayouts)
                }}
                onBreakpointChange={(newBreakpoint, newCols) => {
                    setBreakpoint(newBreakpoint);
                    setCols(newCols)
                }}
                draggableCancel="button"
            >
                {widgets.map((widget: WidgetData) => (
                    <Card key={widget.key} className={cn("relative rounded-sm p-4 border shadow transition-all flex flex-col gap-4", isEditable ? " border-2 border-dashed shadow-none select-none" : "", widget.type === "Metrics" ? "justify-between" : "")}>
                        <WidgetCard widget={widget} />
                        {isEditable &&
                            <div className="absolute bottom-0 right-0 bg-white flex gap-2 p-2 z-[500]">
                                <Button variant="destructive" size="icon" type="button" onClick={() => onDelete(widget.key)}><Trash2 /></Button>
                            </div>
                        }
                    </Card>
                ))}
            </ResponsiveGridLayout>
            {isEditable && <div className="absolute top-0 w-full h-full pointer-events-none">{breakpoint}</div>}
        </div>
    )
}

export const WidgetCard = ({ widget, isPreview }: { widget: WidgetData; isPreview?: boolean }) => {
    const data = useWidgetData(widget.module, widget.filter, widget.type);
    return <>
        <div className="flex items-center justify-between gap-1.5">
            <p>{widget.label}</p>
            <div
                className="rounded-full p-2"
                style={{ backgroundColor: `${widget.color}1A`, color: widget.color }}
            >
                {(() => {
                    const Icon =
                        icons.find(
                            (icon) =>
                                icon.value === widget.icon
                        )?.Icon ?? Hash
                    return <Icon className="w-5 h-5" />
                })()}
            </div>

        </div>
        {widget.type === "Metrics" ?
            <p className="text-4xl 2xl:text-5xl font-light ">{isPreview ? widget.content : data ?? 0}</p>
            :
            <div>
                <WeeklyReportsCard />
            </div>}
    </>
}
export default Editor
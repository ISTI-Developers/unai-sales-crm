import { Hash, Plus } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Dispatch, SetStateAction, useMemo, useState } from "react"
import { chartFieldOptions, ChartOptionConfigItem, ChartWidget, SourceFilter, sourceFilters, TypeDimensions, Widget, WidgetData, WidgetIconMap, WidgetType, widgetTypes } from "@/misc/dashboardLayoutMap"
import { motion, AnimatePresence } from "framer-motion"
import { capitalize, cn } from "@/lib/utils"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Layout, Layouts } from "react-grid-layout"
import IconPicker, { ColorPicker } from "../ui/iconpicker"
import { icons } from "@/data/icons"
import WidgetPreview from "./preview.widget"
import MultiComboBoxWithAll from "../multicomboboxwithall"
import { List } from "@/interfaces"
import { useOptions } from "@/lib/fetch"
import { useAuth } from "@/providers/auth.provider"

const EditHeader = ({ onToggleEdit, widgets, onWidgetUpdate }: { onToggleEdit: (toggle: boolean) => void; widgets: Widget[]; onWidgetUpdate: (widget: WidgetData) => void }) => {
    const [open, onOpenChange] = useState(false)
    const [widget, setWidget] = useState<WidgetData>({
        key: "",
        type: undefined,
        label: "",
        content: 0,
        icon: "Hash",
        color: "#233345",
        module: "",
        filter: [],
        layouts: {
        },
    });
    function generateWidgetId(type: WidgetType, existing: Widget[]) {
        const count = existing.filter(w => w.type === type).length;
        return type ? `${type.toLowerCase()}_${count + 1}` : '';
    }
    function getNextPosition(layouts: Layout[], cols: number, defaultW: number, defaultH: number) {
        if (layouts.length === 0) {
            return { x: 0, y: 0, w: defaultW, h: defaultH };
        }

        const last = layouts[layouts.length - 1];
        let nextX = last.x + last.w;
        let nextY = last.y;

        // If it overflows the grid width, wrap to next row
        if (nextX + defaultW > cols) {
            nextX = 0;
            nextY = last.y + last.h;
        }

        return { x: nextX, y: nextY, w: defaultW, h: defaultH };
    }
    // but inside generateLayouts → return only the new widget’s layout
    function generateLayouts(id: string, type: WidgetType, existingLayouts: Layouts) {
        if (!type) return;

        const lg = TypeDimensions[type]['lg'];
        const md = TypeDimensions[type]['md'];
        const sm = TypeDimensions[type]['sm'];
        const xs = TypeDimensions[type]['xs'];
        const xxs = TypeDimensions[type]['xxs'];

        return {
            lg: [{ i: id, ...getNextPosition(existingLayouts.lg, 12, ...lg) }],
            md: [{ i: id, ...getNextPosition(existingLayouts.md, 9, ...md) }],
            sm: [{ i: id, ...getNextPosition(existingLayouts.sm, 6, ...sm) }],
            xs: [{ i: id, ...getNextPosition(existingLayouts.xs, 3, ...xs) }],
            xxs: [{ i: id, ...getNextPosition(existingLayouts.xxs, 1, ...xxs) }],
        };
    }
    function mergeLayouts(widgets: Widget[]) {
        return {
            lg: widgets.flatMap(w => w.layouts.lg ?? []),
            md: widgets.flatMap(w => w.layouts.md ?? []),
            sm: widgets.flatMap(w => w.layouts.sm ?? []),
            xs: widgets.flatMap(w => w.layouts.xs ?? []),
            xxs: widgets.flatMap(w => w.layouts.xxs ?? []),
        };
    }


    const setType = (type: WidgetType) => {
        setWidget(prev => {
            if (!prev || type === undefined) return prev;

            return {
                ...prev,
                type: type,
                label: type,
                content: 100,
                icon: WidgetIconMap[type as keyof typeof WidgetIconMap],
                chartOptions: type === "Bar" || type === "Pie" || type === "Area" ? {
                    field: undefined,
                    chartConfig: {},
                    dataKey: "count",
                    nameKey: "label",
                    data: [],
                } : undefined
            }
        })
    }

    const onSave = () => {
        const id = generateWidgetId(widget.type, widgets);
        const layouts = generateLayouts(id, widget.type, mergeLayouts(widgets));

        if (!layouts) return;

        const updatedWidget = {
            ...widget,
            key: id,
            layouts: layouts

        }
        onWidgetUpdate(updatedWidget)
        onOpenChange(false)
    }
    return (
        <div className="flex justify-between items-center gap-4 p-2 pb-0">
            <h1 className="font-bold">Edit Mode</h1>
            <Dialog modal open={open} onOpenChange={(open) => {
                onOpenChange(open);
                setWidget({
                    key: "",
                    type: undefined,
                    label: "",
                    content: 0,
                    icon: "Hash",
                    color: "#233345",
                    module: "",
                    filter: [],
                    layouts: {
                    },
                })
            }}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-full mr-auto h-7">
                        <Plus />
                        <span>Widget</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Add Widget</DialogTitle>
                        <DialogDescription>Add new widget by setting up the configurations below.</DialogDescription>
                    </DialogHeader>
                    <div className={cn("flex min-h-[50vh] items-center rounded-md", widget.type ? "p-0 bg-transparent" : "p-4 bg-slate-100")}>
                        <AnimatePresence mode="wait">
                            {!widget.type &&
                                <motion.div key="selection"
                                    className="mx-auto text-center space-y-4 text-xs font-semibold text-slate-500"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}>
                                    <p>Add a widget to visualize your dashboard</p>
                                    <div className="h-fit flex flex-wrap max-w-sm mx-auto gap-4 items-center justify-center">
                                        {widgetTypes.map(type => {
                                            if (type === undefined) return;

                                            const Icon = icons.find(icon => icon.value === WidgetIconMap[type])?.Icon ?? Hash;

                                            return <div key={type} role="button" className="cursor-pointer p-4 min-w-[100px] flex flex-col gap-2 items-center justify-center rounded-md bg-white transition-all hover:-translate-y-1 hover:shadow-sm" title="button" onClick={() => setType(type)}>
                                                <Icon size={32} />
                                                <span className="font-semibold uppercase text-xs">{type}</span>
                                            </div>
                                        })}
                                    </div>
                                </motion.div>
                            }
                            {widget.type &&
                                <motion.div key="configuration"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }} className="w-full h-full flex flex-col lg:flex gap-4 relative">
                                    <div className="w-full h-full flex flex-col-reverse lg:flex-row gap-4 max-h-[50vh] overflow-auto">
                                        <section key="settings" className="bg-slate-100 w-full lg:max-w-[50%] rounded h-full shadow-sm p-4 flex flex-col gap-2 overflow-auto">
                                            <header className="text-sm font-semibold">Configure {widget.type}</header>
                                            <main className="space-y-2">
                                                <Configuration widget={widget} setWidget={setWidget} />
                                            </main>
                                        </section>
                                        {/* PREVIEW */}
                                        <WidgetPreview widget={widget} />
                                    </div>
                                    <Button onClick={onSave} disabled={widget.module === ""} className="lg:absolute right-0 bottom-0 bg-main-100 text-white hover:bg-main-400 hover:text-white" variant="outline">
                                        Generate
                                    </Button>
                                </motion.div>
                            }
                        </AnimatePresence>

                    </div>
                </DialogContent>
            </Dialog>
            <Button onClick={() => onToggleEdit(false)} className="p-[0.3rem] px-2 rounded-full h-auto text-xs bg-emerald-100 border-none text-emerald-400 hover:bg-emerald-200 hover:text-emerald-400" variant="outline">
                Save Changes
            </Button>
        </div>
    )
}

function Configuration({ widget, setWidget }: { widget: WidgetData; setWidget: Dispatch<SetStateAction<WidgetData>> }) {
    const { user } = useAuth();
    const filterOptions = useMemo(() => {
        if (widget.module === "") return undefined;

        return sourceFilters[widget.module as keyof typeof sourceFilters];
    }, [widget.module])

    const onSourceSelect = (value: string) => {
        const options = sourceFilters[value as keyof typeof sourceFilters]
        if (!options) return;

        const filter = Object.keys(options).map(option => ({ key: option, value: [] }))
        setWidget(prev => ({ ...prev, module: value, filter: filter }))
    }
    return <>
        <div>
            <Label htmlFor="label" className="text-xs">Label</Label>
            <Input id="label" value={widget.label} placeholder="Set label" onChange={(e) => setWidget(prev => ({ ...prev, label: e.target.value }))} className="h-8 bg-slate-200 shadow-none" />
        </div>
        <div className="grid grid-cols-[2fr_1fr] gap-2">
            <div className="flex flex-col">
                <Label htmlFor="icon" className="text-xs">Icon</Label>
                <IconPicker icon={widget.icon} setIcon={(icon) => setWidget(prev => ({ ...prev, icon: icon }))} />
            </div>
            <div className="flex flex-col">
                <Label htmlFor="icon" className="text-xs">Color</Label>
                <ColorPicker color={widget.color} setColor={(color) => setWidget(prev => ({ ...prev, color: color }))} />
            </div>
        </div>
        <div>
            <Label htmlFor="Source" className="text-xs">Source</Label>
            <Select value={widget.module} onValueChange={onSourceSelect}>
                <SelectTrigger id="source" className="h-8 bg-slate-200 shadow-none">
                    <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='clients'>Clients</SelectItem>
                    {(user && user.company?.code === "UNAI") &&
                        <SelectItem value='sites'>Sites</SelectItem>
                    }
                    <SelectItem value='reports'>Reports</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div>
            <Label htmlFor="filters" className="text-xs">Filters</Label>
            {filterOptions ?
                <div className="bg-slate-200 min-h-[50px] rounded-md flex flex-col">
                    {Object.keys(filterOptions).map(option => {

                        const filters = widget.filter.find(filter => filter.key === option);
                        if (!filters) return;

                        return <FilterItem key={option} id={option} filters={filters} onValueChange={(value) => {
                            setWidget(prev => {
                                const exists = prev.filter.find(filter => filter.key === option);

                                return {
                                    ...prev,
                                    filter: exists ? [
                                        ...prev.filter.map(filter => {
                                            if (filter.key === option) {
                                                return {
                                                    key: option,
                                                    value: value
                                                }
                                            }

                                            return filter;
                                        })
                                    ] : prev.filter
                                }
                            })
                        }} options={filterOptions[option as keyof typeof filterOptions]} />
                    })}
                </div>
                :
                <div className="bg-slate-200 min-h-[50px] rounded-md flex items-center justify-center text-center text-xs text-slate-600">
                    Please select a source to view available filters.
                </div>
            }
        </div>
        {(widget.type === "Bar" || widget.type === "Pie" || widget.type === "Area") && (
            <ChartConfiguration widget={widget as ChartWidget} setWidget={setWidget} />
        )}

    </>
}

function ChartConfiguration({ widget, setWidget }: { widget: ChartWidget; setWidget: Dispatch<SetStateAction<WidgetData>> }) {
    const fieldOptions = useMemo(() => {
        if (!widget.module) return [];

        return chartFieldOptions[widget.module];
    }, [widget])

    const setField = (val: string) => {
        setWidget(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                chartOptions: {
                    ...(prev as ChartWidget).chartOptions,
                    field: val,
                }
            }
        })
    }
    return <div className="space-y-1">
        <Label htmlFor="filters" className="text-xs">Options</Label>
        <div className="bg-slate-200 p-2 rounded-md">
            <div className="space-y-2">
                <Label>Data</Label>
                {fieldOptions.length > 0 ?
                    <Select value={widget.chartOptions.field} onValueChange={setField}>
                        <SelectTrigger id="source" className="h-8 bg-white shadow-none">
                            <SelectValue placeholder="Select Source" />
                        </SelectTrigger>
                        <SelectContent>
                            {fieldOptions.map(field => {
                                return <SelectItem key={field} value={field}>{capitalize(field, "_")}</SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                    : <div className="bg-slate-200 min-h-[50px] rounded-md flex items-center justify-center text-center text-xs text-slate-600">
                        Please select a source to view available field configurations.
                    </div>}
                {!(fieldOptions.length === 0) &&
                    <ChartOptions key={widget.chartOptions.field} field={widget.chartOptions.field} onSelectChange={(value) => {
                        const config = value.reduce((acc, item, index) => {
                            if (!acc[item.label]) {
                                acc[item.label] = {
                                    label: item.label,
                                    color: `var(--chart-${index + 1})`,
                                };
                            }
                            return acc; // ✅ return accumulator
                        }, {} as Record<string, ChartOptionConfigItem>);
                        setWidget(prev => {
                            if (!prev) return prev;

                            return {
                                ...prev,
                                chartOptions: {
                                    ...(prev as ChartWidget).chartOptions,
                                    chartConfig: config,
                                    data: value.map(val => ({ key: val.label, id: Number(val.value) }))
                                }
                            }
                        })
                    }} />
                }
            </div>
        </div>
    </div>

}

function ChartOptions({ field, onSelectChange }: { field?: string; onSelectChange: (value: List[]) => void }) {
    const [value, setValue] = useState<List[]>([])
    const options = useOptions(field);

    const onValueChange = (value: List[]) => {
        setValue(value)
        onSelectChange(value)
    }

    return options && <div>
        <Label>Records</Label>
        <MultiComboBoxWithAll value={value} onValueChange={onValueChange} options={options} title={field} />
    </div>
}

function FilterItem({ id, options, filters, onValueChange }: { id: string; options: string[]; filters: SourceFilter; onValueChange: (value: string[]) => void }) {
    const { user } = useAuth();
    const setValue = (value: List[]) => {
        onValueChange(value.map(val => val.value))
    };

    const filteredOptions = useMemo(() => {
        if (!user) return [];

        if (user.role.role_id !== 1) {
            return options.filter(option => !['company/BU'].includes(option))
        }
        if (user.company?.code !== "UNAI") {
            return options.filter(option => !["team"].includes(option))
        }
        return options;
    }, [user, options])

    return <div className="p-2">
        <Label htmlFor={id} className="capitalize text-xs">{id}</Label>
        <MultiComboBoxWithAll options={filteredOptions.map(option => {
            return {
                id: option,
                value: option,
                label: capitalize(option)
            }
        })} value={filters.value.map(value => {
            return {
                id: value,
                value: value,
                label: capitalize(value)
            }
        })} onValueChange={setValue} title={id} isSingle={['ownership', 'options'].includes(id)} />
    </div >
}

export default EditHeader
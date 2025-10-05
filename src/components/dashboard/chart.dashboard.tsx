import { ChartWidget } from "@/misc/dashboardLayoutMap"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { useData } from "@/lib/fetch";
import { useAuth } from "@/providers/auth.provider";
import useReportSummary from "@/data/reportSummary.data";
import { useMemo } from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
const DashboardChart = ({ widget }: { widget: ChartWidget }) => {
    const config = widget.chartOptions.chartConfig satisfies ChartConfig;
    const data = useData(widget.module, widget.chartOptions.field, config, widget.chartOptions.data);

    return (
        <div>
            {widget.type === "Pie" ?
                <PieContainer config={config} data={data ?? []} widget={widget} /> :
                widget.type === "Bar" ?
                    <BarContainer config={config} data={data ?? []} widget={widget} /> : <AreaContainer />}
        </div>
    )
}

interface Data {
    label: string;
    count: number;
    fill: string
}
const PieContainer = ({ config, data, widget }: { config: ChartConfig; data: Data[], widget: ChartWidget }) => {
    return <>
        <ChartContainer config={config} className="w-full max-h-[200px]">
            <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={data} dataKey={widget.chartOptions.dataKey}
                    nameKey={widget.chartOptions.nameKey} innerRadius={"40%"}
                    outerRadius={"95%"}
                    strokeWidth={5}
                    paddingAngle={5}
                    cornerRadius={5} >
                </Pie>
            </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-2 text-xs w-full">
            {data?.map((pie) => {
                return (
                    <div key={pie.label} className="flex gap-2">
                        <div
                            className="w-3 h-3 rounded"
                            style={{ background: pie.fill }}
                        />
                        <p className="text-[0.65rem]">{pie.label}</p>
                    </div>
                );
            })}
        </div>
    </>
}

const BarContainer = ({ config, data, widget }: { config: ChartConfig; data: Data[], widget: ChartWidget }) => {
    return <ChartContainer config={config} className="max-h-[300px] w-full">
        <BarChart accessibilityLayer data={data} margin={{bottom: 50}}>
            <CartesianGrid vertical={false} />
            <XAxis
                dataKey={widget.chartOptions.nameKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                interval={0}
                tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                        <text
                            x={x}
                            y={y}
                            dy={0}
                            textAnchor="end"
                            fontSize={10}
                            transform={`rotate(-40, ${x}, ${y})`}
                        >
                            {payload.value}
                        </text>
                    );
                }}
            />

            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey={widget.chartOptions.dataKey}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
            </Bar>
        </BarChart>
    </ChartContainer>
}

const AreaContainer = () => {
    const { user } = useAuth();
    const {
        reportSummaryByMonth: data,
        show,
        setShow,
        reportsSummaryConfig,
    } = useReportSummary();

    const isAdmin = useMemo(() => {
        if (!user) return false;
        return [1, 3, 11, 10].includes(user.role.role_id);
    }, [user]);

    return <div className="flex flex-col h-full text-sm gap-2">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h1 className="font-semibold">Reports Submission Summary</h1>
            <div className="flex items-center gap-1">
                <Label htmlFor="show" className="text-xs">Reports for: </Label>
                {isAdmin ? (
                    <Select value={show} onValueChange={setShow}>
                        <SelectTrigger id="show" className="w-fit h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {Object.keys(reportsSummaryConfig).map((option) => {
                                return (
                                    <SelectItem value={option} key={option}>
                                        {option.replace("_", " ")}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                ) : (
                    user?.sales_unit?.unit_name ?? "All"
                )}
            </div>
        </div>
        <ChartContainer
            config={reportsSummaryConfig}
            className="h-full max-h-[175px]"
        >
            <AreaChart accessibilityLayer margin={{ left: -16 }} data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <defs>
                    {Object.keys(reportsSummaryConfig).map((config) => {
                        return (
                            <linearGradient
                                id={`fill-${config}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="10%"
                                    stopColor={`var(--color-${config})`}
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="90%"
                                    stopColor={`var(--color-${config})`}
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        );
                    })}
                </defs>
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                />
                <YAxis />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                {Object.keys(reportsSummaryConfig).map((config) => {
                    return (
                        <Area
                            dataKey={config}
                            type="monotone"
                            fill={`url(#fill-${config})`}
                            stroke={`var(--color-${config})`}
                            stackId="a"
                        />
                    );
                })}
                {isAdmin && <ChartLegend content={<ChartLegendContent />} />}
            </AreaChart>
        </ChartContainer>
    </div>
}

export default DashboardChart
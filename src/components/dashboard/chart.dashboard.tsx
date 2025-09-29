import { ChartWidget } from "@/misc/dashboardLayoutMap"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Pie, PieChart } from "recharts";
import { useData } from "@/lib/fetch";

const DashboardChart = ({ widget }: { widget: ChartWidget }) => {
    const config = widget.chartOptions.chartConfig satisfies ChartConfig;
    const data = useData(widget.module, widget.chartOptions.field, config, widget.chartOptions.data);

    console.log(data, config);
    return (
        <div>
            <ChartContainer config={config} className="w-full max-h-[160px]">
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
        </div>
    )
}

export default DashboardChart
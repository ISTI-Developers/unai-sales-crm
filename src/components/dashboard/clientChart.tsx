import useClientData from "@/data/clientSummary.data";
import { useMemo } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import DashboardCard from "../DashboardCard";
import { Label, Pie, PieChart } from "recharts";
import { Skeleton } from "../ui/skeleton";

const ClientChart = () => {
  const { clientSummary, isLoading } = useClientData();
  const chartConfig = {
    hot: {
      label: "Hot",
      color: "#fdba74",
    },
    active: {
      label: "Active",
      color: "#86efac",
    },
    onOff: {
      label: "On/Off",
      color: "#7dd3fc",
    },
    forElections: {
      label: "For Elections",
      color: "#c4b5fd",
    },
    pool: {
      label: "Pool",
      color: "#cbd5e1",
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    return clientSummary.map((item) => {
      return {
        status: item.status,
        fill: chartConfig[item.key as keyof typeof chartConfig].color,
        count: item.count,
      };
    });
  }, [chartConfig, clientSummary]);

  return (
    <DashboardCard className="md:col-[1/4] flex flex-col xl:row-[2/4]">
      {isLoading ? (
        <Skeleton className="w-full h-full" />
      ) : (
        <>
          <ChartContainer config={chartConfig} className="max-h-[200px] xl:max-h-[250px]">
            <PieChart accessibilityLayer>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={"60%"}
                outerRadius={"90%"}
                strokeWidth={5}
                paddingAngle={5}
                cornerRadius={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-lg xl:text-xl font-bold"
                          >
                            Clients
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground text-[0.65rem]"
                          >
                            Status Distribution
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex flex-wrap justify-center gap-2 text-xs w-full">
            {chartData.map((pie) => {
              return (
                <div key={pie.status} className="flex gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: pie.fill }}
                  />
                  <p className="text-[0.65rem]">{pie.status}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DashboardCard>
  );
};

export default ClientChart;

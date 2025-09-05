import { Card } from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import useClientData from "@/data/clientSummary.data";
import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";

const Clients = () => {
  const { count, clientSummary } = useClientData();
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
    <Card className="border rounded w-full lg:w-1/2 py-4 lg:px-4">
      <div className="lg:max-h-[500px] flex flex-col md:flex-row gap-4 md:items-center lg:flex-col xl:flex-row">
        <ChartContainer config={chartConfig} className="w-full">
          <PieChart accessibilityLayer>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={"75%"}
              outerRadius={"100%"}
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
                          className="fill-foreground text-2xl xl:text-3xl font-bold"
                        >
                          {count.total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Clients
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap justify-center md:flex-nowrap md:flex-col gap-4  w-full">
          {chartData.map((pie) => {
            return (
              <div key={pie.status} className="flex gap-4 font-semibold">
                <div
                  className="w-6 h-6 rounded"
                  style={{ background: pie.fill }}
                />
                <p>{pie.status}</p>
                <p className="hidden lg:block ml-auto">{pie.count}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default Clients;

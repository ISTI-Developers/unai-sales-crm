import { useClientDistribution } from "@/hooks/useDashboard";
import { useAuth } from "@/providers/auth.provider";
import { useMemo } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import DashboardCard from "../DashboardCard";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Skeleton } from "../ui/skeleton";

interface PivotedRow {
  [status: string]: string | number;
}

const ClientDistributionChart = () => {
  const { user } = useAuth();
  const { data, isLoading } = useClientDistribution(
    user?.sales_unit?.sales_unit_id ?? undefined
  );

  const chartData = useMemo(() => {
    if (!data || isLoading) return [];
    // Step 1: Get all unique statuses
    const allStatuses = [...new Set(data.map((item) => item.status))];

    // Step 2: Pivot using reduce
    const pivoted = Object.values(
      data.reduce<Record<string, PivotedRow>>((acc, curr) => {
        const { salesUnit, status, clients } = curr;
        const unitKey = salesUnit as keyof typeof curr;
        // Initialize the unit if it doesn't exist
        if (!acc[unitKey]) {
          acc[unitKey] = { salesUnit: salesUnit };

          // Fill all statuses with 0 initially
          allStatuses.forEach((s) => (acc[unitKey][s] = 0));
        }

        // Assign the actual clients value
        acc[unitKey][status] = clients;

        return acc;
      }, {})
    );
    return pivoted;
  }, [data, isLoading]);

  const chartConfig = {
    hot: {
      label: "HOT",
      color: "#fdba74",
    },
    active: {
      label: "ACTIVE",
      color: "#86efac",
    },
    onoff: {
      label: "ON/OFF",
      color: "#7dd3fc",
    },
    forelections: {
      label: "FOR ELECTIONS",
      color: "#c4b5fd",
    },
  } satisfies ChartConfig;
  return (
    <DashboardCard className="md:col-[4/7] md:row-[2/3] xl:row-[2/4] w-full">
      {isLoading ? (
        <Skeleton className="w-full h-full"/>
      ) : (
        <ChartContainer config={chartConfig} className="h-full max-h-[225px] xl:max-h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="salesUnit"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="hot"
              stackId="a"
              fill="var(--color-hot)"
              radius={[0, 0, 2, 2]}
            />
            <Bar
              dataKey="active"
              stackId="a"
              fill="var(--color-active)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="onoff"
              stackId="a"
              fill="var(--color-onoff)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="forelections"
              stackId="a"
              fill="var(--color-forelections)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      )}
    </DashboardCard>
  );
};

export default ClientDistributionChart;

import useReportSummary from "@/data/reportSummary.data";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { useMemo } from "react";
import { useAuth } from "@/providers/auth.provider";
import DashboardCard from "../DashboardCard";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "../ui/skeleton";

const ReportsSubmissionChart = () => {
  const { user } = useAuth();
  const {
    reportSummaryByMonth: data,
    show,
    setShow,
    reportsSummaryConfig,
    isLoading,
  } = useReportSummary();

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return [1, 3, 11, 10].includes(user.role.role_id);
  }, [user]);

  return (
    <DashboardCard className="md:row-[4/5] md:col-[1/7] xl:row-[4/5] flex flex-col gap-4 h-full">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1>Reports Submission Summary</h1>
        <div className="flex items-center gap-1">
          <Label htmlFor="show">Reports for: </Label>
          {isAdmin ? (
            <Select value={show} onValueChange={setShow}>
              <SelectTrigger id="show" className="w-fit">
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
      {isLoading ? (
        <Skeleton className="w-full h-full" />
      ) : (
        <ChartContainer
          config={reportsSummaryConfig}
          className="h-full max-h-[200px] w-full"
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
      )}
    </DashboardCard>
  );
};

export default ReportsSubmissionChart;

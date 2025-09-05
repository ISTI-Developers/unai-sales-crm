import useReportSummary from "@/data/reportSummary.data";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Separator } from "../ui/separator";
import { useAuth } from "@/providers/auth.provider";
import { useMemo } from "react";

const Reports = () => {
  const { reportSummaryByMonth, show, setShow } = useReportSummary();
  const { user } = useAuth();

  const reportsSummaryConfig = {
    DRF: {
      label: "DRF",
      color: "#991b1b",
    },
    SU_1: {
      label: "SU 1",
      color: "#9a3412",
    },
    SU_2: {
      label: "SU 2",
      color: "#854d0e",
    },
    SU_3: {
      label: "SU 3",
      color: "#065f46",
    },
    SU_4: {
      label: "SU 4",
      color: "#1e40af",
    },
    SU_5: {
      label: "SU 5",
      color: "#1e1b4b",
    },
    SU_6: {
      label: "SU 6",
      color: "#581c87",
    },
    SU_7: {
      label: "SU 7",
      color: "#881337",
    },
  } satisfies ChartConfig;

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return [1, 3, 4, 10].includes(user.role.role_id);
  }, [user]);

  return (
    <Card className="border rounded w-full xl:w-1/2 xl:max-h-[50vh]">
      <CardHeader className="py-2">
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <CardTitle>Reports Submission Summary</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="show">Reports for </Label>
            {isAdmin ? (
              <Select value={show} onValueChange={setShow}>
                <SelectTrigger id="show" className="w-fit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Object.keys(reportsSummaryConfig)
                  .map((option) => {
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
        <Separator />
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <ChartContainer
          config={reportsSummaryConfig}
          className="w-full"
        >
          <AreaChart
            accessibilityLayer
            margin={{ left: -16 }}
            data={reportSummaryByMonth}
          >
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
      </CardContent>
    </Card>
  );
};

export default Reports;

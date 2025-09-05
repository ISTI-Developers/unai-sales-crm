import useSiteSummary from "@/data/useSiteSummary";
import { Card } from "../ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { Separator } from "../ui/separator";
import { useMemo } from "react";
const Sites = () => {
  const { siteAvailability: sites, groupedSitesByRegion } = useSiteSummary();

  const availableCount = useMemo(() => {
    if (sites.available === 0 && sites.sites === 0) return 0;

    return (sites.available / sites.sites) * 100;
  }, [sites]);
  const bookedCount = useMemo(() => {
    if (sites.booked === 0 && sites.sites === 0) return 0;

    return (sites.booked / sites.sites) * 100;
  }, [sites]);
  return (
    <Card className="border rounded w-full lg:w-1/2 p-4 flex flex-col xl:flex-row gap-2">
      <div className="w-full xl:w-1/2 flex flex-col gap-2 justify-between ">
        <div className="font-bold bg-gradient-to-br from-[#233345] to-[#2d5c91] text-white h-full p-2.5 rounded flex items-center justify-center">
          <p className="text-4xl flex flex-col justify-center items-center">
            <span>{sites.sites}</span>
            <span className="text-lg">sites</span>
          </p>
        </div>
        <div className="transition-all bg-slate-200 rounded-md pt-1 px-1">
          <div className="flex justify-between px-1 font-semibold">
            <p>Available</p>
            <p>Booked</p>
          </div>
          <div className="h-12 w-full p-1 px-0 flex gap-1">
            <div
              className="h-full rounded-sm bg-blue-100 text-zinc-50 font-bold flex items-center px-2"
              style={{
                width: `${availableCount === 0 ? "50" : availableCount}%`,
              }}
            >
              <p>{`${Math.round(availableCount)}%`}</p>
            </div>
            <div
              className="h-full rounded-sm bg-red-100 text-zinc-50 font-bold flex items-center justify-end px-2"
              style={{ width: `${bookedCount === 0 ? "50" : bookedCount}%` }}
            >
              <p>{`${Math.round(bookedCount)}%`}</p>
            </div>
          </div>
        </div>
      </div>
      <Separator className="xl:hidden" />
      <Separator className="hidden xl:block" orientation="vertical" />
      <SiteRegions data={groupedSitesByRegion} />
    </Card>
  );
};

function SiteRegions<TData>({ data }: { data: TData[] }) {
  const chartConfig = {
    region: {
      label: "Region",
      color: "var(--chart-1)",
    },
    count: {
      label: "Count",
      // color: "#d22735",
      color: "#34d399",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={chartConfig}
      className="max-h-[300px] lg:max-h-[350px] xl:w-1/2"
    >
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{
          right: 16,
        }}
      >
        <YAxis
          dataKey="region"
          type="category"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
          hide
        />
        <XAxis dataKey="count" type="number" hide />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Bar
          dataKey="count"
          layout="vertical"
          fill="var(--color-count)"
          radius={4}
        >
          <LabelList
            dataKey="region"
            position="insideLeft"
            offset={8}
            className="fill-white"
            fontSize={12}
          />
          <LabelList
            dataKey="count"
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
export default Sites;

import { ReactNode } from "react";
import { Layouts } from "react-grid-layout";

export type WidgetType =
  | "Metrics"
  | "Pie"
  | "Bar"
  | "Area"
  | "List"
  | undefined;
export const widgetTypes: WidgetType[] = [
  "Pie",
  "Bar",
  "Area",
  "Metrics",
  "List",
];

export const WidgetIconMap = {
  Metrics: "Hash",
  Pie: "ChartPie",
  Area: "ChartArea",
  Bar: "ChartColumnBig",
  List: "List",
};
export const ModuleIconMap = {
  Sites: "Monitor",
  Clients: "BookUser",
  Reports: "FileList",
};

export type SourceFilter = {
  key: string;
  value: string[];
};

export type chartOptions = {

}
export type WidgetData = {
  key: string;
  module: string;
  label: string;
  content: ReactNode;
  icon: string;
  color: string;
  type: WidgetType;
  filter: SourceFilter[];
  layouts: Layouts;
  chartOptions?: null;
};
export type Widget = Omit<WidgetData, "filter">;

export const sourceFilters = {
  clients: {
    ownership: ["all", "company/BU", "team", "own"],
    status: ["all", "active", "pool", "hot", "on/off", "for elections"],
  },
  sites: {
    options: ["all", "available", "booked", "projected revenue"],
  },
  reports: {
    options: ["all", "current week"],
  },
};
type Breakpoint = "lg" | "md" | "sm" | "xs" | "xxs";

// Map: WidgetType → Breakpoint → [w, h]
export const TypeDimensions: Record<
  NonNullable<WidgetType>,
  Record<Breakpoint, [number, number]>
> = {
  Metrics: {
    lg: [3, 3],
    md: [3, 3],
    sm: [2, 3],
    xs: [1, 3],
    xxs: [1, 4],
  },
  Pie: {
    lg: [3, 6],
    md: [3, 6],
    sm: [2, 6],
    xs: [1.5, 6],
    xxs: [1, 8],
  },
  Bar: {
    lg: [3, 6],
    md: [3, 6],
    sm: [2, 6],
    xs: [1.5, 6],
    xxs: [1, 8],
  },
  Area: {
    lg: [9, 6],
    md: [6, 6],
    sm: [6, 6],
    xs: [3, 6],
    xxs: [1, 6],
  },
  List: {
    lg: [3, 7.5],
    md: [3, 9],
    sm: [2, 9],
    xs: [1.5, 9],
    xxs: [1, 9],
  },
};
export type SourceFilters = typeof sourceFilters;

export const defaultWidget: WidgetData = {
  key: "",
  type: undefined,
  label: "",
  content: 0,
  icon: "Hash",
  color: "#233345",
  module: "",
  filter: [],
  layouts: {},
};
/**
 * SAMPLE USAGE
 * 
const ClientMetric: Widget = {
  key: "mw_1",
  type: "Metrics",
  label: "Total Clients",
  content: 200,
  icon: "User",
  module: "clients",
  layouts: {
    lg: [{ i: "mw_1", x: 0, y: 0, w: 2, h: 3 }],
    md: [{ i: "mw_1", x: 0, y: 0, w: 6, h: 2 }],
    sm: [{ i: "mw_1", x: 0, y: 0, w: 12, h: 2 }],
  },
};

*/

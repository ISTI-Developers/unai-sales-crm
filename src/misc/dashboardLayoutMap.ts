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

// export type chartOptions = {};
export type WidgetBase = {
  key: string;
  module: string;
  label: string;
  content: ReactNode;
  icon: string;
  color: string;
  type: WidgetType;
  filter: SourceFilter[];
  layouts: Layouts;
};

export type ChartOptionConfigItem = {
  label: string;
  color: string;
};
type ChartOptionsConfig = {
  [key: string]: ChartOptionConfigItem;
};
type ChartFieldOptions = {
  [key: string]: string[];
};
export type ChartData = {
  key: string;
  id: number;
};

export type ChartOptions = {
  field: string;
  chartConfig: ChartOptionsConfig;
  data: ChartData[];
  dataKey: string;
  nameKey: string;
};

// chart widgets
export type ChartWidget = WidgetBase & {
  type: "Area" | "Bar" | "Pie";
  chartOptions: ChartOptions; // ✅ required
};

export type WidgetData = ChartWidget | WidgetBase;

export type Widget = Omit<WidgetData, "filter">;

export const sourceFilters = {
  clients: {
    ownership: ["all clients", "company/BU", "team", "own"],
    status: ["active", "pool", "hot", "on/off", "for elections"],
  },
  sites: {
    options: [
      "all sites",
      "active",
      "inactive",
      "available",
      "booked",
      // "projected revenue",
    ],
  },
  reports: {
    options: ["current week"],
  },
};

export const chartFieldOptions: ChartFieldOptions = {
  clients: ["company", "sales_unit", "account_executive", "status"],
  sites: ["status", "availability"],
  reports: ["account_executive"],
};

type Breakpoint = "lg" | "md" | "sm" | "xs" | "xxs";

// Map: WidgetType → Breakpoint → [w, h]
export const TypeDimensions: Record<
  NonNullable<WidgetType>,
  Record<Breakpoint, [number, number]>
> = {
  Metrics: {
    lg: [4, 3],
    md: [3, 3],
    sm: [2, 3],
    xs: [1, 3],
    xxs: [1, 4],
  },
  Pie: {
    lg: [6, 7],
    md: [3, 6],
    sm: [2, 6],
    xs: [1.5, 6],
    xxs: [1, 8],
  },
  Bar: {
    lg: [6, 7],
    md: [3, 6],
    sm: [2, 6],
    xs: [1.5, 6],
    xxs: [1, 8],
  },
  Area: {
    lg: [12, 6],
    md: [6, 6],
    sm: [6, 6],
    xs: [3, 6],
    xxs: [1, 6],
  },
  List: {
    lg: [4, 8],
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

export const defaultLayout: WidgetData[] = [
  {
    key: "area_1",
    type: "Area",
    label: "Sites",
    content: 100,
    icon: "ChartArea",
    color: "#233345",
    module: "sites",
    filter: [
      {
        key: "options",
        value: ["all sites"],
      },
    ],
    layouts: {
      lg: [
        {
          w: 12,
          h: 6,
          x: 0,
          y: 10,
          i: "area_1",
          moved: false,
          static: false,
        },
      ],
      md: [
        {
          w: 6,
          h: 6,
          x: 0,
          y: 0,
          i: "area_1",
          moved: false,
          static: false,
        },
      ],
      sm: [
        {
          w: 6,
          h: 6,
          x: 0,
          y: 0,
          i: "area_1",
          moved: false,
          static: false,
        },
      ],
      xs: [
        {
          i: "area_1",
          x: 0,
          y: 9,
          w: 3,
          h: 6,
        },
      ],
      xxs: [
        {
          i: "area_1",
          x: 0,
          y: 29,
          w: 1,
          h: 6,
        },
      ],
    },
    chartOptions: {
      field: "area",
      chartConfig: {},
      dataKey: "count",
      nameKey: "label",
      data: [],
    },
  },
  {
    key: "list_1",
    type: "List",
    label: "Clients",
    content: 100,
    icon: "List",
    color: "#233345",
    module: "clients",
    filter: [
      {
        key: "ownership",
        value: ["all clients"],
      },
      {
        key: "status",
        value: ["active", "pool", "hot", "on/off", "for elections"],
      },
    ],
    layouts: {
      lg: [
        {
          w: 4,
          h: 8,
          x: 12,
          y: 8,
          i: "list_1",
          moved: false,
          static: false,
        },
      ],
      md: [
        {
          w: 3,
          h: 9,
          x: 6,
          y: 0,
          i: "list_1",
          moved: false,
          static: false,
        },
      ],
      sm: [
        {
          w: 2,
          h: 9,
          x: 0,
          y: 6,
          i: "list_1",
          moved: false,
          static: false,
        },
      ],
      xs: [
        {
          i: "list_1",
          x: 0,
          y: 15,
          w: 1.5,
          h: 9,
        },
      ],
      xxs: [
        {
          i: "list_1",
          x: 0,
          y: 35,
          w: 1,
          h: 9,
        },
      ],
    },
  },
  {
    key: "list_2",
    type: "List",
    label: "Sites",
    content: 100,
    icon: "List",
    color: "#233345",
    module: "sites",
    filter: [
      {
        key: "options",
        value: ["all sites"],
      },
    ],
    layouts: {
      lg: [
        {
          w: 4,
          h: 8,
          x: 12,
          y: 0,
          i: "list_2",
          moved: false,
          static: false,
        },
      ],
      md: [
        {
          w: 3,
          h: 9,
          x: 0,
          y: 6,
          i: "list_2",
          moved: false,
          static: false,
        },
      ],
      sm: [
        {
          w: 2,
          h: 9,
          x: 2,
          y: 6,
          i: "list_2",
          moved: false,
          static: false,
        },
      ],
      xs: [
        {
          i: "list_2",
          x: 1.5,
          y: 15,
          w: 1.5,
          h: 9,
        },
      ],
      xxs: [
        {
          i: "list_2",
          x: 0,
          y: 44,
          w: 1,
          h: 9,
        },
      ],
    },
  },
  {
    key: "pie_1",
    type: "Pie",
    label: "Clients",
    content: 100,
    icon: "ChartPie",
    color: "#233345",
    module: "clients",
    filter: [
      {
        key: "ownership",
        value: ["all clients"],
      },
      {
        key: "status",
        value: ["active", "pool", "hot", "on/off", "for elections"],
      },
    ],
    layouts: {
      lg: [
        {
          w: 6,
          h: 7,
          x: 0,
          y: 3,
          i: "pie_1",
          moved: false,
          static: false,
        },
      ],
      md: [
        {
          w: 3,
          h: 6,
          x: 3,
          y: 6,
          i: "pie_1",
          moved: false,
          static: false,
        },
      ],
      sm: [
        {
          w: 2,
          h: 6,
          x: 4,
          y: 6,
          i: "pie_1",
          moved: false,
          static: false,
        },
      ],
      xs: [
        {
          i: "pie_1",
          x: 0,
          y: 27,
          w: 1.5,
          h: 6,
        },
      ],
      xxs: [
        {
          i: "pie_1",
          x: 0,
          y: 65,
          w: 1,
          h: 8,
        },
      ],
    },
    chartOptions: {
      field: "company",
      chartConfig: {
        UNAI: {
          label: "UNAI",
          color: "var(--chart-1)",
        },
        UTASI: {
          label: "UTASI",
          color: "var(--chart-2)",
        },
        TAMC: {
          label: "TAMC",
          color: "var(--chart-3)",
        },
      },
      dataKey: "count",
      nameKey: "label",
      data: [
        {
          key: "UNAI",
          id: 5,
        },
        {
          key: "UTASI",
          id: 7,
        },
        {
          key: "TAMC",
          id: 13,
        },
      ],
    },
  },
  {
    key: "bar_1",
    type: "Bar",
    label: "Clients",
    content: 100,
    icon: "ChartColumnBig",
    color: "#233345",
    module: "clients",
    filter: [
      {
        key: "ownership",
        value: ["all clients"],
      },
      {
        key: "status",
        value: ["active", "pool", "hot", "on/off", "for elections"],
      },
    ],
    layouts: {
      lg: [
        {
          w: 6,
          h: 7,
          x: 6,
          y: 3,
          i: "bar_1",
          moved: false,
          static: false,
        },
      ],
      md: [
        {
          w: 3,
          h: 6,
          x: 6,
          y: 9,
          i: "bar_1",
          moved: false,
          static: false,
        },
      ],
      sm: [
        {
          w: 2,
          h: 6,
          x: 0,
          y: 15,
          i: "bar_1",
          moved: false,
          static: false,
        },
      ],
      xs: [
        {
          i: "bar_1",
          x: 1.5,
          y: 27,
          w: 1.5,
          h: 6,
        },
      ],
      xxs: [
        {
          i: "bar_1",
          x: 0,
          y: 73,
          w: 1,
          h: 8,
        },
      ],
    },
    chartOptions: {
      field: "sales_unit",
      chartConfig: {
        "SU 1": {
          label: "SU 1",
          color: "var(--chart-1)",
        },
        "SU 2": {
          label: "SU 2",
          color: "var(--chart-2)",
        },
        "SU 3": {
          label: "SU 3",
          color: "var(--chart-3)",
        },
        "SU 4": {
          label: "SU 4",
          color: "var(--chart-4)",
        },
        "SU 5": {
          label: "SU 5",
          color: "var(--chart-5)",
        },
        "SU 6": {
          label: "SU 6",
          color: "var(--chart-6)",
        },
        "SU 7": {
          label: "SU 7",
          color: "var(--chart-7)",
        },
        DRF: {
          label: "DRF",
          color: "var(--chart-8)",
        },
        MGM: {
          label: "MGM",
          color: "var(--chart-9)",
        },
        Sales: {
          label: "Sales",
          color: "var(--chart-10)",
        },
        "UTASI Sales": {
          label: "UTASI Sales",
          color: "var(--chart-11)",
        },
      },
      dataKey: "count",
      nameKey: "label",
      data: [
        {
          key: "SU 1",
          id: 24,
        },
        {
          key: "SU 2",
          id: 25,
        },
        {
          key: "SU 3",
          id: 26,
        },
        {
          key: "SU 4",
          id: 27,
        },
        {
          key: "SU 5",
          id: 28,
        },
        {
          key: "SU 6",
          id: 29,
        },
        {
          key: "SU 7",
          id: 30,
        },
        {
          key: "DRF",
          id: 31,
        },
        {
          key: "MGM",
          id: 32,
        },
        {
          key: "Sales",
          id: 34,
        },
        {
          key: "UTASI Sales",
          id: 35,
        },
      ],
    },
  },
  {
    key: "metrics_2",
    type: "Metrics",
    label: "Current Week Reports",
    content: 100,
    icon: "Hash",
    color: "#233345",
    module: "reports",
    filter: [
      {
        key: "options",
        value: ["current week"],
      },
    ],
    layouts: {
      lg: [
        {
          w: 4,
          h: 3,
          x: 8,
          y: 0,
          i: "metrics_2",
          moved: false,
          static: false,
        },
      ],
      md: [
        {
          w: 3,
          h: 3,
          x: 0,
          y: 15,
          i: "metrics_2",
          moved: false,
          static: false,
        },
      ],
      sm: [
        {
          w: 2,
          h: 3,
          x: 2,
          y: 15,
          i: "metrics_2",
          moved: false,
          static: false,
        },
      ],
      xs: [
        {
          i: "metrics_2",
          x: 0,
          y: 33,
          w: 1,
          h: 3,
        },
      ],
      xxs: [
        {
          i: "metrics_2",
          x: 0,
          y: 81,
          w: 1,
          h: 4,
        },
      ],
    },
  },
  {
    key: "metrics_3",
    type: "Metrics",
    label: "Sites",
    content: 100,
    icon: "Hash",
    color: "#233345",
    module: "sites",
    filter: [
      {
        key: "options",
        value: ["all sites"],
      },
    ],
    layouts: {
      lg: [
        {
          w: 4,
          h: 3,
          x: 4,
          y: 0,
          i: "metrics_3",
          moved: false,
          static: false,
        },
      ],
      md: [
        {
          w: 3,
          h: 3,
          x: 3,
          y: 12,
          i: "metrics_3",
          moved: false,
          static: false,
        },
      ],
      sm: [
        {
          w: 2,
          h: 3,
          x: 4,
          y: 12,
          i: "metrics_3",
          moved: false,
          static: false,
        },
      ],
      xs: [
        {
          i: "metrics_3",
          x: 1,
          y: 33,
          w: 1,
          h: 3,
        },
      ],
      xxs: [
        {
          i: "metrics_3",
          x: 0,
          y: 85,
          w: 1,
          h: 4,
        },
      ],
    },
  },
  {
    key: "metrics_4",
    type: "Metrics",
    label: "Clients",
    content: 100,
    icon: "Hash",
    color: "#233345",
    module: "clients",
    filter: [
      {
        key: "ownership",
        value: ["all clients"],
      },
      {
        key: "status",
        value: ["active", "pool", "hot", "on/off", "for elections"],
      },
    ],
    layouts: {
      lg: [
        {
          w: 4,
          h: 3,
          x: 0,
          y: 0,
          i: "metrics_4",
          moved: false,
          static: false,
        },
      ],
      md: [
        {
          w: 3,
          h: 3,
          x: 6,
          y: 15,
          i: "metrics_4",
          moved: false,
          static: false,
        },
      ],
      sm: [
        {
          w: 2,
          h: 3,
          x: 0,
          y: 21,
          i: "metrics_4",
          moved: false,
          static: false,
        },
      ],
      xs: [
        {
          i: "metrics_4",
          x: 2,
          y: 33,
          w: 1,
          h: 3,
        },
      ],
      xxs: [
        {
          i: "metrics_4",
          x: 0,
          y: 89,
          w: 1,
          h: 4,
        },
      ],
    },
  },
];

import {
  BookUser,
  Building,
  CircleHelp,
  FileChartColumnIncreasing,
  FilePenLine,
  History,
  LayoutDashboard,
  LucideProps,
  Monitor,
  Package2,
  Settings,
  Tags,
  UserRoundCog,
  UsersRound,
  Gpu,
  Hash,
  ChartPie,
  ChartArea,
  ChartColumnBig,
  List,
  CircleCheck,
  CircleSlash2,
  Flame,
  GitCompare,
  Landmark,
} from "lucide-react";

export const icons: {
  Icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  label: string;
  value: string;
}[] = [
  {
    Icon: BookUser,
    label: "Client",
    value: "BookUser",
  },
  {
    Icon: Building,
    label: "Bulding",
    value: "Building",
  },
  {
    Icon: CircleHelp,
    label: "Help",
    value: "CircleHelp",
  },
  {
    Icon: FileChartColumnIncreasing,
    label: "Reports",
    value: "FileChartColumnIncreasing",
  },
  {
    Icon: FilePenLine,
    label: "Edit File",
    value: "FilePenLine",
  },
  {
    Icon: History,
    label: "History",
    value: "History",
  },
  {
    Icon: LayoutDashboard,
    label: "Dashboard",
    value: "LayoutDashboard",
  },
  {
    Icon: Monitor,
    label: "Monitor",
    value: "Monitor",
  },
  {
    Icon: Package2,
    label: "Package",
    value: "Package2",
  },
  {
    Icon: Settings,
    label: "Settings",
    value: "Settings",
  },
  {
    Icon: Tags,
    label: "Tags",
    value: "Tags",
  },
  {
    Icon: UserRoundCog,
    label: "User Settings",
    value: "UserRoundCog",
  },
  {
    Icon: UsersRound,
    label: "Users",
    value: "UsersRound",
  },
  {
    Icon: Gpu,
    label: "GPU",
    value: "Gpu",
  },
  {
    Icon: Hash,
    label: "Metrics",
    value: "Hash",
  },
  {
    Icon: ChartPie,
    label: "Pie Chart",
    value: "ChartPie",
  },
  {
    Icon: ChartArea,
    label: "Area Chart",
    value: "ChartArea",
  },
  {
    Icon: ChartColumnBig,
    label: "Bar Chart",
    value: "ChartColumnBig",
  },
  {
    Icon: List,
    label: "List",
    value: "List",
  },
  // ✅ unused ones now added
  {
    Icon: CircleCheck,
    label: "Check",
    value: "CircleCheck",
  },
  {
    Icon: CircleSlash2,
    label: "Blocked",
    value: "CircleSlash2",
  },
  {
    Icon: Flame,
    label: "Trending",
    value: "Flame",
  },
  {
    Icon: GitCompare,
    label: "Compare",
    value: "GitCompare",
  },
  {
    Icon: Landmark,
    label: "Landmark",
    value: "Landmark",
  },
];

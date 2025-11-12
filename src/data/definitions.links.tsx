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
  Settings as SettingsIcon,
  Tags,
  UserRoundCog,
  UsersRound,
  Gpu,
} from "lucide-react";
import { lazy } from "react";

const Dashboard = lazy(() => import("@/views/Dashboard"));
const Sites = lazy(() => import("@/views/Sites"));
const Clients = lazy(() => import("@/views/Clients"));
const Deck = lazy(() => import("@/views/Deck"));
const Booking = lazy(() => import("@/views/Booking"));
const Contracts = lazy(() => import("@/views/Contracts"));
const Reports = lazy(() => import("@/views/Reports"));
const Companies = lazy(() => import("@/views/Companies"));
const Mediums = lazy(() => import("@/views/Mediums"));
const Users = lazy(() => import("@/views/Users"));
const Roles = lazy(() => import("@/views/Roles"));
const Logs = lazy(() => import("@/views/Logs"));
const Help = lazy(() => import("@/views/Help"));
const Settings = lazy(() => import("@/views/Settings"));

export interface LinkDefinitions {
  title: string;
  handler: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  hasSeparator?: boolean;
  element: React.LazyExoticComponent<() => JSX.Element> | null;
}

export const linkDefinitions: LinkDefinitions[] = [
  {
    title: "dashboard",
    handler: "",
    icon: LayoutDashboard,
    hasSeparator: true,
    element: Dashboard,
  },
  {
    title: "sites",
    handler: "/sites",
    icon: Monitor,
    element: Sites,
  },
  {
    title: "clients",
    handler: "/clients",
    icon: BookUser,
    element: Clients,
  },
  {
    title: "deck",
    handler: "/deck",
    icon: Gpu,
    element: Deck,
  },
  {
    title: "booking",
    handler: "/booking",
    icon: Tags,
    element: Booking,
  },
  {
    title: "contracts",
    handler: "/contracts",
    icon: FilePenLine,
    element: Contracts,
  },
  {
    title: "reports",
    handler: "/reports",
    icon: FileChartColumnIncreasing,
    element: Reports,
  },
  {
    title: "companies",
    handler: "/companies",
    icon: Building,
    element: Companies,
  },
  {
    title: "mediums",
    handler: "/mediums",
    icon: Package2,
    hasSeparator: true,
    element: Mediums,
  },
  { title: "users", handler: "/users", icon: UsersRound, element: Users },
  { title: "roles", handler: "/roles", icon: UserRoundCog, element: Roles },
  { title: "logs", handler: "/logs", icon: History, element: Logs },
  { title: "help", handler: "/help", icon: CircleHelp, element: Help },
  {
    title: "settings",
    handler: "/settings",
    icon: SettingsIcon,
    element: Settings,
  },
];

import {
  BookUser,
  Building,
  CircleHelp,
  FileChartColumnIncreasing,
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
  NotepadText,
} from "lucide-react";
import { lazy } from "react";

const Dashboard = lazy(() => import("@/views/Dashboard"));
const Sites = lazy(() => import("@/views/Sites"));
const Clients = lazy(() => import("@/views/Clients"));
const Deck = lazy(() => import("@/views/Deck"));
const Booking = lazy(() => import("@/views/Booking"));
const Reports = lazy(() => import("@/views/Reports"));
const Meetings = lazy(() => import("@/views/Meetings"));
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
  group: string;
  element: React.LazyExoticComponent<() => JSX.Element> | null;
}

export const linkDefinitions: LinkDefinitions[] = [
  { title: "dashboard", handler: "", icon: LayoutDashboard, group: "general", element: Dashboard, },
  { title: "sites", handler: "/sites", icon: Monitor, group: 'general', element: Sites, },
  { title: "clients", handler: "/clients", icon: BookUser, group: 'general', element: Clients, },
  { title: "deck", handler: "/deck", icon: Gpu, group: 'general', element: Deck, },
  { title: "booking", handler: "/booking", icon: Tags, group: 'general', element: Booking, },
  { title: "reports", handler: "/reports", icon: FileChartColumnIncreasing, group: 'general', element: Reports, },
  { title: "meetings", handler: "/meetings", icon: NotepadText, group: 'general', element: Meetings, },
  { title: "companies", handler: "/companies", icon: Building, group: 'manage', element: Companies, },
  { title: "mediums", handler: "/mediums", icon: Package2, group: 'manage', element: Mediums, },
  { title: "users", handler: "/users", icon: UsersRound, group: 'manage', element: Users },
  { title: "roles", handler: "/roles", icon: UserRoundCog, group: 'manage', element: Roles },
  { title: "logs", handler: "/logs", icon: History, group: 'manage', element: Logs },
  { title: "help", handler: "/help", icon: CircleHelp, group: 'general', element: Help },
  { title: "settings", handler: "/settings", icon: SettingsIcon, group: 'general', element: Settings, },
];

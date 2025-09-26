import { generateWeeks } from "@/data/reports.columns";
import { useEffect, useMemo, useState } from "react";
import { Separator } from "../ui/separator";
import { getISOWeek } from "date-fns";
import { useSettings } from "@/providers/settings.provider";
import { Button } from "../ui/button";
import { useClientMisc } from "@/hooks/useClientOptions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { capitalize } from "@/lib/utils";
import { ClientOptions } from "@/interfaces/client.interface";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ReportWeekDialog from "./reportWeekDialog";
import MiscTable from "./miscTable";
import UserOverride from "./userOverride";
import { useAuth } from "@/providers/auth.provider";
import CompanyAccess from "./companyAccesses";

function General() {
  return (
    <section className="space-y-4 pb-4">
      <h1 className="font-bold text-lg bg-white">General Settings</h1>
      <div className="space-y-8">
        <MiscManagement />
        <ReportWeekAccess />
        <CompanyClientAccess />
      </div>
    </section>
  );
}

function MiscManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("industry");
  const { data } = useClientMisc();
  const optionGroups = useMemo(() => {
    if (!data) return undefined;

    return data
      .filter((option) => option.category !== "ALL")
      .reduce((groups, option) => {
        if (!groups[option.category]) {
          groups[option.category] = [];
        }
        groups[option.category].push(option);
        return groups;
      }, {} as Record<string, ClientOptions[]>);
  }, [data]);

  useEffect(() => {
    if (!user) return;
  }, [user]);
  return (
    <div id="misc-management" className="flex flex-col gap-4">
      <div className="space-y-2">
        <h2 className="font-semibold border-l-4 border-main-500 px-2">
          Client Misc Management
        </h2>
        <Separator />
        <p className="text-sm">
          Add or remove options like client status, industry, and other details
          used in client information.
        </p>
      </div>
      {optionGroups && (
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="w-full bg-slate-100 rounded-md p-2"
        >
          <TabsList className="p-1 ">
            {Object.keys(optionGroups).map((category) => (
              <TabsTrigger key={category} value={category}>
                {capitalize(category)}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.keys(optionGroups).map((category) => (
            <TabsContent value={category}>
              <MiscTable options={optionGroups[category]} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function ReportWeekAccess() {
  const { weekAccess } = useSettings();
  const currentWeekIndex = getISOWeek(new Date()) - 1;
  const [dropdownVisibility, setDropdownVisibility] = useState(false);
  const weeks = generateWeeks();

  const weekLock = useMemo(() => {
    return weeks.map((week) => {
      const hasAccess =
        weeks[currentWeekIndex] === week
          ? true
          : weekAccess.find((access) => access.week === week)
            ? true
            : false;
      return {
        ID: weekAccess.find((wk) => wk.week === week)?.ID,
        week: week,
        access: hasAccess,
      };
    });
  }, [currentWeekIndex, weekAccess, weeks]);
  return (
    <div id="report-week-access" className="flex flex-col gap-4 items-start">
      <div className="space-y-2">
        <h2 className="font-semibold border-l-4 border-main-500 px-2">
          Reports Access Configuration
        </h2>
        <Separator />
        <p className="text-sm">
          Override user accesses for reports and manage edit access for report
          weeks by locking or unlocking specific time periods.
        </p>
      </div>
      <div className="grid grid-cols-2 w-full gap-8 bg-slate-100 p-4 rounded-md">
        <UserOverride />
        <section className="flex flex-col items-start gap-4">
          <h2 className="text-sm">Configure Week Accesses: </h2>
          <DropdownMenu
            open={dropdownVisibility}
            onOpenChange={(open) => {
              if (open) {
                setDropdownVisibility(true);
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Unlock/Lock Weeks</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              onPointerDownOutside={() => {
                setDropdownVisibility(false);
              }}
              align="end"
              className="max-h-[500px] overflow-y-auto scrollbar-thin"
            >
              {weekLock.map((access) => (
                <ReportWeekDialog access={access} />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </section>
      </div>
    </div>
  );
}

function CompanyClientAccess() {
  return <div id="report-week-access" className="flex flex-col gap-4 items-start">
    <div className="space-y-2">
      <h2 className="font-semibold border-l-4 border-main-500 px-2">
        Company Client Accesses
      </h2>
      <Separator />
      <p className="text-sm">
        Set the viewing access of each company clients.
      </p>
    </div>
    <div className="grid grid-cols-2 w-full gap-8 bg-slate-100 p-4 rounded-md">
      <CompanyAccess />
    </div>
  </div>
}

export default General;

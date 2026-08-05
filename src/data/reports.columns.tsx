import { ReportTable } from "@/interfaces/reports.interface";
import { generateWeeks } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
  format,
} from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar";

import { useUserReportViewAccesses } from "@/hooks/useSettings";
import { useAuth } from "@/providers/auth.provider";
import Status from "@/components/status";
import ClientReport from "@/components/reports/client.report";
import ReportCell from "@/components/reports/cell.report";
import { ComponentIcon, LoaderIcon, Users } from "lucide-react";

const renderAE = () => {
  return {
    id: "account_executives",
    accessorFn: (row) => row.account_executives.map(ae => ae.ae),
    accessorKey: "account_executives",
    header: "AE",
    cell: ({ row }) => {
      const client = row.original;
      const aes = client.account_executives.map(ae => ae);
      return <div className="flex items-center justify-center">
        <AvatarGroup>
          {aes.map(ae => {
            return <Tooltip key={`${client.ID}_${ae.account_id}`}>
              <TooltipTrigger>
                <Avatar className="size-8">
                  <AvatarImage>{ae.image}</AvatarImage>
                  <AvatarFallback className="text-[0.65rem] font-semibold uppercase">{ae.code}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent className="uppercase">{ae.ae}</TooltipContent>
            </Tooltip>
          })}
        </AvatarGroup>
      </div>
    },
    size: 60,
    enableGlobalFilter: false,
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue<string>(columnId);

      switch (filterValue.condition) {
        case "is":
          return cellValue.includes(filterValue.value);
        case "is not":
          return !cellValue.includes(filterValue.value);
        case "contains":
          return filterValue.value.some((val: string) => cellValue.includes(val));
        default:
          return true;
      }
    },
    meta: {
      filterType: "dropdown",
      allowedOptions: ["is", "is not", "contains"],
      icon: Users,
      isSticky: true,
      isArray: true
    }
  } as ColumnDef<ReportTable>
}
const renderSU = () => {
  return {
    id: "sales_unit",
    accessorFn: (row) => row.account_executives.map(ae => ae.su),
    accessorKey: "sales_unit",
    header: "SU",
    cell: ({ row }) => {
      const client = row.original;
      const salesUnits = [...new Set(client.account_executives.map(ae => ae.su))];

      return <div className="text-[0.65rem] leading-tight">
        {salesUnits.map(unit => {
          return <p key={unit}>{unit}</p>
        })}
      </div>
    },
    size: 45,
    enableGlobalFilter: false,
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue<string>(columnId);

      switch (filterValue.condition) {
        case "is":
          return cellValue.includes(filterValue.value);
        case "is not":
          return !cellValue.includes(filterValue.value);
        case "contains":
          return filterValue.value.some((val: string) => cellValue.includes(val));
        default:
          return true;
      }
    },
    meta: {
      filterType: "dropdown",
      allowedOptions: ["is", "is not", "contains"],
      icon: ComponentIcon,
      isSticky: true,
      isArray: true
    }
  } as ColumnDef<ReportTable>
}

export const useWeekColumns = () => {
  const { user: currentUser } = useAuth();
  const { data: access } = useUserReportViewAccesses(currentUser?.ID as number);
  const weekColumns: ColumnDef<ReportTable>[] = [
    {
      id: "client",
      accessorFn: (item) => `${item.client} | ${item.brand}`,
      accessorKey: "client",
      cell: ({ row }) => {
        return <ClientReport data={row.original} />
      },
      size: 100,
      enableColumnFilter: false,
      meta: {
        isSticky: true,
      }
    },
    {
      id: "status",
      accessorFn: (row) => row.status,
      accessorKey: "status",
      cell: ({ row }) => {
        const status: string = row.getValue("status");
        return (
          <Status status={status} className="rounded-full text-[0.6rem] h-5 px-1.5 w-fit" />
        );
      },
      size: 45,
      enableGlobalFilter: false,
      filterFn: (row, columnId, filterValue) => {
        const cellValue = row.getValue<string>(columnId);

        switch (filterValue.condition) {
          case "is":
            return cellValue === filterValue.value;
          case "is not":
            return cellValue !== filterValue.value;
          case "contains":
            return filterValue.value.includes(cellValue);
          default:
            return true;
        }
      },
      meta: {
        filterType: "dropdown",
        allowedOptions: ["is", "is not", "contains"],
        icon: LoaderIcon,
        isSticky: true,
      }
    },
  ];

  if (currentUser) {
    const { role_id } = currentUser.role;
    if ([1, 3].includes(role_id) || access?.report_access === "all") {
      weekColumns.push(
        renderSU(),
        renderAE()
      );
    } else if (role_id === 4 || access?.report_access === "team") {
      weekColumns.push(renderAE());
    }
  }

  weekColumns.push(
    ...generateWeeks().map((week) => {
      const header = `Wk${week.isoWeek} • (${format(week.start, "MMM dd")} - ${format(week.end, "MMM dd")})`;
      return {
        // id: header,
        accessorFn: (row) => {
          if (row[week.yearweek].length === 0) {
            return "Empty"
          }
          return "Not Empty"
        },
        accessorKey: String(week.yearweek),
        header: header,
        cell: ReportCell,
        size: 300,
        enableGlobalFilter: false,
        filterFn: (row, columnId, filterValue) => {
          const cellValue = row.getValue<string>(columnId);

          return filterValue.value === cellValue;
        },
        meta: {
          filterType: "dropdown",
          allowedOptions: ["is"],
          label: header
        }
      } as ColumnDef<ReportTable>
    })
  );

  return weekColumns;
};

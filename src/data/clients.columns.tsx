import ClientAccounts from "@/components/clients/accounts.clients";
import DeleteClient from "@/components/clients/delete.client";
import StatusSelect from "@/components/status-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipContentWithArrow } from "@/components/ui/tooltip-arrow";
import { useAccess } from "@/hooks/useClients";
import { useCompanies } from "@/hooks/useCompanies";
import { ClientTable } from "@/interfaces/client.interface";
import { cn, colors } from "@/lib/utils";
import { useAuth } from "@/providers/auth.provider";
import { CellContext, ColumnDef, Row } from "@tanstack/react-table";
import { AwardIcon, BriefcaseBusinessIcon, Building2Icon, CalendarDaysIcon, ComponentIcon, FactoryIcon, LoaderIcon, MoreHorizontal, ShoppingBasketIcon, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TagsMapping } from "./clients.keymap";
import ClientName from "@/pages/clients/name.client";

const ActionCell = ({ row }: { row: Row<ClientTable> }) => {
  const { user } = useAuth();
  const client: ClientTable = row.original;
  const { access: editAll } = useAccess("clients.editAll");
  const { access: editCompany } = useAccess("clients.editCompany");
  const { access: editAccountHandling } = useAccess("clients.editAccountHandling");
  const { access: editStatus } = useAccess("clients.editStatus");
  const { access: editContact } = useAccess("clients.editContact");
  const { access: remove } = useAccess("clients.delete");
  const [show, setShow] = useState(false);

  const clientAccess = useMemo(() => {
    if (!user) return { edit: false, delete: false };

    const salesUnit = user.sales_unit;
    if (!salesUnit) {
      return {
        edit: user.role.role_id in [1, 3, 10, 11, 15],
        delete: user.role.role_id in [1, 3, 10, 11, 15]
      };
    }
    const canEditAtleastOne = editAll || editCompany || editAccountHandling || editContact || editStatus;
    return {
      edit: salesUnit.sales_unit_id === client.sales_unit_id && canEditAtleastOne,
      delete: salesUnit.sales_unit_id === client.sales_unit_id && remove,
    }
  }, [user, editAll, editCompany, editAccountHandling, editContact, editStatus, client.sales_unit_id, remove]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="sr-only">Open Menu</span>
          <MoreHorizontal size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownLink
          link={`./${(client.name as string).replace(/ /g, "_").replace(/\//g, "-")}`}
          label="view"
          client={client}
          access
        />

        <DropdownLink
          link={`./${(client.name as string).replace(/ /g, "_").replace(/\//g, "-")}/edit`}
          label="edit"
          access={clientAccess.edit}
          client={client}
        />
        <Tooltip>
          <DropdownMenuItem
            className={cn(
              "text-red-300 focus:text-red-500 focus:bg-red-50",
              !clientAccess.delete
                ? "opacity-50 focus:bg-transparent cursor-not-allowed"
                : ""
            )}
            onClick={(e) => e.preventDefault()}
          >
            <Dialog open={show} onOpenChange={setShow}>
              <TooltipTrigger asChild>
                <DialogTrigger
                  className="w-full text-left disabled:cursor-not-allowed"
                  disabled={!clientAccess.delete}
                >
                  Delete
                </DialogTrigger>
              </TooltipTrigger>
              <DeleteClient client={client} onOpenChange={setShow} />
            </Dialog>
          </DropdownMenuItem>
          {!clientAccess.delete && (
            <TooltipContentWithArrow>
              Action not allowed.
            </TooltipContentWithArrow>
          )}
        </Tooltip>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CompanyCell = ({ row }: CellContext<ClientTable, unknown>) => {
  const { data, isLoading } = useCompanies();
  const id = row.original.company_id;

  if (isLoading) return <>loading...</>
  if (!data) return <span className="text-red-400">error</span>

  const company = data.find(item => item.ID === id);

  if (!company) return <span className="text-red-400">error</span>

  return <p className="text-xs">{`${company.code}`}</p>
}

export const columns: ColumnDef<ClientTable>[] = [
  {
    accessorKey: "row",
    header: "#",
    cell: ({ table, row }) => {
      const rows = table.getExpandedRowModel().rows;
      const rowIndex = rows.findIndex((r) => r.id === row.id);
      return <p className="text-center">{rowIndex + 1}</p>;
    },
    enableColumnFilter: false,
    enableGlobalFilter: false,
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ClientName,
    meta: {
      icon: BriefcaseBusinessIcon
    },
    enableColumnFilter: false,
    enableGlobalFilter: true,
  },
  {
    id: "brand",
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => {
      const brand: string = row.getValue("brand");

      return <p title={brand} className="w-full text-xs max-w-[150px] truncate">
        {brand || "---"}
      </p>
    },
    meta: {
      icon: ShoppingBasketIcon
    },
    enableColumnFilter: false
  },
  {
    id: "company",
    accessorKey: "company",
    header: "Company",
    cell: CompanyCell,
    enableGlobalFilter: false,
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue<Date>(columnId);

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
      icon: Building2Icon
    }
  },
  {
    id: "tags",
    accessorFn: (row) => row.tags ? TagsMapping[row.tags as keyof typeof TagsMapping].label : null,
    accessorKey: "tags",
    header: undefined,
    cell: undefined,
    enableGlobalFilter: false,
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue<Date>(columnId);

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
      icon: AwardIcon,
      allowedOptions: ["is", "is not", "contains"],
    }
  },
  {
    id: "Last Active",
    accessorFn: (row) => row.last_submitted_on,
    accessorKey: "tags",
    header: undefined,
    cell: undefined,
    enableGlobalFilter: false,
    filterFn: (row, _, filterValue) => {
      const cellValue = Number(row.original.last_submitted_on || 0);
      const value = filterValue.value;

      switch (filterValue.condition) {
        case "is":
          return cellValue === Number(value);
        case "between": {
          const from = Number(value.from);
          const to = Number(value.to);

          if (from !== 0 && to === 0) {
            // from -> Infinity
            return cellValue >= from;
          }

          if (from === 0 && to !== 0) {
            // 0 -> to
            return cellValue <= to;
          }

          return cellValue >= from && cellValue <= to;
        }
        default:
          return true;
      }
    },
    meta: {
      filterType: "number_range",
      allowedOptions: ["is", "between"],
      filterLabel: "days",
      icon: CalendarDaysIcon
    }
  },
  {
    id: "sales_unit",
    accessorKey: "sales_unit",
    header: undefined,
    cell: undefined,
    enableGlobalFilter: false,
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue<Date>(columnId);

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
      icon: ComponentIcon
    }
  },
  {
    id: "account_executive",
    accessorFn: (row) => row.account_executives.map(ae => ae.account_executive),
    accessorKey: "account_executive",
    header: "AE",
    cell: ClientAccounts,
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
      isArray: true
    }
  },
  {
    id: "industry",
    accessorKey: "industry_name",
    header: "Industry",
    cell: ({ row }) => {
      const { industry, industry_name } = row.original;
      let color = "#233345";
      if (industry !== 0) {
        color = colors[industry as number - 1];
      }
      return (
        <div className="min-w-[150px]">
          {industry ? (
            <Badge
              variant="outline"
              className="text-white whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {industry_name as string}
            </Badge>
          ) : (
            "---"
          )}
        </div>
      );
    },
    enableGlobalFilter: false,
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue<Date>(columnId);

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
      icon: FactoryIcon,
    }
  },
  {
    id: "status",
    accessorKey: "status_name",
    header: "Status",
    cell: ({ row }) => {
      return <StatusSelect data={row.original} />;
    },
    enableGlobalFilter: false,
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue<Date>(columnId);

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
      icon: LoaderIcon
    }
  },
  {
    id: "actions",
    accessorKey: "action",
    header: "Action",
    cell: ActionCell,
    enableColumnFilter: false,
    enableGlobalFilter: false
  },
];


const DropdownLink = ({
  client,
  label,
  link,
  access,
}: {
  client: ClientTable;
  label: string;
  link: string;
  access: boolean;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuItem asChild>
          <Link
            to={access ? link : ""}
            onClick={() =>
              access && localStorage.setItem("client", String(client.client_id))
            }
            className={cn(
              "capitalize",
              !access && "opacity-50 cursor-not-allowed"
            )}
            tabIndex={access ? 0 : -1}
            aria-disabled={!access}
          >
            {label}
          </Link>
        </DropdownMenuItem>
      </TooltipTrigger>
      {!access && (
        <TooltipContentWithArrow>Action not allowed.</TooltipContentWithArrow>
      )}
    </Tooltip>
  );
};

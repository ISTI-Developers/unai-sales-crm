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
import { ClientMedium, ClientTable } from "@/interfaces/client.interface";
import { cn, colors } from "@/lib/utils";
import { useAuth } from "@/providers/auth.provider";
import { CellContext, ColumnDef, Row } from "@tanstack/react-table";
import { ListChevronsDownUp, ListChevronsUpDown, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
    header: () => {
      return <p className="pl-4">#</p>;
    },
    cell: ({ table, row }) => {
      const rows = table.getRowModel().rows;
      const rowIndex = rows.findIndex((r) => r.id === row.id);
      return <p className="text-center">{rowIndex + 1}</p>;
    },
  },
  {
    id: "name",
    accessorKey: "name",
    header: () => {
      return <p className="pl-4">Name</p>;
    },
    cell: ({ row }) => {
      const name: string = row.getValue("name");
      const last_submitted_on = row.original.last_submitted_on;

      return (
        <div className={cn("w-full max-w-[300px] pl-4 flex gap-4 items-center ")} style={{ paddingLeft: `${row.depth * 5}rem` }}>
          {row.getCanExpand() && (
            <Button variant="ghost" size="icon" onClick={row.getToggleExpandedHandler()}>
              {row.getIsExpanded() ? <ListChevronsDownUp /> : <ListChevronsUpDown />}
            </Button>
          )}
          <div className="grid">
            <div className={cn("text-sm uppercase", "flex items-center gap-1")}>
              <span className="font-semibold">{name}</span>
              {row.original.children &&
                <p className="text-[0.65rem] bg-emerald-400 w-4 h-4 flex items-center justify-center rounded text-white font-semibold">{row.original.children.length}</p>
              }
            </div>
            <p className="text-[0.65rem] leading-tight italic text-neutral-400">
              {last_submitted_on && last_submitted_on > 0 ?
                `${last_submitted_on} days since last activity` :
                `No activities found`
              }
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "industry_name",
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
    filterFn: (row, columnId, filterValue) => {
      const item: string = row.getValue(columnId);
      return filterValue.includes(item);
    },
  },
  {
    id: "brand",
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => {
      const brand: string = row.getValue("brand");

      return brand ? (
        <p className="w-full whitespace-nowrap lg:whitespace-break-spaces text-xs lg:max-w-[150px]">
          {brand.slice(0, 20)}
        </p>
      ) : (
        "---"
      );
    },
  },
  {
    id: "company",
    accessorKey: "company",
    header: "Company",
    cell: CompanyCell,
    filterFn: (row, columnId, filterValue) => {
      const item: string = row.getValue(columnId);
      return filterValue.includes(item);
    },
  },
  {
    id: "sales_unit",
    accessorKey: "sales_unit",
    header: "Sales Unit",
    cell: ({ row }) => {
      const su: string = row.getValue("sales_unit");
      return <p className="text-xs">{su}</p>
    },
    filterFn: (row, columnId, filterValue) => {
      const item: string = row.getValue(columnId);
      return filterValue.includes(item);
    },
  },
  {
    id: "account_executive",
    accessorKey: "account_executive",
    header: "Account Executive",
    cell: ClientAccounts,
    filterFn: (row, _, filterValue) => {
      const account_executives = row.original.account_executives;

      return account_executives.some(account => filterValue.some((value: string) => value === account.account_executive));
    },
  },
  {
    id: "mediums",
    accessorKey: "mediums",
    header: "Medium",
    cell: ({ row }) => {
      const mediums: ClientMedium[] = row.getValue("mediums");
      return (
        <div className="flex gap-1 flex-wrap max-w-[250px]">
          {mediums.slice(0, 2).map((medium) => {
            const index = medium.medium_id % colors.length;

            const color = colors[index] ?? "#233345";
            return (
              <Badge
                key={medium.cm_id}
                variant="outline"
                className="text-white whitespace-nowrap"
                style={{ backgroundColor: color }}
              >
                {medium.name}
              </Badge>
            );
          })}
          {mediums.length > 2 && (
            <Tooltip>
              <TooltipTrigger>...</TooltipTrigger>
              <TooltipContentWithArrow>
                {mediums.slice(2).map((medium) => (
                  <p
                    key={
                      medium.client_id +
                      "-" +
                      medium.cm_id +
                      "-" +
                      medium.medium_id
                    }
                  >
                    {medium.name}
                  </p>
                ))}
              </TooltipContentWithArrow>
            </Tooltip>
          )}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const mediums: ClientMedium[] = row.getValue(columnId);
      return mediums.some((medium) => filterValue.includes(medium.name));
    },
  },
  {
    id: "status_name",
    accessorKey: "status_name",
    header: "Status",
    cell: ({ row }) => {
      return <StatusSelect data={row.original} />;
    },
  },
  {
    id: "actions",
    accessorKey: "action",
    header: "Action",
    cell: ActionCell,
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

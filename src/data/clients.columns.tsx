import ClientAccounts from "@/components/clients/accounts.clients";
import DeleteClient from "@/components/clients/delete.client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipContentWithArrow } from "@/components/ui/tooltip-arrow";
import { useToast } from "@/hooks/use-toast";
import { useClientOptionList } from "@/hooks/useClientOptions";
import { useClientAccess, useUpdateClientStatus } from "@/hooks/useClients";
import { ClientMedium, ClientTable } from "@/interfaces/client.interface";
import { cn, colors } from "@/lib/utils";
import { useAuth } from "@/providers/auth.provider";
import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal, PenBox } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const ActionCell = ({ row }: { row: Row<ClientTable> }) => {
  const { user } = useAuth();
  const client: ClientTable = row.original;
  const { access } = useClientAccess(10);
  const [show, setShow] = useState(false);

  const clientAccess = useMemo(() => {
    if (!user) return { edit: false, delete: false };

    const salesUnit = user.sales_unit;
    if (!salesUnit) {
      return {
        edit: user.role.role_id in [1, 3, 10, 11],
        delete: user.role.role_id in [1, 3, 10, 11]
      };
    }

    console.log(access);

    return {
      edit: salesUnit.sales_unit_id === client.sales_unit_id && access.edit,
      delete: salesUnit.sales_unit_id === client.sales_unit_id && access.delete,
    }
  }, [access, user, client]);

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

      return (
        <p className="w-full pl-4 text-xs max-w-[250px] uppercase">
          {name}
        </p>
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
      console.log(row, item, filterValue)
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
      return <StatusSelect row={row} />;
    },
  },
  {
    id: "actions",
    accessorKey: "action",
    header: "Action",
    cell: ActionCell,
  },
];

const StatusSelect = ({ row }: { row: Row<ClientTable> }) => {
  const { mutate: updateClientStatus, isPending } = useUpdateClientStatus();
  const { client_id, name: client, status_name } = row.original;
  const { access } = useClientAccess(10);

  const { toast } = useToast();

  const [isEditable, setEditable] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const name = (status_name as string).toLowerCase();
  const { options } = useClientOptionList("status");

  const statusMap: {
    [key: string]:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | null
    | undefined;
  } = {
    active: "outline",
    hot: "outline",
    pool: "destructive",
    "on/off": "secondary",
    "for elections": "secondary",
  };

  const statusClasses: { [key: string]: string } = {
    active: "bg-green-100 text-green-700 border-green-300",
    hot: "bg-yellow-100 text-yellow-500 border-yellow-400",
    "on/off": "bg-sky-100 text-sky-600 border-sky-400",
    "for elections": "bg-sky-100 text-sky-600 border-sky-400",
  };

  const onSubmit = async () => {
    if (!selectedStatus) return;

    const status = options.find(
      (option) => option.label.toLowerCase() === selectedStatus
    );
    if (status) {
      updateClientStatus(
        { status: status.id, ID: String(client_id) },
        {
          onSuccess: (data) => {
            if (data.acknowledged) {
              toast({
                description: "Status has been updated.",
                variant: "success",
              });
              setEditable(false);
              setSelectedStatus(null);
            }
          },
          onError: (error) =>
            toast({
              description: `${typeof error === "object" && error !== null && "error" in error
                ? (error as { error?: string }).error
                : "Please contact the IT developer."
                }`,
              variant: "destructive",
            }),
        }
      );
    }
  };
  return (
    options && (
      <>
        <Dialog
          onOpenChange={(open) => {
            if (!open) {
              setEditable(false);
              setSelectedStatus(null);
            }
          }}
          open={isEditable}
        >
          <DialogTrigger asChild>
            <Button
              onClick={(e) =>
                access.edit ? setEditable(true) : e.preventDefault()
              }
              variant="ghost"
              size={null}
              tabIndex={-1}
              className={cn(
                "relative group select-none cursor-pointer flex gap-2 justify-start w-fit outline-none focus:outline-none focus-visible:ring-0",
                !access.edit ? "pointer-events-none" : ""
              )}
            >
              <Badge
                variant={statusMap[name]}
                className={cn(statusClasses[name], "uppercase")}
              >
                {status_name as string}
              </Badge>
              {access.edit && (
                <PenBox className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100" />
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Status</DialogTitle>
              <DialogDescription>
                <p>
                  Update the status of{" "}
                  <span className="uppercase font-bold">{client as string}</span> by
                  selecting from the list below.
                </p>
              </DialogDescription>
            </DialogHeader>
            <form className="flex items-center gap-2">
              <Label htmlFor="status" className="whitespace-nowrap">
                New Status
              </Label>
              <Select
                value={selectedStatus ?? name}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                }}
              >
                <SelectTrigger className="max-w-[200px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => {
                    const label = option.label.toLowerCase();
                    return (
                      <SelectItem key={`status_${option.id}`} value={label}>
                        <Badge
                          variant={statusMap[label]}
                          className={cn(statusClasses[label], "uppercase")}
                        >
                          {label}
                        </Badge>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </form>
            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditable(false);
                  setSelectedStatus(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={
                  selectedStatus === null ||
                  selectedStatus === name ||
                  isPending
                }
                onClick={onSubmit}
                className="bg-main-100 hover:bg-main-400 text-white hover:text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  );
};
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

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
import { List } from "@/interfaces";
import {
  Client,
  ClientMedium,
  ClientWithContact,
} from "@/interfaces/client.interface";
import { colors } from "@/lib/utils";
import { useClient } from "@/providers/client.provider";
import { ColumnDef, Row } from "@tanstack/react-table";
import classNames from "classnames";
import { MoreHorizontal, PenBox } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export const columns: ColumnDef<Client>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: () => {
      return <p className="pl-4">Name</p>;
    },
    cell: ({ row }) => {
      const name: string = row.getValue("name");

      return <p className="pl-4 max-w-[200px]">{name}</p>;
    },
  },
  {
    id: "industry_name",
    accessorKey: "industry_name",
    header: "Industry",
    cell: ({ row }) => {
      const { industry, industry_name } = row.original;
      let color = "#233345";
      if (industry) {
        color = colors[industry - 1];
      }
      return industry ? (
        <Badge
          variant="outline"
          className="text-white"
          style={{ backgroundColor: color }}
        >
          {industry_name}
        </Badge>
      ) : (
        "---"
      );
    },
  },
  {
    id: "brand",
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => {
      const brand: string = row.getValue("brand");

      return brand ? <p>{brand}</p> : "---";
    },
  },
  {
    id: "company",
    accessorKey: "company",
    header: "Company",
  },
  {
    id: "sales_unit",
    accessorKey: "sales_unit",
    header: "Sales Unit",
  },
  {
    id: "account_executive",
    accessorKey: "account_executive",
    header: "Account Executive",
  },
  {
    id: "mediums",
    accessorKey: "mediums",
    header: "Medium",
    cell: ({ row }) => {
      const mediums: ClientMedium[] = row.getValue("mediums");

      return mediums.map((medium) => {
        const index = medium.medium_id % colors.length;

        const color = colors[index] ?? "#233345";
        return (
          <Badge
            key={medium.cm_id}
            variant="outline"
            className="text-white"
            style={{ backgroundColor: color }}
          >
            {medium.name}
          </Badge>
        );
      });
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
    cell: ({ row }) => {
      const client: ClientWithContact = row.original;

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
              link={`./${client.name.replace(/ /g, "_")}`}
              label="view"
              client={client}
            />
            <DropdownLink
              link={`./${client.name.replace(/ /g, "_")}/edit`}
              label="edit"
              client={client}
            />
            <DropdownMenuItem asChild>
              <Link
                to="/reports/add"
                onClick={() => {
                  const clientItem: List = {
                    id: String(client.client_id),
                    value: client.name,
                    label: client.name,
                  };
                  localStorage.setItem(
                    "storedClient",
                    JSON.stringify(clientItem)
                  );
                }}
                className="capitalize"
              >
                create report
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
const StatusSelect = ({ row }: { row: Row<Client> }) => {
  const { clientOptions, updateClientStatus } = useClient();
  const { client_id, name: client, status_name } = row.original;

  const [isEditable, setEditable] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const name = status_name.toLowerCase();
  const options: List[] | [] = useMemo(() => {
    if (!clientOptions) return [];
    const category = clientOptions.filter((option) =>
      option.some((opt) => opt.category === "status")
    );

    if (Array.isArray(category)) {
      return category[0]
        .map(({ misc_id, name }) => {
          return {
            id: misc_id,
            label: name,
            value: misc_id,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
    }
  }, [clientOptions]);

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
      const response = await updateClientStatus(status, client_id);
      console.log(response);
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
              onClick={() => setEditable(true)}
              variant="ghost"
              size={null}
              tabIndex={-1}
              className="relative group select-none cursor-pointer flex gap-2 justify-start w-full outline-none focus:outline-none focus-visible:ring-0"
            >
              <Badge
                variant={statusMap[name]}
                className={classNames(statusClasses[name], "uppercase")}
              >
                {status_name}
              </Badge>
              <PenBox className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Status</DialogTitle>
              <DialogDescription>
                <p>
                  Update the status of{" "}
                  <span className="uppercase font-bold">{client}</span> by
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
                          className={classNames(
                            statusClasses[label],
                            "uppercase"
                          )}
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
                disabled={selectedStatus === null || selectedStatus === name}
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
}: {
  client: ClientWithContact;
  label: string;
  link: string;
}) => {
  return (
    <DropdownMenuItem asChild>
      <Link
        to={link}
        onClick={() => localStorage.setItem("client", String(client.client_id))}
        className="capitalize"
      >
        {label}
      </Link>
    </DropdownMenuItem>
  );
};

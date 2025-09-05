import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useManageRole } from "@/hooks/useRoles";
import { ClassList } from "@/interfaces";
import { Role } from "@/interfaces/user.interface";
import { capitalize } from "@/lib/utils";
import DropdownWithDialog from "@/misc/DropdownWithDialog";
import { ColumnDef, Row } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ArrowUpDown, LoaderCircle, MoreHorizontal } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";

interface ActionDialogProps {
  trigger: string;
  header: string;
  description: ReactNode;
  role: Role;
}

const multiValueFilter = <TData extends object>(
  row: Row<TData>,
  columnId: string,
  filterValue: string[]
) => {
  const cellValue = row.getValue(columnId);

  // Check if any of the filter terms are included in the cell value
  return typeof cellValue === "string" && filterValue.includes(cellValue);
};

export const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
          className="flex mx-auto gap-1 items-center hover:bg-transparent uppercase text-xs font-bold"
        >
          Role <ArrowUpDown size={12} />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name: string = row.getValue("name");

      return <p className="uppercase font-semibold text-center">{name}</p>;
    },
  },
  {
    accessorKey: "description",
    header: () => {
      return <p className="text-center">Description</p>;
    },
    cell: ({ row }) => {
      const description: string = row.getValue("description");

      return (
        <p className="text-center w-full max-w-[400px] mx-auto">
          {description || "N/A"}
        </p>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: multiValueFilter,
    cell: ({ row }) => {
      const status: string = row.getValue("status");
      const statusClasses: ClassList = {
        inactive: "bg-red-200 text-red-500 border-red-400",
        "password reset": "bg-yellow-100 text-yellow-500 border-yellow-400",
        new: "bg-sky-100 text-sky-600 border-sky-400",
      };
      const className =
        statusClasses[status] || "bg-green-100 text-green-700 border-green-300";
      return (
        <Badge variant={null} className={cn(className, "capitalize")}>
          {status.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const role = row.original;

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
              link={`./${role.name.replace(/ /g, "_")}`}
              label="view"
              role={role}
            />
            <DropdownLink
              link={`./${role.name.replace(/ /g, "_")}/edit`}
              label="edit"
              role={role}
            />
            {role.status === "active" && role.role_id > 2 ? (
              <>
                <DropdownMenuSeparator />
                <CustomDropdown
                  trigger="disable"
                  header="Disable Role"
                  role={role}
                  description={
                    <>
                      Are you sure you want to disable this role?{" "}
                      <span className="font-bold capitalize">{role.name}</span>{" "}
                      users won't be able to access system until you enable it.
                    </>
                  }
                />
              </>
            ) : (
              <CustomDropdown
                trigger="enable"
                header="Enable Role"
                role={role}
                description={
                  <>
                    Are you sure you want to disable this role? Disabling this
                    role will affect x number of members.
                  </>
                }
              />
            )}
            <CustomDropdown
              trigger="delete"
              header="Delete Role"
              role={role}
              description={<>Are you sure you want to delete this role?</>}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const DropdownLink = ({
  role,
  label,
  link,
}: {
  role: Role;
  label: string;
  link: string;
}) => {
  return (
    <DropdownMenuItem
      asChild
      disabled={Boolean(label === "edit" && role.role_id <= 2)}
    >
      <Link
        to={link}
        onClick={() => localStorage.setItem("role", String(role.role_id))}
        className="capitalize"
      >
        {label}
      </Link>
    </DropdownMenuItem>
  );
};

const CustomDropdown = ({
  trigger,
  header,
  description,
  role,
}: ActionDialogProps) => {
  const [open, onOpen] = useState(false);
  const actionButton = <ManageButton action={trigger} role={role} />;

  return (
    role.role_id > 2 && (
      <DropdownWithDialog
        onOpen={onOpen}
        open={open}
        trigger={trigger}
        header={header}
        description={description}
        proceed={actionButton}
      />
    )
  );
};

const ManageButton = ({ action, role }: { action: string; role: Role }) => {
  const { mutate: manageRole } = useManageRole();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    let statusID = role.status_id;
    setLoading(true);

    if (!statusID) return;

    switch (action) {
      case "disable":
        statusID = 2;
        break;
      case "delete":
        statusID = 5;
        break;
      case "enable":
        statusID = 1;
        break;
    }

    manageRole(
      { role, status: statusID },
      {
        onSuccess: (response) => {
          if (!response) return;

          if (response.acknowledged) {
            toast({
              title: "Success",
              description: `${capitalize(
                role.name
              )} has been ${action}d successfully.`,
              variant: "success",
            });
          }

          if (response.error) {
            toast({
              title: "Error",
              description: `ERROR: ${
                response.error ||
                "An error has occured. Please contact the developer."
              }`,
              variant: "destructive",
            });
            setLoading((prev) => !prev);
          }
        },
      }
    );
  };
  return (
    <Button
      disabled={loading}
      variant={action === "enable" ? "outline" : "destructive"}
      className={cn(
        "flex gap-2 capitalize",
        loading ? "pl-2" : "",
        action === "enable"
          ? "border-none bg-yellow-300 text-white hover:bg-yellow-500"
          : ""
      )}
      onClick={onClick}
    >
      {loading && <LoaderCircle className="animate-spin" />}
      {action} Role
    </Button>
  );
};

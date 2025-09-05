import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RoleEditor from "@/components/users/roleEditor.user";
import { useToast } from "@/hooks/use-toast";
import { usePasswordReset } from "@/hooks/useAuth";
import { useDeleteUser, useUpdateUserStatus } from "@/hooks/useUsers";
import { ClassList } from "@/interfaces";
import { UserTable } from "@/interfaces/user.interface";
import DropdownWithDialog from "@/misc/DropdownWithDialog";
import { ColumnDef, Row } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ArrowUpDown, LoaderCircle, MoreHorizontal } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";

const multiValueFilter = <TData extends object>(
  row: Row<TData>,
  columnId: string,
  filterValue: string[]
) => {
  const cellValue = row.getValue(columnId);

  // Check if any of the filter terms are included in the cell value
  return typeof cellValue === "string" && filterValue.includes(cellValue);
};

export const columns: ColumnDef<UserTable>[] = [
  {
    accessorKey: "user",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            column.toggleSorting(column.getIsSorted() === "asc");
          }}
          className="flex gap-1 items-center hover:bg-transparent uppercase text-xs font-bold"
        >
          User <ArrowUpDown size={12} />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user: string = row.getValue("user");

      return <p className="capitalize">{user}</p>;
    },
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => {
      const company: string | null = row.getValue("company");
      const role: string = row.getValue("role");

      return company ? (
        company
      ) : (
        <Badge
          variant="outline"
          className={cn(
            "select-none pointer-events-none",
            ["superadmin", "sales admin"].includes(role.toLocaleLowerCase())
              ? "text-gray-400 bg-gray-50"
              : "text-yellow-500 bg-yellow-100"
          )}
        >
          {["superadmin", "sales admin"].includes(role.toLocaleLowerCase())
            ? "N/A"
            : "TBD"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sales_unit",
    header: "Sales Unit",
    cell: ({ row }) => {
      const sales_unit: string | null = row.getValue("sales_unit");
      const role: string = row.getValue("role");

      return sales_unit ? (
        sales_unit
      ) : (
        <Badge
          variant="outline"
          className={cn(
            "select-none pointer-events-none",
            ["superadmin", "sales admin"].includes(role.toLocaleLowerCase())
              ? "text-gray-400 bg-gray-50"
              : "text-yellow-500 bg-yellow-100"
          )}
        >
          {["superadmin", "sales admin"].includes(role.toLocaleLowerCase())
            ? "N/A"
            : "TBD"}
        </Badge>
      );
    },
    filterFn: multiValueFilter,
  },
  {
    accessorKey: "role",
    header: "Role",
    filterFn: multiValueFilter,
    cell: ({ row }) => {
      return <RoleEditor row={row} />;
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
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <span className="sr-only">Open Menu</span>
              <MoreHorizontal size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                to={`./${user.user.replace(/ /g, "_")}`}
                onClick={() => localStorage.setItem("userID", String(user.ID))}
              >
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to={`./${user.user.replace(/ /g, "_")}/edit`}
                onClick={() => localStorage.setItem("userID", String(user.ID))}
              >
                Edit
              </Link>
            </DropdownMenuItem>
            <CustomDropdown
              user={user}
              trigger="Reset Password"
              header="Password Reset"
              description="Reset this user's password? Once reset, the user will receive a new temporary password and will be asked to set a new password on their next login."
            />
            {user.status === "inactive" ? (
              <>
                <CustomDropdown
                  trigger="reactivate"
                  header="Reactivate User"
                  user={user}
                  description={
                    <>
                      Are you sure you want to reactivate{" "}
                      <span className="uppercase font-bold">{user.user}</span>?
                    </>
                  }
                />
                <DropdownMenuSeparator />
              </>
            ) : (
              <>
                <DropdownMenuSeparator />
                <CustomDropdown
                  trigger="deactivate"
                  header="Deactivate User"
                  user={user}
                  description={
                    <>
                      Are you sure you want to deactivate{" "}
                      <span className="uppercase font-bold">{user.user}</span>?
                      Deactivating this user will prevent them to enter the
                      website until you reactivate them.
                    </>
                  }
                />
              </>
            )}
            <CustomDropdown
              trigger="delete"
              header="Delete User"
              user={user}
              description={
                <>
                  Are you sure you want to delete{" "}
                  <span className="uppercase font-bold">{user.user}</span>?
                  Deleting users cannot be restored! If you wish to continue,
                  click proceed.
                </>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface ActionDialogProps {
  trigger: string;
  header: string;
  description: ReactNode;
  user: UserTable;
}

const CustomDropdown = ({
  trigger,
  header,
  description,
  user,
}: ActionDialogProps) => {
  const [open, onOpen] = useState(false);
  let proceedContent = <ResetPassword user={user} toggleDialog={onOpen} />;
  if (trigger === "deactivate") {
    proceedContent = (
      <ContinueButton user={user} status="Deactivate" toggleDialog={onOpen} />
    );
  } else if (trigger === "delete") {
    proceedContent = (
      <ContinueButton user={user} status="Delete" toggleDialog={onOpen} />
    );
  } else if (trigger === "reactivate") {
    proceedContent = (
      <ContinueButton user={user} status="Reactivate" toggleDialog={onOpen} />
    );
  }

  return (
    <DropdownWithDialog
      onOpen={onOpen}
      open={open}
      trigger={trigger}
      header={header}
      description={description}
      proceed={proceedContent}
    />
  );
};

const ResetPassword = ({
  user,
  toggleDialog,
}: {
  user: UserTable;
  toggleDialog: (state: boolean) => void;
}) => {
  const { mutate: resetPassword } = usePasswordReset(user.ID);
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(false);

  const onClick = async () => {
    setLoading((prev) => !prev);

    resetPassword(user, {
      onSuccess: () => {
        toast({
          title: "Password Reset Success",
          description:
            "The temporary password has been sent to the registered email of the user.",
          variant: "success",
        });
        setLoading((prev) => !prev);
        toggleDialog(false);
      },
    });
  };
  return (
    <Button
      variant="destructive"
      disabled={loading}
      onClick={onClick}
      className={cn("flex gap-2", loading ? "pl-2" : "")}
    >
      {loading && <LoaderCircle className="animate-spin" />}
      Reset Password
    </Button>
  );
};

const ContinueButton = ({
  user,
  status,
  toggleDialog,
}: {
  user: UserTable;
  status: string;
  toggleDialog: (state: boolean) => void;
}) => {
  const { mutate: updateUserStatus } = useUpdateUserStatus();
  const { mutate: deleteUser } = useDeleteUser();
  const { toast } = useToast();

  const [loading, setLoading] = useState<boolean>(false);
  const statuses = {
    Reactivate: 1,
    Deactivate: 2,
  };

  const onClick = async () => {
    setLoading((prev) => !prev);

    if (status !== "Delete") {
      updateUserStatus(
        {
          user,
          status: statuses[status as keyof typeof statuses],
        },
        {
          onSuccess: (response) => {
            if (!response) {
              throw new Error("An error has occured.");
            }

            toast({
              title: `User ${status} Success`,
              description: (
                <>
                  The user has been <span className="uppercase">{status}d</span>{" "}
                  successfully
                </>
              ),
              variant: "success",
            });
            setLoading((prev) => !prev);
            toggleDialog(false);
          },
        }
      );
    } else {
      deleteUser(user, {
        onSuccess: () => {
          toast({
            title: `User ${status} Success`,
            description: (
              <>
                The user has been <span className="uppercase">{status}d</span>{" "}
                successfully
              </>
            ),
            variant: "success",
          });
          setLoading((prev) => !prev);
          toggleDialog(false);
        },
      });
    }
  };
  return (
    <Button
      variant={status === "Reactivate" ? "outline" : "destructive"}
      disabled={loading}
      onClick={onClick}
      className={cn(
        "flex gap-2",
        loading ? "pl-2" : "",
        status === "Reactivate"
          ? "border-none bg-yellow-300 text-white hover:bg-yellow-500"
          : ""
      )}
    >
      {loading && <LoaderCircle className="animate-spin" />}
      Proceed
    </Button>
  );
};

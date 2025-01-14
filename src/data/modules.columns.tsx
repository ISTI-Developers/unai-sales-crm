import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Modules } from "@/interfaces/user.interface";
import { useRole } from "@/providers/role.provider";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useState } from "react";

export const columns: ColumnDef<Modules>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: () => {
      return <p className="text-center">Name</p>;
    },
    cell: ({ row }) => {
      const name: string = row.getValue("name");

      return <p className="text-center">{name}</p>;
    },
  },
  {
    id: "actions",
    accessorKey: "status",
    header: "Action",
    cell: ({ row }) => <StatusToggle row={row} />,
  },
];

const StatusToggle = ({ row }: { row: Row<Modules> }) => {
  const { toggleModule, forceReload } = useRole();
  const { toast } = useToast();
  const module = row.original;
  const status = row.getValue("actions");

  const [open, setOpen] = useState(false);

  const onToggleChange = async () => {
    if (module.m_id && module.status_id) {
      const newStatus = module.status_id === 1 ? 2 : 1;
      const response = await toggleModule(module, newStatus);

      if (response.acknowledged) {
        toast({
          description: `${module.name} has been ${
            status === "active" ? "disabled" : "enabled"
          }.`,
          variant: "success",
        });
        setOpen(false);
        forceReload();
      } else {
        toast({
          title: "System Error",
          description: response.error ?? "Please contact the IT department.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Switch
          checked={status === "active"}
          onCheckedChange={() => setOpen(true)}
        />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>
          {status === "active" ? "Disable " : "Enable "}
          {module.name} Module
        </DialogTitle>
        <div className="text-sm space-y-2">
          {status === "active" ? (
            <>
              <p>Are you sure you want to disable this module?</p>
              <p className="font-semibold text-xs text-slate-400">
                Please note: Disabling this module will prevent users from
                accessing this page, and you won't be able to set permissions
                for it while it's disabled.
              </p>
            </>
          ) : (
            <>
              <p>Are you sure you want to enable this module?</p>
              <p className="font-semibold text-xs text-slate-400">
                Once enabled, users will regain access to this page, and you'll
                be able to set permissions as needed.
              </p>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={status === "active" ? "destructive" : "ghost"}
            onClick={onToggleChange}
            className={
              status === "active"
                ? ""
                : "bg-main-100 hover:bg-main-400 text-white hover:text-white"
            }
          >
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

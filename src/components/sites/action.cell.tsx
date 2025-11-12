import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccess } from "@/hooks/useClients";
import { Site } from "@/interfaces/sites.interface";
import { CellContext } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useManageSite } from "@/hooks/useSites";
import { cn } from "@/lib/utils";
export const ActionCell = ({ row }: CellContext<Site, unknown>) => {
  const site = row.original;
  const { access: edit } = useAccess("sites.edit");
  const { access: remove } = useAccess("sites.delete");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="sr-only">Open Menu</span>
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start">
        <DropdownMenuItem asChild>
          <Link
            className="cursor-pointer text-xs"
            to={`/sites/${site.site_code}`}
          >
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild disabled={!edit}>
          <Link
            className="cursor-pointer text-xs"
            to={`/sites/${site.site_code}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {site.status === 1 && <ActionDialog site={site} action="deactivate" label="Deactivation" disabled={!remove} />}
        {site.status === 2 && <ActionDialog site={site} action="reactivate" label="Reactivation" disabled={!remove} />}
        <ActionDialog site={site} action="dismantle" label="Dismantling" disabled={!remove} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function ActionDialog({ disabled, site, action, label }: { disabled: boolean, site: Site; action: string; label: string }) {
  const { mutate } = useManageSite();

  const newStatus = {
    "reactivate": 1,
    "deactivate": 2,
    "dismantle": 5
  }

  const onContinue = () => {
    mutate({ site_code: site.site_code, action: action, newStatus: newStatus[action as keyof typeof newStatus] })
  }

  const isDestructive = action === "dismantle" || action === "deactivate"

  return <DropdownMenuItem
    onClick={(e) => e.preventDefault()}
    asChild
  >
    <AlertDialog>
      <AlertDialogTrigger
        className={cn(isDestructive ? "text-red-300" : "", "cursor-pointer text-xs w-full text-start p-2 py-1 rounded hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-50 capitalize")}
        disabled={disabled}
      >
        {action}
      </AlertDialogTrigger>
      <AlertDialogContent aria-describedby={undefined}>
        <AlertDialogTitle>{label} Confirmation</AlertDialogTitle>
        <div>
          Are you sure you want to {action}{" "}
          <span className="font-semibold">{site.site_code}</span>?
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue} className={cn(isDestructive ? "bg-red-300 hover:bg-red-500" : "")}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </DropdownMenuItem>
}

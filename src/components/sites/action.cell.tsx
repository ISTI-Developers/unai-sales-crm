import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClientAccess } from "@/hooks/useClients";
import { Site } from "@/interfaces/sites.interface";
import { CellContext } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
export const ActionCell = ({ row }: CellContext<Site, unknown>) => {
  const site = row.original;
  const { access } = useClientAccess(18);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <span className="sr-only">Open Menu</span>
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link
            className="cursor-pointer text-xs"
            to={`/sites/${site.site_code}`}
          >
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild disabled={!access.edit}>
          <Link
            className="cursor-pointer text-xs"
            to={`/sites/${site.site_code}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => e.preventDefault()}
          asChild
        >
          <Dialog>
            <DialogTrigger
              className="cursor-pointer text-xs w-full text-start p-2 py-1 text-red-300 rounded hover:bg-zinc-100 disabled:pointer-events-none disabled:opacity-50"
              disabled={!access.delete}
            >
              Delete
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogTitle>Delete Confirmation</DialogTitle>
              <div>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{site.site_code}</span>?
              </div>
              <DialogFooter>
                <Button variant="destructive">Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

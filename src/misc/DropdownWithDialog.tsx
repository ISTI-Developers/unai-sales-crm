import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionDialogProps {
  trigger: string;
  header: string;
  description: ReactNode;
  open: boolean;
  onOpen: (state: boolean) => void;
  content?: ReactNode;
  proceed: ReactNode;
}
const DropdownWithDialog = (props: ActionDialogProps) => {
  return (
    <DropdownMenuItem onClick={(e) => e.preventDefault()}>
      <ActionDialog {...props} />
    </DropdownMenuItem>
  );
};

const ActionDialog = ({
  trigger,
  header,
  description,
  content,
  proceed,
  open,
  onOpen,
}: ActionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(state) => onOpen(state)}>
      <DialogTrigger
        className={cn(
          "capitalize w-full text-start",
          ["delete", "deactivate", "disable"].includes(trigger)
            ? "text-red-100 focus:text-red-300"
            : ""
        )}
      >
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{header}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content && content}
        <DialogFooter>
          <Button variant="ghost">
            Cancel
          </Button>
          {proceed && proceed}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DropdownWithDialog;

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Lock, LockOpen } from "lucide-react";
import { capitalize } from "@/lib/utils";
import { Button } from "../ui/button";
import { getISOWeek } from "date-fns";
import { generateWeeks } from "@/data/reports.columns";
import { useSettings } from "@/providers/settings.provider";
import { useToast } from "@/hooks/use-toast";

function ReportWeekDialog({
  access,
}: {
  access: {
    ID: number | undefined;
    week: string;
    access: boolean;
  };
}) {
  const { unlockWeek, lockWeek, doReload } = useSettings();
  const { toast } = useToast();
  const currentWeekIndex = getISOWeek(new Date()) - 1;
  const weeks = generateWeeks();
  const [openDialog, onDialogOpen] = useState(false);

  const onContinue = async () => {
    if (!access) return;

    try {
      if (access.access) {
        if (!access.ID) return;
        const response = await lockWeek(access.ID);
        if (response && response.acknowledged) {
          toast({
            variant: "success",
            description: "Week successfully locked.",
          });
        } else {
          throw new Error("An error has occured");
        }
      } else {
        const response = await unlockWeek(access.week);
        if (response && response.acknowledged) {
          toast({
            variant: "success",
            description: "Week successfully unlocked.",
          });
        } else {
          throw new Error("An error has occured");
        }
      }
      onDialogOpen(false);
      doReload((val) => (val += 1));
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to change week lock status: " + error,
      });
    }
  };

  return (
    <Dialog open={openDialog} onOpenChange={onDialogOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          disabled={weeks[currentWeekIndex] === access.week}
          key={access.week}
          className="capitalize flex items-center justify-start gap-3 cursor-pointer"
        >
          {access.access ? (
            <LockOpen
              className="scale-x-[-1]"
              size={16}
              stroke="#34d399"
              strokeWidth={3}
            />
          ) : (
            <Lock size={16} stroke="#e2e2e2" strokeWidth={3} />
          )}
          <p className={access.access ? "text-emerald-400" : ""}>
            {capitalize(access.week, "_")}
          </p>
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Configure Week</DialogTitle>
        </DialogHeader>
        <div>
          <p>
            <span className="capitalize font-semibold">
              {access.access ? "lock" : "unlock"}
            </span>
            {` the edit access for ${access.week}?`}
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={onContinue}
            className={
              "bg-main-100 hover:bg-main-700 text-white hover:text-white"
            }
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReportWeekDialog;

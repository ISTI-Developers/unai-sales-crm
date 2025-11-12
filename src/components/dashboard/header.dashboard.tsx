import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useOnlineUsers } from "@/hooks/useUsers";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
// import { PenLine } from "lucide-react";
// import { Button } from "../ui/button";
// { onToggleEdit }: { onToggleEdit: (toggle: boolean) => void }
function DashboardHeader() {
  return (
    <section className="flex items-center justify-between gap-2">
      <DateAndTime />
      <OnlineBadge />
      {/* <Button onClick={() => onToggleEdit(true)} className="p-[0.3rem] h-auto rounded-full text-xs bg-yellow-200 border-none text-yellow-500/50 hover:bg-yellow-400 hover:text-yellow-500" variant="outline"><PenLine size={8} /></Button> */}
    </section>
  );
}

function DateAndTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <p>{format(currentTime, "MMMM dd, yyyy | h:mm a")}</p>;
}

function OnlineBadge() {
  const { data, isLoading } = useOnlineUsers();

  const status = useMemo(() => {
    if (!data) {
      return ["bg-red-100", "bg-red-500", "text-red-600", "error"];
    }
    if (isLoading) {
      return [
        "bg-slate-100",
        "bg-slate-500",
        "text-slate-600",
        "loading online users",
      ];
    }
    if (data.length === 0) {
      return ["bg-red-100", "bg-red-500", "text-red-600", "0 online"];
    }
    return [
      "bg-emerald-100",
      "bg-emerald-500",
      "text-emerald-600",
      `${data.length} online`,
    ];
  }, [isLoading, data]);
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger className="ml-auto">
        <div
          className={cn(
            "flex items-center gap-2 text-sm rounded-full p-1 px-2",
            status[0]
          )}
        >
          <div className={cn("w-3 h-3 rounded-full", status[1])} />
          <p className={status[2]}>{status[3]}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div>
          {data?.map((user) => {
            return (
              <p key={user.ID}>{`${user.first_name} ${user.last_name}`}</p>
            );
          })}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default DashboardHeader;

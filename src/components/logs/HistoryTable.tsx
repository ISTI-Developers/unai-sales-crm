import { HistoryLog } from "@/providers/log.provider";
import { format } from "date-fns";
import { useMemo } from "react";
import { ScrollArea } from "../ui/scroll-area";

const HistoryTable = ({
  history,
}: {
  history: HistoryLog[] | null;
  full?: boolean;
  className?: string;
}) => {
  const list = useMemo(() => {
    if (!history) return {};


    const grouped = history.reduce((acc, item) => {
      const dateKey = format(new Date(item.date), "PP");

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push(item);

      return acc;
    }, {} as Record<string, typeof history>);
    return grouped
  }, [history]);

  return history ? (
    <ScrollArea>
      <div className="flex flex-col gap-3 max-h-[400px]">
        {Object.entries(list).map(([date, items]) => {
          return <div key={date}>
            <p className="uppercase font-semibold text-sm">{date}</p>
            <div className="p-2 flex flex-col gap-4">
              {items.map((history) => {
                return (
                  <div key={history.ID} className="flex items-center gap-4">
                    <p className="text-zinc-400 text-xs whitespace-nowrap">{format(new Date(history.date), "p")}</p>
                    <div>
                      <p className="font-semibold text-sm">{history.author}</p>
                      <p className="text-sm ">{history.action}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        })}
      </div>
    </ScrollArea>
  ) : (
    <p className="text-sm pt-2 text-slate-400 text-center">
      ----- No history found ----
    </p>
  );
};

export default HistoryTable;

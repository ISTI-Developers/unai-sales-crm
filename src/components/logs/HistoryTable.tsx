import { cn } from "@/lib/utils";
import { HistoryLog } from "@/providers/log.provider";

const HistoryTable = ({
  history,
  className = "",
}: {
  history: HistoryLog[] | null;
  full?: boolean;
  className?: string;
}) => {
  const list = history 

  return list ? (
    <>
      <div
        className={cn(
          "grid grid-cols-[1fr_3fr_1fr] gap-2 uppercase font-semibold text-xs",
          className
        )}
      >
        <p>Time</p>
        <p>Action</p>
        <p>Author</p>
      </div>
      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
        {list.length > 0 ? list.map((history) => {
          return (
            <div className="grid grid-cols-[1fr_3fr_1fr] gap-2 text-xs">
              <p className="text-slate-400">
                {new Date(history.date).toLocaleString()}
              </p>
              <p>{history.action}</p>
              <p className="capitalize">{history.author}</p>
            </div>
          );
        }) : <div className="w-full text-center text-sm pt-2 text-slate-400">--- No history found ---</div>}
      </div>
    </>
  ) : (
    <p className="text-sm pt-2 text-slate-400 text-center">
      ----- No history found ----
    </p>
  );
};

export default HistoryTable;

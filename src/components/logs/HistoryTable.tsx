import { cn } from "@/lib/utils";
import { HistoryLog } from "@/providers/log.provider";

const HistoryTable = ({
  history,
  className = "",
  full = false,
}: {
  history: HistoryLog[] | null;
  full?: boolean;
  className?: string;
}) => {
  const list = history && (full ? history : history.slice(0, 3));

  return list ? (
    <>
      <div
        className={cn(
          "grid grid-cols-[20%_60%_20%] uppercase font-semibold text-sm",
          className
        )}
      >
        <p>Time</p>
        <p>Action</p>
        <p>Author</p>
      </div>
      <div className="flex flex-col gap-3">
        {list.map((history) => {
          return (
            <div className="grid grid-cols-[20%_60%_20%] text-sm">
              <p className="text-slate-400">
                {new Date(history.date).toLocaleString()}
              </p>
              <p>{history.action}</p>
              <p>{history.author}</p>
            </div>
          );
        })}
      </div>
    </>
  ) : (
    <p className="text-sm pt-2 text-slate-400 text-center">
      ----- No history found ----
    </p>
  );
};

export default HistoryTable;

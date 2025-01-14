import { logKeyMap } from "@/data/logs.keymap";
import { HistoryLog, useLog } from "@/providers/log.provider";
import { useEffect, useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import HistoryTable from "../logs/HistoryTable";

const ClientHistory = ({ clientIDs }: { clientIDs: number[] }) => {
  const { getModuleLogs } = useLog();
  const [history, setHistory] = useState<HistoryLog[] | null>(null);

  useEffect(() => {
    const setup = async () => {
      console.log(clientIDs, logKeyMap.clients.modules);
      const response = await getModuleLogs(
        "clients",
        clientIDs,
        logKeyMap.clients.modules
      );
      setHistory(response);
    };
    setup();

    const interval = setInterval(setup, 5000); //fetch every 5 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <>
      <div className="flex flex-col gap-2">
        <HistoryTable history={history} />
      </div>
      <DialogContent className="w-full max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Client History</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
          <HistoryTable history={history} full />
          <p className="text-xs text-slate-400 text-center">
            ----- End of history ----
          </p>
        </div>
      </DialogContent>
    </>
  );
};

export default ClientHistory;

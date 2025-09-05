import { logKeyMap } from "@/data/logs.keymap";
import { HistoryLog, useLog } from "@/providers/log.provider";
import { useEffect, useState } from "react";
import HistoryTable from "../logs/HistoryTable";

const ClientHistory = ({ clientIDs }: { clientIDs: number[] }) => {
  const { getModuleLogs } = useLog();
  const [history, setHistory] = useState<HistoryLog[] | null>(null);

  useEffect(() => {
    const setup = async () => {
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
  }, [clientIDs]);
  return (
    <>
      <div className="flex flex-col gap-2">
        <HistoryTable history={history} />
      </div>
    </>
  );
};

export default ClientHistory;

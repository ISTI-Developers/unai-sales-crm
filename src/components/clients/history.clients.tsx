import { HistoryLog, useLog } from "@/providers/log.provider";
import { useEffect, useState } from "react";
import HistoryTable from "../logs/HistoryTable";

const ClientHistory = ({ clientIDs, modules }: { clientIDs: number[]; modules: string[] }) => {
  const { getModuleLogs } = useLog();
  const [history, setHistory] = useState<HistoryLog[] | null>(null);

  useEffect(() => {
    const setup = async () => {
      const response = await getModuleLogs(
        "clients",
        clientIDs,
        modules
      );
      setHistory(response);
    };
    setup();

    const interval = setInterval(setup, 5000); //fetch every 5 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientIDs]);

  console.log(history)
  return (
    <>
      <div className="flex flex-col gap-2">
        <HistoryTable history={history} />
      </div>
    </>
  );
};

export default ClientHistory;

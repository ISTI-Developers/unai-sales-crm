import { logModulesMap } from "@/data/logs.keymap";
import { capitalize, getLogTime, today } from "@/lib/utils";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { SystemLog, useLog } from "@/providers/log.provider";
import { AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

const Logs = () => {
  const { logs } = useLog();

  const systemLogs: SystemLog[] | [] = useMemo(() => {
    if (!logs || typeof logs === "string") return [];

    const updatedLogModules = logs.map((log) => {
      const module = capitalize(
        logModulesMap(log.module.replace("*", "")),
        "_"
      );
      return {
        ...log,
        module: module,
      };
    });

    const groupedLogsByDate = updatedLogModules.reduce((acc, log) => {
      let systemLog = acc.find(
        (entry) =>
          format(new Date(entry.date), "yyyy-MM-dd") ===
          format(new Date(log.date), "yyyy-MM-dd")
      );

      if (!systemLog) {
        systemLog = {
          date: format(new Date(log.date), "yyyy-MM-dd"),
          logs: [],
        };
        acc.push(systemLog);
      }

      systemLog.logs.push(log);

      return acc;
    }, [] as SystemLog[]);

    return groupedLogsByDate;
  }, [logs]);

  return (
    <Container title="System Logs" className="p-0 scrollbar-thin">
      <Helmet>
        <title>System Logs | Sales Platform</title>
      </Helmet>
      <AnimatePresence>
        <Page>
          <div>
            {systemLogs.map(({ date, logs }) => {
              return (
                <section key={date}>
                  <h2 className="font-semibold text-white p-2 sticky top-0 text-sm w-full flex justify-center bg-white">
                    <p className="rounded-full p-1.5 px-4 bg-main-400 w-fit z-[2]">
                      {today(date)}
                    </p>
                    <Separator className="absolute top-1/2 -translate-y-1/2 bg-main-400" />
                  </h2>
                  <div className="px-8 space-y-4">
                    {logs.map((log, index) => {
                      return (
                        <div
                          key={`${log.date}_${index}`}
                          className="grid grid-cols-[60%_20%]"
                        >
                          <p className="col-[3/4] row-[2/3] text-end text-gray-500 text-sm">
                            {log.author}
                          </p>
                          <p className="text-gray-600">{log.action}</p>
                          <p className="col-[1/2] text-lg font-semibold">
                            {log.module}
                          </p>
                          <p className="col-[3/4] row-[1/2] text-end text-gray-500 text-sm">
                            {getLogTime(log.date)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </Page>
      </AnimatePresence>
    </Container>
  );
};

export default Logs;

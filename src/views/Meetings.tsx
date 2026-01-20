import { useWeekColumns } from "@/data/meeting.columns";
import { MeetingTable } from "@/data/meeting.table";
import { generateWeeks } from "@/data/reports.columns";
import { useMeetings } from "@/hooks/useMeetings";
import { MinutesTable } from "@/interfaces/meeting.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { ReportProvider } from "@/providers/reports.provider";
import { addHours, getISOWeek } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { Helmet } from "react-helmet";

const Meetings = () => {
  return (
    <Container title="Meetings">
      <Helmet>
        <title>Meetings | Sales Platform</title>
      </Helmet>
      <ReportProvider>
        <Main />
      </ReportProvider>
    </Container>
  );
};

const Main = () => {
  const toggledWeeks = localStorage.getItem("visibleWeeks");
  const indexes = Object.entries(JSON.parse(toggledWeeks ?? '{}'))
    .map(([k, v], i) => ({ key: k, value: v, index: i }))
    .filter(({ value }) => value)
    .map(({ index }) => index);

  const { data } = useMeetings(toggledWeeks ? indexes : [getISOWeek(new Date())]);
  const { columns } = useWeekColumns();

  const meetings: MinutesTable[] = useMemo(() => {
    if (!data) return [];
    const weeks = generateWeeks();
    console.log(data);

    const groupedByUnit = data.reduce<Record<string, MinutesTable>>(
      (acc, item) => {
        const salesUnit = item.sales_unit;
        const hasDateSubmission = item.modified_at;
        const currentWeek = hasDateSubmission
          ? getISOWeek(
            new Date(
              addHours(
                new Date(item.modified_at),
                Number(import.meta.env.VITE_TIME_ADJUST)
              )
            )
          )
          : null;

        const minutesColumns: MinutesTable = weeks.reduce(
          (acc, week) => {
            acc[week] = "";
            return acc;
          },
          {
            sales_unit: "",
          } as MinutesTable
        );

        if (!acc[salesUnit]) {
          acc[salesUnit] = {
            ...minutesColumns,
            sales_unit: salesUnit,
            unit_id: item.sales_unit_id,
          }
        }
        if (hasDateSubmission) {
          const weekKey = weeks[currentWeek! - 1];
          if (weekKey && acc[salesUnit][weekKey] !== undefined) {
            const weekData = {
              ...item
            };
            acc[salesUnit][weekKey] = weekData;
          }
        }

        return acc;
      }, {}
    )
    return Object.values(groupedByUnit)
  }, [data])
  return (
    <>
      <AnimatePresence mode="wait">
        <Page className="w-full space-y-4">
          <MeetingTable columns={columns} data={meetings} />
        </Page>
      </AnimatePresence>
    </>
  );
};

export default Meetings;

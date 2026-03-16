import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useColumns } from "@/data/meeting.columns";
import { MeetingTable } from "@/data/meeting.table";
import { generateWeeks } from "@/data/reports.columns";
import { useMeetings } from "@/hooks/useMeetings";
import { RawMinutes, WeekRow } from "@/interfaces/meeting.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { ReportProvider } from "@/providers/reports.provider";
import { getISOWeek } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
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
  const [openYear, setOpenYear] = useState(false)
  const [year, setYear] = useState(2026);
  const [selectedWeeks, setWeeks] = useState<(`${string} Wk${number}`)[]>(
    () => {
    const stored = localStorage.getItem("meetingWeeks");

    if (stored) {
      return JSON.parse(stored);
    }

    const weeks = generateWeeks();
    return [weeks[getISOWeek(new Date()) - 1] as `${string} Wk${number}`];
  });
  const weeks = useMemo(() => generateWeeks(year), [year]);

  const indexes = useMemo(() => {
    return selectedWeeks
      .map(w => weeks.indexOf(w) + 1)
      .filter(i => i > 0);
  }, [selectedWeeks, weeks]);

  const {columns} = useColumns(year)
  const { data } = useMeetings(
    indexes ? indexes : [getISOWeek(new Date())],
    year
  );
  const meetings: WeekRow[] = useMemo(() => {
    if (!data) return [];
    const weeks = generateWeeks(year);


    const row = weeks.reduce<Record<string, RawMinutes | null>>(
      (acc, week) => {
        acc[week] = null
        return acc
      },
      {}
    )
    data.forEach(item => {
      const weekKey = weeks[item.week - 1];

      if (weekKey in row) {
        row[weekKey] = item;
      }
    })
    return [row]

  }, [data, year])

  useEffect(() => {
    const toggledWeeks = localStorage.getItem("meetingWeeks");
    console.count("rendered initial");

    if (toggledWeeks) {
      const weeksArray: (`${string} Wk${number}`)[] = JSON.parse(toggledWeeks);

      console.log(weeksArray);
      if (weeksArray.length > 0) {
        setWeeks(weeksArray);
      }
    } else {
      const weeks = generateWeeks();
      setWeeks([weeks[getISOWeek(new Date()) - 1] as `${string} Wk${number}`])
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("meetingWeeks", JSON.stringify(selectedWeeks));
  }, [selectedWeeks])
  return (
    <>
      <AnimatePresence mode="wait">
        <Page className="w-full space-y-4">
          <MeetingTable columns={columns} data={meetings} selectedWeeks={selectedWeeks} setWeeks={setWeeks} year={year}>
            <DropdownMenu open={openYear} onOpenChange={(open) => open && setOpenYear(open)}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Select Year</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                onPointerDownOutside={() => {
                  setOpenYear(false);
                }}
                align="end"
                className="max-h-[500px] overflow-y-auto scrollbar-thin"
              >
                {[2023, 2024, 2025, 2026]
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column}
                        className="capitalize"
                        checked={year === column}
                        onCheckedChange={() => {
                          setYear(column)
                        }}
                      >
                        {column}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </MeetingTable>
        </Page>
      </AnimatePresence>
    </>
  );
};

export default Meetings;

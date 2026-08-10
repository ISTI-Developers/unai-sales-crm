
import MeetingWorkspace from "@/components/minutes/meeting.workspace";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, useWeeks } from "@/lib/utils";
import Container from "@/misc/Container";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";

const Meetings = () => {
  return (
    <Container title="Meetings">
      <Helmet>
        <title>Meetings | Sales Platform</title>
      </Helmet>
      <Main />
    </Container>
  );
};

const Main = () => {
  const [year, setYear] = useState(2026);
  const { weeks, current } = useWeeks();
  const [selectedWeek, setSelectedWeek] = useState(current());
  const selectedWeekRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    selectedWeekRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [selectedWeek]);
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border">
      {/* Sidebar */}
      <aside className="flex w-[225px] flex-col border-r bg-muted/30">
        <div className="p-4 flex gap-4 items-center">
          <Label>Year: </Label>
          <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2025, 2026].map(option => (<SelectItem key={option} value={String(option)}>{option}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-2">
            {weeks.map((week) => {
              const header = `Wk ${week.isoWeek} • (${format(week.start, "MMM dd")})`;

              return (
                <Button
                  ref={
                    selectedWeek?.yearweek === week.yearweek
                      ? selectedWeekRef
                      : undefined
                  }
                  variant="outline"
                  key={week.yearweek}
                  onClick={() => setSelectedWeek(week)}
                  className={cn(
                    "w-full justify-start rounded-lg border transition-colors hover:bg-zinc-100",
                    selectedWeek?.yearweek === week.yearweek &&
                    "border-emerald-400 bg-emerald-100 text-emerald-600"
                  )}
                >
                  {header}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      {/* Workspace */}
      <MeetingWorkspace selectedWeek={selectedWeek} year={year} />
    </div>
  );
};

export default Meetings;

import { ReportTable } from "@/interfaces/reports.interface";
import { ColumnDef } from "@tanstack/react-table";
import { addWeeks, format, getISOWeeksInYear, startOfYear } from "date-fns";

export const generateWeeks = () => {
  const startDate = startOfYear(new Date());
  const adjustedDate = startDate.getDay() > 1 ? startDate.getDate() - startDate.getDay() : startDate;
  const weeks = [];
  let currentMonth = format(adjustedDate, "MMMM");
  let weekOfMonth = 1;

  for (let i = 0; i < getISOWeeksInYear(new Date()); i++) {
    const weekStart = addWeeks(startDate, i);
    const month = format(weekStart, "MMM");

    // Reset week counter if the month changes
    if (month !== currentMonth) {
      currentMonth = month;
      weekOfMonth = 1; // Reset week of the month
    }

    weeks.push(`${month} Wk${weekOfMonth}`);
    weekOfMonth++;
  }

  return weeks;
};

export const weekColumns: ColumnDef<ReportTable>[] = [
  {
    id: "client",
    accessorKey: "client",
  },
];

weekColumns.push(
  ...generateWeeks().map((week) => {
    return {
      id: week,
      accessorKey: week,
    };
  })
);

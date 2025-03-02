import { useState, useEffect } from "react";
import { ReportTable } from "@/interfaces/reports.interface";
import { capitalize } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { addWeeks, format, getISOWeeksInYear, startOfYear } from "date-fns";
import { filterFn } from "./columns";
import { User } from "@/interfaces/user.interface";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AddReport from "@/pages/reports/add.reports";

export const generateWeeks = () => {
  const startDate = startOfYear(new Date());
  const adjustedDate =
    startDate.getDay() > 1
      ? startDate.getDate() - startDate.getDay()
      : startDate;
  const weeks = [];
  let currentMonth = format(adjustedDate, "MMMM");
  let weekOfMonth = 1;

  for (let i = 0; i < getISOWeeksInYear(new Date()); i++) {
    const weekStart = addWeeks(startDate, i);
    const month = format(weekStart, "MMM");

    if (month !== currentMonth) {
      currentMonth = month;
      weekOfMonth = 1;
    }

    weeks.push(`${month} Wk${weekOfMonth}`);
    weekOfMonth++;
  }

  return weeks;
};

const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem("currentUser");
      setCurrentUser(user ? JSON.parse(user) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return currentUser;
};

const renderColumn = (id: string) => ({
  id,
  accessorKey: id,
  header: capitalize(id, "_"),
  cell: ({ row }: { row: Row<ReportTable> }) => {
    const column: string = row.getValue(id);
    return <p className="text-center">{capitalize(column)}</p>;
  },
  filterFn,
});

export const useWeekColumns = () => {
  const currentUser = useCurrentUser();
  const weekColumns: ColumnDef<ReportTable>[] = [
    { id: "client", accessorKey: "client" },
  ];

  if (currentUser) {
    const { role_id } = currentUser.role;
    if ([1, 3].includes(role_id)) {
      weekColumns.push(
        renderColumn("sales_unit"),
        renderColumn("account_executive")
      );
    } else if (role_id === 4) {
      weekColumns.push(renderColumn("account_executive"));
    }
  }

  weekColumns.push(
    ...generateWeeks().map((week) => ({
      id: week,
      accessorKey: week,
      cell: WeekForm,
    }))
  );

  return weekColumns;
};

const WeekForm = (cell) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="w-full" onDoubleClick={() => setOpen(true)}>
        <p className="select-none cursor-pointer">{cell.getValue()}</p>
      </div>
      <DialogContent>
        <AddReport/>
      </DialogContent>
    </Dialog>
  );
};

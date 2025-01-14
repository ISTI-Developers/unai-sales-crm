import { ReportsTable } from "@/components/reports/table.reports";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/data/data-table";
import { generateWeeks, weekColumns } from "@/data/reports.columns";
import { ReportTable } from "@/interfaces/reports.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import AddReport from "@/pages/reports/add.reports";
import { useReports } from "@/providers/reports.provider";
import { format, getWeekOfMonth } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { CirclePlus } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, Route, Routes, useLocation } from "react-router-dom";

const Reports = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (location.pathname.match("add")) {
      localStorage.removeItem("storedClient");
    }
  }, [pathname]);
  return (
    <Container title="Reports">
      <Helmet>
        <title>Reports | Sales CRM</title>
      </Helmet>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/add" element={<AddReport />} />
      </Routes>
    </Container>
  );
};

const Main = () => {
  const { reports } = useReports();
  const weeks = generateWeeks();

  const formattedReports: ReportTable[] = useMemo(() => {
    if (!reports) return [];

    const reportColumns: ReportTable = weeks.reduce(
      (acc, week) => {
        acc[week] = ""; // Initialize each week with an empty string (or empty array if needed)
        return acc;
      },
      {
        client: "", // Add additional properties directly in the initial object
        client_id: 0,
      }
    );

    const groupedClients = reports.reduce((acc, item) => {
      const clientName = item.client;
      const currentWeek = getWeekOfMonth(new Date(item.date_submitted));
      const currentMonth = format(new Date(item.date_submitted), "MMM");
      const weekKey = `${currentMonth} Wk${currentWeek}`;

      if (!acc[clientName]) {
        acc[clientName] = {
          ...reportColumns, // Initialize with the weeks and empty strings
          client: clientName, // Set the client name
          client_id: item.client_id, // Set the client_id (or any other unique identifier)
        };
      }

      // Populate the specific week if the weekKey matches a key in reportColumns
      if (acc[clientName].hasOwnProperty(weekKey)) {
        acc[clientName][weekKey] = item.activity; // Add the activity for the specified week
      }

      return acc;
    }, {});

    return Object.values(groupedClients);
  }, [reports]);
  return (
    <>
      <header className="flex items-center justify-between">
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-1.5 pl-2"
        >
          <Link to="./add">
            <CirclePlus size={16} />
            Create Report
          </Link>
        </Button>
      </header>
      <AnimatePresence>
        <Page className="w-full">
          <ReportsTable columns={weekColumns} data={formattedReports} />
        </Page>
      </AnimatePresence>
    </>
  );
};

export default Reports;

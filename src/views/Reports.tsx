import { ReportsTable } from "@/components/reports/table.reports";
import { generateWeeks, useWeekColumns } from "@/data/reports.columns";
import { ReportTable } from "@/interfaces/reports.interface";
import { User } from "@/interfaces/user.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import AddReport from "@/pages/reports/add.reports";
import { useReports } from "@/providers/reports.provider";
import { useRole } from "@/providers/role.provider";
import { getISOWeek } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Route, Routes, useLocation } from "react-router-dom";

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
  const { currentUserRole } = useRole();
  const user = localStorage.getItem("currentUser");
  const currentUser: User = user ? JSON.parse(user) : null;

  const formattedReports: ReportTable[] = useMemo(() => {
    if (!reports || !currentUserRole || !currentUser) return [];

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

    const groupedClients = reports.reduce<Record<string, ReportTable>>(
      (acc, item) => {
        const clientName = item.client;
        const weeks = generateWeeks();
        const currentWeek = getISOWeek(new Date(item.date_submitted));

        const weekKey = weeks[currentWeek - 1];
        if (!acc[clientName]) {
          acc[clientName] = {
            ...reportColumns, // Initialize with the weeks and empty strings
            client: clientName, // Set the client name
            client_id: item.client_id, // Set the client_id (or any other unique identifier)
            sales_unit: item.sales_unit,
            sales_unit_id: item.sales_unit_id,
            account_executive: item.user,
            account_id: item.account_id,
          };
        }

        // Populate the specific week if the weekKey matches a key in reportColumns
        if (acc[clientName].hasOwnProperty(weekKey)) {
          acc[clientName][weekKey] = item.activity; // Add the activity for the specified week
        }

        return acc;
      },
      {}
    );

    const groupedValues = Object.values(groupedClients);
    if (currentUserRole.role_id === 4) {
      const usersClients = groupedValues.filter(
        (report) => report.account_id === currentUser.ID
      );

      const subClients = groupedValues.filter(
        (report) =>
          report.sales_unit_id === currentUser.sales_unit?.sales_unit_id &&
          report.account_id !== currentUser.ID
      );
      return [
        ...usersClients,
        ...subClients.sort((a, b) =>
          a.account_executive.localeCompare(b.account_executive)
        ),
      ];
    } else {
      return groupedValues.sort((a, b) => a.client.localeCompare(b.client));
      // return groupedValues.filter((report) => report.sales_unit_id === currentUserRole.sales_unit_id);
    }
  }, [reports, currentUserRole]);
  return (
    <>
      <AnimatePresence>
        <Page className="w-full">
          <ReportsTable columns={useWeekColumns()} data={formattedReports} />
        </Page>
      </AnimatePresence>
    </>
  );
};

export default Reports;

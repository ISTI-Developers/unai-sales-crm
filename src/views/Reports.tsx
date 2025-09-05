import { ReportsTable } from "@/components/reports/table.reports";
import { useWeekColumns } from "@/data/reports.columns";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { ReportProvider, useReports } from "@/providers/reports.provider";
import { AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";

const Reports = () => {
  return (
    <Container title="Reports">
      <Helmet>
        <title>Reports | Sales Platform</title>
      </Helmet>
      <ReportProvider>
        <Main />
      </ReportProvider>
    </Container>
  );
};

const Main = () => {
  const { reports } = useReports();

  const columns = useWeekColumns();
  return (
    <>
      <AnimatePresence mode="wait">
        <Page className="w-full space-y-4">
          <ReportsTable columns={columns} data={reports} />
        </Page>
      </AnimatePresence>
    </>
  );
};

export default Reports;

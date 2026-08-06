// import ReportDialog from "@/components/reports/dialog.report";
import ReportSheet from "@/components/reports/sheet.report";
import { ReportsTable } from "@/components/reports/table.reports";
import { useWeekColumns } from "@/data/reports.columns";
import Container from "@/misc/Container";
import { ReportProvider, useReports } from "@/providers/reports.provider";
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
      <ReportsTable columns={columns} data={reports}>
        {/* <ReportDialog /> */}
      </ReportsTable>
      <ReportSheet />
    </>
  );
};

export default Reports;

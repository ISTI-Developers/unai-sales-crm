// import ReportDialog from "@/components/reports/dialog.report";
import ReportSheet from "@/components/reports/sheet.report";
import { ReportsTable } from "@/components/reports/table.reports";
import { Button } from "@/components/ui/button";
import { useWeekColumns } from "@/data/reports.columns";
import Container from "@/misc/Container";
import PresentationView from "@/pages/reports/presentation";
import { ReportProvider, useReports } from "@/providers/reports.provider";
import { Helmet } from "react-helmet";
import { Link, Route, Routes } from "react-router-dom";

const Reports = () => {
  return (
    <Container title="Reports">
      <Helmet>
        <title>Reports | Sales Platform</title>
      </Helmet>
      <ReportProvider>
        <Routes>
          <Route index element={<Main />} />
          <Route path="presentation" element={<PresentationView />} />
        </Routes>
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
        <Button className="h-7 px-3 text-xs" variant="outline" asChild>
          <Link to="./presentation">Presentation View</Link>
        </Button>
      </ReportsTable>
      <ReportSheet />
    </>
  );
};

export default Reports;

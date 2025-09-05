import useReportSummary from "@/data/reportSummary.data";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { getISOWeek } from "date-fns";
import { generateWeeks } from "@/data/reports.columns";
import { Separator } from "../ui/separator";

const WeeklyReports = () => {
  const weeks = generateWeeks();
  const currentWeek = getISOWeek(new Date());
  const { thisWeeksReports } = useReportSummary();
  return (
    <Card className="border rounded w-full xl:w-1/2 xl:max-h-[50vh]">
      <CardHeader className="py-2 pb-0">
        <div className="py-2">
          <CardTitle>{weeks[currentWeek - 1]} Reports</CardTitle>
        </div>
        <Separator />
      </CardHeader>
      <CardContent className="p-2 pt-0 max-h-[200px] overflow-y-auto xl:max-h-[40vh]">
        <Table>
          <TableCaption>You have reached the end.</TableCaption>
          <TableHeader>
            <TableRow className="sticky top-0 text-xs bg-white hover:bg-white">
              <TableHead className="w-[150px] py-4 text-center">
                Account
              </TableHead>
              <TableHead className="text-center">Client</TableHead>
              <TableHead className="text-center">Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {thisWeeksReports.map((report) => {
              return (
                <TableRow key={report.report_id} className="text-xs">
                  <TableCell>
                    <p className="font-semibold capitalize">{report.ae}</p>
                    <p className="text-">{report.sales_unit}</p>
                  </TableCell>
                  <TableCell>{report.client}</TableCell>
                  <TableCell>{report.report}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WeeklyReports;

import { lazy, Suspense } from "react";
import Container from "@/misc/Container";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
// import Clients from "@/components/dashboard/client.dashboard";
// import Sites from "@/components/dashboard/sites.dashboard";
// import Reports from "@/components/dashboard/reports.dashboard";
// import WeeklyReports from "@/components/dashboard/weeklyReports.dashboard";

// Lazy-loaded components
const DashboardHeader = lazy(
  () => import("@/components/dashboard/header.dashboard")
);
const ClientCard = lazy(() => import("@/components/dashboard/clientCard"));
const SitesCard = lazy(() => import("@/components/dashboard/sitesCard"));
const ReportsCard = lazy(() => import("@/components/dashboard/reportsCard"));
const ClientChart = lazy(() => import("@/components/dashboard/clientChart"));
const ClientDistributionChart = lazy(
  () => import("@/components/dashboard/clientDistributionChart")
);
const BookingsCard = lazy(() => import("@/components/dashboard/bookingsCard")
);
const ReportsSubmissionChart = lazy(
  () => import("@/components/dashboard/reportsSubmissionChart")
);
const WeeklyReportsCard = lazy(
  () => import("@/components/dashboard/weeklyReportsCard")
);
const Dashboard = () => {
  return (
    <Container>
      <Suspense fallback={<div>Loading header...</div>}>
        <DashboardHeader />
      </Suspense>
      <ScrollArea>
        <div className="lg:h-[calc(100vh-10rem)] grid md:grid-cols-6 md:grid-rows-[auto_250px_1fr_1fr] xl:grid-rows-none xl:grid-cols-9 gap-4">
          <Suspense
            fallback={<Skeleton className="w-full h-full md:col-[1/3]" />}
          >
            <ClientCard />
          </Suspense>
          <Suspense
            fallback={<Skeleton className="w-full h-full md:col-[3/5]" />}
          >
            <SitesCard />
          </Suspense>
          <Suspense
            fallback={<Skeleton className="w-full h-full md:col-[5/7]" />}
          >
            <ReportsCard />
          </Suspense>
          <Suspense
            fallback={<Skeleton className="w-full h-full md:col-[1/4]" />}
          >
            <ClientChart />
          </Suspense>
          <Suspense
            fallback={<Skeleton className="w-full h-full md:col-[4/7] md:row-[2/3]" />}
          >
            <ClientDistributionChart />
          </Suspense>

          <Suspense
            fallback={<Skeleton className="w-full h-full md:col-[1/4] md:row-[3/4]" />}
          >
            <BookingsCard />
          </Suspense>
          <Suspense
            fallback={<Skeleton className="w-full h-full md:row-[3/4] md:col-[1/5] xl:col-[1/7]" />}
          >
            <ReportsSubmissionChart />
          </Suspense>
          <Suspense
            fallback={<Skeleton className="w-full h-full md:row-[3/4] md:col-[5/7] xl:row-[1/4] xl:col-[7/10]" />}
          >
            <WeeklyReportsCard />
          </Suspense>
        </div>
      </ScrollArea>
      {/* 
      <div className="flex flex-col gap-4 lg:flex-row">
        <Clients />
        <Sites />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <Reports />
        <WeeklyReports />
      </div> */}

      {/* <Suspense fallback={<div>Loading client summary...</div>}>
        <ClientSummary user={user} />
      </Suspense>

      <Suspense fallback={<div>Loading report summary...</div>}>
        <ReportSummary user={user} />
      </Suspense> */}
    </Container>
  );
};

export default Dashboard;

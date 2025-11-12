import { lazy, Suspense } from "react";
import Container from "@/misc/Container";
import { Separator } from "@/components/ui/separator";
import Overview from "@/components/dashboard/sections/overview";
import Graphs from "@/components/dashboard/sections/graphs";
import Lists from "@/components/dashboard/sections/lists";
import { useAuth } from "@/providers/auth.provider";
import { cn } from "@/lib/utils";
// Lazy-loaded components
const DashboardHeader = lazy(
  () => import("@/components/dashboard/header.dashboard")
);

const Dashboard = () => {
  const { user } = useAuth();

  if(!user) return <>Loading...</>;
  return (
    <Container>
      <Suspense fallback={<div>Loading header...</div>}>
        <DashboardHeader />
      </Suspense>
      <Overview />
      <Separator />
      <div className={cn("flex gap-4",user.role.role_id === 13 ? "flex-row" : "flex-col")}>
        <Graphs />
        <Lists />
      </div>
    </Container>
  );
};

export default Dashboard;

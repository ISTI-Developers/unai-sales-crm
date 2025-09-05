import { ReactNode } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

const DashboardCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <Card className={cn("rounded-sm p-4", className)}>{children}</Card>;
};

export default DashboardCard;

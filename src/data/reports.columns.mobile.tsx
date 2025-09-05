import { Badge } from "@/components/ui/badge";
import { useUserReportViewAccesses } from "@/hooks/useSettings";

import { ReportTable } from "@/interfaces/reports.interface";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth.provider";
import { ColumnDef } from "@tanstack/react-table";

export const useColumns = () => {
  const { user } = useAuth();
  const { data } = useUserReportViewAccesses(user?.ID as number);

  const columns: ColumnDef<ReportTable>[] = [
    { id: "client", accessorKey: "client" },
    {
      id: "status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status: string = row.getValue("status");
        const statusMap: {
          [key: string]:
            | "default"
            | "secondary"
            | "destructive"
            | "outline"
            | null
            | undefined;
        } = {
          active: "outline",
          hot: "outline",
          pool: "destructive",
          "on/off": "secondary",
          "for elections": "secondary",
        };

        const statusClasses: { [key: string]: string } = {
          active: "bg-green-100 text-green-700 border-green-300",
          hot: "bg-yellow-100 text-yellow-500 border-yellow-400",
          "on/off": "bg-sky-100 text-sky-600 border-sky-400",
          "for elections": "bg-sky-100 text-sky-600 border-sky-400",
        };
        return (
          <Badge
            variant={statusMap[status.toLowerCase()]}
            className={cn(
              statusClasses[status.toLowerCase()],
              "uppercase text-[0.5rem] px-1.5 h-5 rounded-full"
            )}
          >
            {status}
          </Badge>
        );
      },
    },
  ];
};

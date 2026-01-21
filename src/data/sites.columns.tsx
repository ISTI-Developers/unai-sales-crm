import RemarksCell from "@/components/sites/remarks.cell";
import { ActionCell } from "@/components/sites/action.cell";
import { Site } from "@/interfaces/sites.interface";
import { ColumnDef } from "@tanstack/react-table";
import PriceCell from "@/components/sites/price.cell";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Site>[] = [
  {
    accessorKey: "structure_code",
    header: "Structure Code",
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="text-left space-y-1">
          <p className="text-xs font-semibold">{item.structure_code}</p>
          <p className="uppercase text-[0.6rem] leading-none italic">
            {item.site_owner}
          </p>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.site_owner,
    accessorKey: "site_owner",
    header: () => null,
    cell: () => null,
  },
  {
    accessorKey: "site_code",
    header: "Site Code",
    cell: ({ row }) => {
      const item: string = row.getValue("site_code");
      return (
        <p className="text-[0.65rem] whitespace-nowrap font-semibold">{item}</p>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const item: string = row.getValue("address");
      return <p className="text-[0.65rem] leading-none">{item}</p>;
    },
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => {
      const item: string = row.getValue("size");
      return <p className="text-[0.65rem] whitespace-nowrap">{item}</p>;
    },
  },
  {
    id: "price",
    accessorKey: "price",
    header: "SRP",
    cell: PriceCell
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: RemarksCell,
  },
  {
    id: "status",
    accessorKey: "status",
    accessorFn: (row) => {
      const statusMap = {
        1: "Active",
        2: "Inactive",
        5: "Dismantled",
      }

      return statusMap[row.status as keyof typeof statusMap];
    },
    header: "Status",
    cell: ({ row, column }) => {
      const status: string = row.getValue(column.id);

      const className = {
        Active: "bg-emerald-100 border-emerald-200 text-emerald-500",
        Inactive: "bg-red-200 border-red-100 text-red-400",
        5: ""
      }

      return <Badge variant="outline" className={className[status as keyof typeof className]}>
        {status}
      </Badge >
    },
    filterFn: (row, column, filterValue) => filterValue.includes(row.getValue(column)),
  },
  {
    header: "Actions",
    cell: ActionCell,
  },
];

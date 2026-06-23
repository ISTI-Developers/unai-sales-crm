import RemarksCell from "@/components/sites/remarks.cell";
import { ActionCell } from "@/components/sites/action.cell";
import { Site } from "@/interfaces/sites.interface";
import { ColumnDef } from "@tanstack/react-table";
import PriceCell from "@/components/sites/price.cell";
import SiteStatusSelect from "@/components/site-status-select";

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
    accessorFn: (row) => `${row.address} | ${row.board_facing}`,
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const item: string = row.original.address;
      const facing = row.original.board_facing;
      return <p className="text-[0.65rem] leading-tight min-w-[250px] flex flex-col">
        <span>{item}</span>
        <span className="text-[0.6rem] italic text-zinc-500">{facing}</span>
      </p>;
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
        3: "Under Construction",
        5: "Dismantled",
      }

      return statusMap[row.status as keyof typeof statusMap];
    },
    header: "Status",
    cell: ({ row }) => {
      const site = row.original;
      return <SiteStatusSelect data={site} />
    },
    filterFn: (row, column, filterValue) => {
      console.log(row.getValue(column), column, filterValue);
      return filterValue.includes(row.getValue(column))
    },
  },
  {
    header: "Actions",
    cell: ActionCell,
  },
];

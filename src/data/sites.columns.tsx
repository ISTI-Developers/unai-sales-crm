import RemarksCell from "@/components/sites/remarks.cell";
import { ActionCell } from "@/components/sites/action.cell";
import { Site } from "@/interfaces/sites.interface";
import { ColumnDef } from "@tanstack/react-table";
import PriceCell from "@/components/sites/price.cell";

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
      return <p className="text-[0.65rem]">{item}</p>;
    },
  },
  {
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
    header: "Actions",
    cell: ActionCell,
  },
];

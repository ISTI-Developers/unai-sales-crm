import RemarksCell from "@/components/sites/remarks.cell";
import { ActionCell } from "@/components/sites/action.cell";
import { Site } from "@/interfaces/sites.interface";
import PriceCell from "@/components/sites/price.cell";
import SiteStatusSelect from "@/components/site-status-select";
import { ColumnDef } from "@tanstack/react-table";
import { Building, Loader, MapPin, PhilippinePeso, Quote, Ruler, UserRoundIcon } from "lucide-react";

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
    enableColumnFilter: false,
    meta: {
      icon: Building
    }
  },
  {
    accessorFn: (row) => row.site_owner,
    accessorKey: "site_owner",
    header: undefined,
    cell: undefined,
    meta: {
      hidden: true,
      filterType: "dropdown",
      allowedOptions: ["is", "is not", "contains"],
      icon: UserRoundIcon
    },
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue<string>(columnId);

      switch (filterValue.condition) {
        case "is":
          return cellValue === filterValue.value;
        case "is not":
          return cellValue !== filterValue.value;
        case "contains":
          return filterValue.value.includes(cellValue);
        default:
          return true;
      }
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
    enableColumnFilter: false,
    meta: {
      icon: Building,
    }
  },
  {
    accessorFn: (row) => `${row.address} | ${row.board_facing}`,
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const item: string = row.original.address;
      const facing = row.original.board_facing;
      return <p className="text-[0.6rem] leading-tight min-w-[150px] flex flex-col">
        <span>{item}</span>
        <span className="text-[0.6rem] italic text-zinc-500">{facing}</span>
      </p>;
    },
    enableColumnFilter: false,
    meta: {
      icon: MapPin,
    }
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => {
      const item: string = row.getValue("size");
      return <p className="text-[0.65rem] whitespace-nowrap">{item}</p>;
    },
    enableColumnFilter: false,
    meta: {
      icon: Ruler
    }
  },
  {
    id: "SRP",
    accessorKey: "srp",
    header: "SRP",
    cell: PriceCell,
    filterFn: (row, _, filterValue) => {
      const cellValue = Number(row.original.price || 0);
      const value = filterValue.value;

      switch (filterValue.condition) {
        case "is":
          return cellValue === Number(value);
        case "between": {
          const from = Number(value.from);
          const to = Number(value.to);

          if (from !== 0 && to === 0) {
            // from -> Infinity
            return cellValue >= from;
          }

          if (from === 0 && to !== 0) {
            // 0 -> to
            return cellValue <= to;
          }

          return cellValue >= from && cellValue <= to;
        }
        default:
          return true;
      }
    },
    meta: {
      filterType: "price_range",
      allowedOptions: ["is", "between"],
      icon: PhilippinePeso
    }
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: RemarksCell,
    enableColumnFilter: false,
    meta: {
      icon: Quote
    }
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
    filterFn: (row, columnId, filterValue) => {
      const cellValue = row.getValue<Date>(columnId);

      switch (filterValue.condition) {
        case "is":
          return cellValue === filterValue.value;
        case "is not":
          return cellValue !== filterValue.value;
        case "contains":
          return filterValue.value.includes(cellValue);
        default:
          return true;
      }
    },
    meta: {
      filterType: "dropdown",
      allowedOptions: ["is", "is not", "contains"],
      icon: Loader
    }
  },
  {
    header: "Actions",
    cell: ActionCell,
  },
];

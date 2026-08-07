import ActivityPresentation from "@/components/reports/activity.presentation";
import ClientPresentation from "@/components/reports/client.presentation";
import Status from "@/components/status";
import { ReportPreview } from "@/interfaces/reports.interface";
import { ColumnDef } from "@tanstack/react-table";
import { BookOpen, BriefcaseBusiness, ComponentIcon, LoaderIcon, TagIcon, Users2 } from "lucide-react";

export const columns: ColumnDef<ReportPreview>[] = [
    {
        accessorKey: "client",
        cell: ClientPresentation,
        enableColumnFilter: false,
        meta: {
            icon: BriefcaseBusiness,
            valign: "top"
        }
    },
    {
        id: "status",
        accessorFn: (row) => row.status,
        accessorKey: "status",
        cell: ({ row }) => {
            const status: string = row.getValue("status");
            return (
                <Status status={status} className="rounded-full text-[0.6rem] h-5 px-1.5 w-fit" />
            );
        },
        enableGlobalFilter: false,
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
        meta: {
            // hidden: true,
            filterType: "dropdown",
            allowedOptions: ["is", "is not", "contains"],
            icon: LoaderIcon,
            isCentered: true,
        }
    },
    {
        id: "sales_unit",
        accessorFn: (row) => row.account_executives.map(ae => ae.su),
        accessorKey: "sales_unit",
        header: "SU",
        cell: ({ row }) => {
            const client = row.original;
            const salesUnits = [...new Set(client.account_executives.map(ae => ae.su))];

            return <div className="text-[0.65rem] leading-tight">
                {salesUnits.map(unit => {
                    return <p key={unit}>{unit}</p>
                })}
            </div>
        },
        enableGlobalFilter: false,
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<string>(columnId);

            switch (filterValue.condition) {
                case "is":
                    return cellValue.includes(filterValue.value);
                case "is not":
                    return !cellValue.includes(filterValue.value);
                case "contains":
                    return filterValue.value.some((val: string) => cellValue.includes(val));
                default:
                    return true;
            }
        },
        meta: {
            hidden: true,
            filterType: "dropdown",
            allowedOptions: ["is", "is not", "contains"],
            icon: ComponentIcon,
            isArray: true
        }
    },
    {
        id: "account_executive",
        accessorFn: (row) => row.account_executives.map(ae => ae.ae),
        accessorKey: "account_executive",
        header: undefined,
        cell: undefined,
        enableGlobalFilter: false,
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<string>(columnId);

            switch (filterValue.condition) {
                case "is":
                    return cellValue.includes(filterValue.value);
                case "is not":
                    return !cellValue.includes(filterValue.value);
                case "contains":
                    return filterValue.value.some((val: string) => cellValue.includes(val));
                default:
                    return true;
            }
        },
        meta: {
            hidden: true,
            filterType: "dropdown",
            allowedOptions: ["is", "is not", "contains"],
            icon: Users2,
            isArray: true
        }
    },

    {
        id: "tags",
        accessorFn: (row) => {
            if (Array.isArray(row.reports)) return [];
            const reportTags = Object.values(row.reports).map((reports) => {
                return reports.map(report => report.tags);
            })
            const tags = reportTags.flat().flat();
            return tags
        },
        header: undefined,
        cell: undefined,
        enableGlobalFilter: false,
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<string>(columnId);

            switch (filterValue.condition) {
                case "is":
                    return cellValue.includes(filterValue.value);
                case "is not":
                    return !cellValue.includes(filterValue.value);
                case "contains":
                    return filterValue.value.some((val: string) => cellValue.includes(val));
                default:
                    return true;
            }
        },
        meta: {
            hidden: true,
            isArray: true,
            filterType: "dropdown",
            allowedOptions: ["is", "is not", "contains"],
            icon: TagIcon,
        }
    },
    {
        accessorKey: "activity",
        header: "Activity",
        cell: ActivityPresentation,
        enableColumnFilter: false,
        meta: {
            icon: BookOpen
        }
    }
]
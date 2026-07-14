import ApprovalStatus, { getApprovalStatus } from "@/components/approval-status";
import { RequestTable } from "@/interfaces/requests.interface";
import { getCurrentApprovers } from "@/lib/utils";
import ApproverCell from "@/pages/conforme/approver";
import RequestorCell from "@/pages/conforme/requestor";
import { ColumnDef } from "@tanstack/react-table";
import { addHours, format, isSameDay } from "date-fns";
import { Building, Calendar, Loader, User2Icon } from "lucide-react";
import { Link } from "react-router-dom";

export const columns: ColumnDef<RequestTable>[] = [
    {
        accessorKey: "request_no",
        header: "Request #",
        cell: ({ row }) => {
            const requestNo = row.getValue<string>("request_no");
            return <div>
                <Link to={`./${requestNo}`} className="hover:underline text-sm font-semibold">#{requestNo}</Link>
            </div>
        },
        enableColumnFilter: false,
    },
    {
        accessorFn: (request) => `${request.client_name} | ${request.brand}`,
        id: "client",
        header: "Client",
        cell: ({ row }) => {
            return (
                <div className='text-xs'>
                    <p className='font-semibold truncate max-w-[175px]' title={row.original.client_name}>{row.original.client_name || "---"}</p>
                    <p className='text-[0.65rem]'>{row.original.brand}</p>
                </div>
            )
        },
        enableColumnFilter: false,
        meta: {
            icon: Building
        }
    },
    {
        accessorFn: (request) => request.user,
        accessorKey: "requestor",
        header: "Requestor",
        cell: ({ row }) => <RequestorCell request={row.original} />,
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
            filterType: "dropdown",
            allowedOptions: ["is", "is not", "contains"],
            icon: User2Icon
        }
    },
    {
        id: "status",
        accessorFn: getApprovalStatus,
        header: "Status",
        cell: ({ row }) => {
            return <ApprovalStatus status={row.original.status} className="uppercase" />
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
        accessorFn: (request) =>
            getCurrentApprovers(request).map(
                app => `${app.first_name} ${app.last_name}`
            ),
        accessorKey: "approver",
        header: "Approver Stage",
        cell: ({ row }) => <ApproverCell request={row.original} />,
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<string>(columnId);

            console.log(cellValue, filterValue)
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
            filterType: "dropdown",
            allowedOptions: ["is", "is not", "contains"],
            icon: User2Icon,
            isArray: true
        }
    },
    {
        accessorFn: (request) => new Date(request.created_at),
        accessorKey: "submitted_on",
        header: "Submitted On",
        cell: ({ row }) => {
            const date = row.getValue<Date>("submitted_on");
            return <p className="text-xs">{format(addHours(date,Number(import.meta.env.VITE_TIME_ADJUST) + 7), "yyyy-MM-dd HH:mm:ss")}</p>
        },
        filterFn: (row, columnId, filterValue) => {
            const cellValue = row.getValue<Date>(columnId)
            const filterDate = filterValue.value;

            switch (filterValue.condition) {
                case "is":
                    return isSameDay(cellValue, filterDate)
                case "between":
                    return cellValue >= filterDate.from && cellValue <= filterDate.to;
                default:
                    return true;
            }
        },
        meta: {
            filterType: "date_range",
            allowedOptions: ["is", "between"],
            icon: Calendar
        }
    }
]
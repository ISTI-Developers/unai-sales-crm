import { Site } from "@/interfaces/sites.interface";
import { CellContext } from "@tanstack/react-table";
import { Badge } from "../ui/badge";

const StatusCell = ({ row, column }: CellContext<Site, unknown>) => {
    const statusMap = {
        1: "Active",
        2: "Inactive",
        5: "Dismantled",
    }
    const status: number = row.getValue(column.id);

    const label = statusMap[status as keyof typeof statusMap];

    const className = {
        1: "bg-emerald-100 border-emerald-200 text-emerald-500",
        2: "bg-red-200 border-red-100 text-red-400",
        5: ""
    }

    return <Badge variant="outline" className={className[status as keyof typeof statusMap]}>
        {label}
    </Badge >
};

export default StatusCell;

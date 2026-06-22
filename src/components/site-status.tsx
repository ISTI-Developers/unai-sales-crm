import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

const SiteStatus = ({ status, className }: { status: string; className?: string }) => {
    const name = status.toLowerCase()
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
        inactive: "outline",
        dismantled: "destructive",
        "Under Construction": "secondary",
    };

    const statusClasses: { [key: string]: string } = {
        active: "bg-emerald-100 text-emerald-700 border-emerald-300",
        inactive: "bg-red-200 border-red-100 text-red-400",
        "under construction": "bg-sky-100 text-sky-600 border-sky-400",
    };


    return (
        <div>
            <Badge
                variant={statusMap[name]}
                className={cn(statusClasses[name], "uppercase", className)}
            >
                {status}
            </Badge>
        </div>
    );

}

export default SiteStatus
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

const Status = ({ status, className }: { status: string; className?: string }) => {
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
        hot: "outline",
        pool: "destructive",
        "on/off": "secondary",
    };

    const statusClasses: { [key: string]: string } = {
        active: "bg-green-100 text-green-700 border-green-300",
        hot: "bg-yellow-100 text-yellow-500 border-yellow-400",
        "on/off": "bg-sky-100 text-sky-600 border-sky-400",
    };


    return (
        <Badge
            variant={statusMap[name]}
            className={cn(statusClasses[name], "uppercase", className)}
        >
            {status}
        </Badge>
    );

}

export default Status
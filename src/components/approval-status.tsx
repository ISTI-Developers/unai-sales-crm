import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Request } from "@/interfaces/requests.interface";

const approvalStatus = {
    1: {
        value: 1,
        label: "Approved",
        className: "bg-emerald-100 text-emerald-500 border-emerald-400 hover:bg-emerald-100",
    },
    2: {
        value: 2,
        label: "Rejected",
        className: "bg-red-200 text-red-500 border-red-400 hover:bg-red-50",
    },
    3: {
        value: 3,
        label: "Pending",
        className: "bg-yellow-100 text-yellow-500 border-yellow-300 hover:bg-yellow-100"
    }
}
function ApprovalStatus({ status, className }: { status: number; className?: string; }) {
    const statusObj = Number(status) as keyof typeof approvalStatus;
    const statusDetails = approvalStatus[statusObj];
    return <Badge className={cn("w-fit h-6 rounded-full px-4", statusDetails.className, className)}>{statusDetails.label}</Badge>
}

export const getApprovalStatus = (request: Request) => {
    const statusObj = Number(request.status) as keyof typeof approvalStatus;
    const statusDetails = approvalStatus[statusObj];
    return statusDetails.label;
}

export default ApprovalStatus
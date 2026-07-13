import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Request } from "@/interfaces/requests.interface"
import { getCurrentApprovers } from "@/lib/utils";
import { useMemo } from "react";

function ApproverCell({ request }: { request: Request }) {
    const currentApprovers = useMemo(
        () => getCurrentApprovers(request),
        [request]
    );

    if(currentApprovers.length === 0){
        return <>---</>
    }
    return (
        <div>
            <AvatarGroup>
                {currentApprovers.map(approver => {
                    const fallback = `${approver.first_name[0]}${approver.last_name[0]}`;
                    return <Tooltip key={approver.ID}>
                        <TooltipTrigger asChild>
                            <Avatar className="size-8 font-semibold">
                                <AvatarFallback className="text-xs">
                                    {fallback}
                                </AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>{`${approver.first_name} ${approver.last_name}`}</TooltipContent>
                    </Tooltip>
                })}
            </AvatarGroup>
        </div>
    )
}

export default ApproverCell
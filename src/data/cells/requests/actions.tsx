import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRecallRequest } from "@/hooks/useRequests";
import { RequestTable } from "@/interfaces/requests.interface";
import { CellContext } from "@tanstack/react-table"
import { Undo2Icon } from "lucide-react";

function Actions({ row }: CellContext<RequestTable, unknown>) {
    const request = row.original;
    const { mutate: recallRequest, isPending } = useRecallRequest();
    return (
        <div>
            {request.status !== 1 &&
                <AlertDialog>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7 text-red-400 hover:text-red-400">
                                    <Undo2Icon />
                                </Button>
                            </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Recall</TooltipContent>
                    </Tooltip>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Recall Conforme Request</AlertDialogTitle>
                            <AlertDialogDescription> Are you sure you want to delete this request?
                                This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction disabled={isPending} className="bg-red-400 text-white" onClick={() => recallRequest(request.request_no)}>Proceed</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            }
        </div>
    )
}

export default Actions
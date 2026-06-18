import { useToast } from '@/hooks/use-toast';
import { useClientOptionList } from '@/hooks/useClientOptions';
import { useAccess, useUpdateClientStatus } from '@/hooks/useClients';
import { ClientInformation, ClientTable } from '@/interfaces/client.interface';
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { cn } from '@/lib/utils';
import { PenBox } from 'lucide-react';
import { Button } from './ui/button';
import Status from './status';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function StatusSelect({ data, className }: { data: ClientTable | ClientInformation; className?: string }) {
    const { mutate: updateClientStatus, isPending } = useUpdateClientStatus();
    const { client_id, name: client, status_name } = data;
    const { access: edit } = useAccess("clients.editStatus");

    const { toast } = useToast();

    const [isEditable, setEditable] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const name = (status_name as string).toLowerCase();
    const { options } = useClientOptionList("status");

    const onSubmit = async () => {
        if (!selectedStatus) return;

        const status = options.find(
            (option) => option.label.toLowerCase() === selectedStatus
        );
        if (status) {
            updateClientStatus(
                { status: status.id, ID: String(client_id) },
                {
                    onSuccess: (data) => {
                        if (data.acknowledged) {
                            toast({
                                description: "Status has been updated.",
                                variant: "success",
                            });
                            setEditable(false);
                            setSelectedStatus(null);
                        }
                    },
                    onError: (error) =>
                        toast({
                            description: `${typeof error === "object" && error !== null && "error" in error
                                ? (error as { error?: string }).error
                                : "Please contact the IT developer."
                                }`,
                            variant: "destructive",
                        }),
                }
            );
        }
    };
    return (
        options && (
            <>
                <Dialog
                    onOpenChange={(open) => {
                        if (!open) {
                            setEditable(false);
                            setSelectedStatus(null);
                        }
                    }}
                    open={isEditable}
                >
                    <DialogTrigger asChild>
                        <Button
                            onClick={(e) =>
                                edit ? setEditable(true) : e.preventDefault()
                            }
                            variant="ghost"
                            size={null}
                            tabIndex={-1}
                            className={cn(
                                "relative group select-none cursor-pointer flex gap-2 justify-start w-fit outline-none focus:outline-none focus-visible:ring-0",
                                !edit ? "pointer-events-none" : ""
                            )}
                        >
                            <Status status={status_name} className={className} />
                            {edit && (
                                <PenBox className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100" />
                            )}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Manage Status</DialogTitle>
                            <DialogDescription>
                                <p>
                                    Update the status of{" "}
                                    <span className="uppercase font-bold">{client as string}</span> by
                                    selecting from the list below.
                                </p>
                            </DialogDescription>
                        </DialogHeader>
                        <form className="flex items-center gap-2">
                            <Label htmlFor="status" className="whitespace-nowrap">
                                New Status
                            </Label>
                            <Select
                                value={selectedStatus ?? name}
                                onValueChange={(value) => {
                                    setSelectedStatus(value);
                                }}
                            >
                                <SelectTrigger className="max-w-[200px]">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.map((option) => {
                                        const label = option.label.toLowerCase();
                                        return (
                                            <SelectItem key={`status_${option.id}`} value={label}>
                                                <Status status={label} />
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </form>
                        <DialogFooter className="pt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setEditable(false);
                                    setSelectedStatus(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                disabled={
                                    selectedStatus === null ||
                                    selectedStatus === name ||
                                    isPending
                                }
                                onClick={onSubmit}
                                className="bg-main-100 hover:bg-main-400 text-white hover:text-white"
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        )
    );

}

export default StatusSelect
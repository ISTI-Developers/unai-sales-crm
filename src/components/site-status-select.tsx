import { useToast } from '@/hooks/use-toast';
import { useAccess } from '@/hooks/useClients';
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { cn } from '@/lib/utils';
import { PenBox } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Site } from '@/interfaces/sites.interface';
import SiteStatus from './site-status';
import { useManageSite } from '@/hooks/useSites';

function SiteStatusSelect({ data, className }: { data: Site; className?: string }) {
    const statusMap = {
        1: { id: 1, label: "active", action: "reactivate" },
        2: { id: 2, label: "inactive", action: "deactivate" },
        3: { id: 3, label: "Under Construction", action: "Under Construction" },
        5: { id: 5, label: "dismantled", action: "dismantle" },
    }

    const { mutate, isPending } = useManageSite();
    const { site_code, status } = data;
    const { access: edit } = useAccess("sites.edit");

    const { toast } = useToast();

    const [isEditable, setEditable] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const statusName = statusMap[status as keyof typeof statusMap]
    const onSubmit = async () => {
        if (!selectedStatus) return;
        const status = Object.values(statusMap).find(
            item => item.label === selectedStatus
        );
        if (status) {
            mutate(
                { site_code: site_code, action: status.action, newStatus: status.id },
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
                        <SiteStatus status={statusName.label} className={className} />
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
                                <span className="uppercase font-bold">{site_code}</span> by
                                selecting from the list below.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <form className="flex items-center gap-2">
                        <Label htmlFor="status" className="whitespace-nowrap">
                            New Status
                        </Label>
                        <Select
                            value={selectedStatus ?? statusName.label}
                            onValueChange={(value) => {
                                setSelectedStatus(value);
                            }}
                        >
                            <SelectTrigger className="max-w-[250px]">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(statusMap).map(([id, item]) => {
                                    return (
                                        <SelectItem key={`status_${id}`} value={item.label}>
                                            <SiteStatus status={item.label} />
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
                                selectedStatus === statusName.label ||
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
    );

}

export default SiteStatusSelect
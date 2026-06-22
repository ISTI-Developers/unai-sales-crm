import { ComboBox } from '@/components/combobox';
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAEClients, useTransferClient } from '@/hooks/useClients';
import { useUsers } from '@/hooks/useUsers'
import { List } from '@/interfaces';
import { useAuth } from '@/providers/auth.provider';
import { Loader2, UserRoundArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react';

function TransferClient() {
    const { user } = useAuth();
    const { data, isLoading } = useUsers();

    const [open, setOpen] = useState(false)
    const [selectedAE, setSelectedAE] = useState<List | undefined>()
    const [selectedClientGroup, setSelectedClientGroup] = useState<string[]>([])
    const [recipientAE, setRecipientAE] = useState<List | undefined>()

    const { data: clients } = useAEClients(selectedAE ? Number(selectedAE.id) : undefined);
    const { mutate, isPending } = useTransferClient();

    const accountExecutives = useMemo(() => {
        if (!user || !data || isLoading) return [];

        return data.filter(item => item.company?.ID === user.company?.ID && item.sales_unit).map(item => {
            return {
                id: item.ID,
                label: `${item.first_name} ${item.last_name}`,
                value: `${item.first_name} ${item.last_name}`,
            } as List
        });
    }, [user, data, isLoading]);

    const clientGroups = useMemo(() => {
        if (!clients) return {};

        return clients.reduce<Record<string, number>>((acc, item) => {
            acc[item.status_name] = (acc[item.status_name] ?? 0) + 1;

            return acc;
        }, {});
    }, [clients])


    const onTransfer = () => {
        if (!clients || !selectedAE || !recipientAE || selectedClientGroup.length === 0) return;
        const clientsToBeTransfered = clients.filter(client => selectedClientGroup.includes(client.status_name));

        mutate({
            clientIDs: clientsToBeTransfered.map(client => client.ID),
            from: selectedAE,
            to: recipientAE
        }, {
            onSuccess: () => {
                setSelectedAE(undefined);
                setSelectedClientGroup([]);
                setRecipientAE(undefined);
                // setOpen(false);
                toast({
                    description: `${clientsToBeTransfered.length} clients has been transferred to ${recipientAE.label}`,
                    variant: "success",
                });
            }
        })
    }
    return (
        <Dialog modal={false} open={open} onOpenChange={(open) => {
            if (!open) {
                setSelectedAE(undefined);
                setSelectedClientGroup([]);
                setRecipientAE(undefined);
                setOpen(false);
            }
            setOpen(open)
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-1.5 pl-2 h-7 text-xs"
                >
                    <UserRoundArrowLeft size={16} />
                    <span>Transfer Ownership</span>
                </Button>
            </DialogTrigger>
            {open &&
                <div className='fixed top-0 left-0 w-full h-full bg-[#00000050] z-[11] pointer-events-auto cursor-pointer' onClick={() => setOpen(false)} />
            }
            <DialogContent data-disabled={isPending} className='data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50'>
                <DialogHeader>
                    <DialogTitle>Transfer Client Ownership</DialogTitle>
                    <DialogDescription>Batch transfer clients from one <strong>Account Executive</strong> to another here.</DialogDescription>
                </DialogHeader>
                <div className='space-y-3 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50' data-disabled={isPending}>
                    <div className='space-y-2'>
                        <Label>Step 1: Choose Account Executive</Label>
                        <ComboBox list={accountExecutives} value={selectedAE?.label ?? ""} setValue={(id) => {
                            setSelectedAE(accountExecutives.find(ae => ae.id === id));
                            setSelectedClientGroup([])
                        }} title='account executive' />
                        {clients && <p className='text-sm text-zinc-600 italic'>{`${clients.length} clients found under ${selectedAE?.label}`}</p>}
                    </div>
                    <div data-disabled={!selectedAE} className='space-y-2 data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none'>
                        <Label>Step 2: Select the group of clients you wish to transfer</Label>
                        <div className='space-y-2'>
                            {Object.entries(clientGroups).map(([status, count]) => {
                                return <div key={status} className='flex gap-2 w-full items-center justify-start'>
                                    <Checkbox
                                        id={status}
                                        checked={selectedClientGroup.includes(status)}
                                        onCheckedChange={(checked) =>
                                            setSelectedClientGroup(prev => {
                                                if (checked) {
                                                    return prev.includes(status)
                                                        ? prev
                                                        : [...prev, status];
                                                }

                                                return prev.filter(s => s !== status);
                                            })
                                        }
                                    />
                                    <Label htmlFor={status} className='grid grid-cols-2 w-full'>
                                        <p>{status}</p>
                                        <p>{`${count} client/s`}</p>
                                    </Label>
                                </div>
                            })}
                        </div>
                    </div>
                    <div data-disabled={selectedClientGroup.length === 0} className='space-y-2 data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none'>
                        <Label>Step 3: Select the Recipient</Label>
                        <ComboBox list={accountExecutives.filter(ae => ae.id !== selectedAE?.id)} value={recipientAE?.label ?? ""} setValue={(id) => setRecipientAE(accountExecutives.find(ae => ae.id === id))} title='account executive' />
                    </div>
                </div>
                <DialogFooter className="pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setSelectedAE(undefined);
                            setSelectedClientGroup([]);
                            setRecipientAE(undefined);
                            setOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={
                            !selectedAE ||
                            selectedClientGroup.length === 0 ||
                            !recipientAE || isPending
                        }
                        onClick={onTransfer}
                        className="bg-main-100 hover:bg-main-400 text-white hover:text-white flex items-center gap-2"
                    >
                        {isPending &&
                            <Loader2 className='animate-spin' />
                        }
                        <span>
                            Transfer
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default TransferClient
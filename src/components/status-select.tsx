import { useToast } from '@/hooks/use-toast';
import { useClientOptionList } from '@/hooks/useClientOptions';
import { useAccess, useUpdateClientStatus, useUpdateClientTag } from '@/hooks/useClients';
import { ClientInformation, ClientTable } from '@/interfaces/client.interface';
import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { cn } from '@/lib/utils';
import { PenBox } from 'lucide-react';
import { Button } from './ui/button';
import Status from './status';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { TagsMapping } from '@/data/clients.keymap';

function StatusSelect({ data, className }: { data: ClientTable | ClientInformation; className?: string }) {
    const { mutate: updateClientStatus, isPending } = useUpdateClientStatus();
    const { mutate: updateClientTag } = useUpdateClientTag()
    const { client_id, name: client, status_name, tags } = data;
    const { access: edit } = useAccess("clients.editStatus");

    const { toast } = useToast();

    const [isEditable, setEditable] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);


    const [selectedTag, setSelectedTag] = useState<string>(tags ? TagsMapping[tags as keyof typeof TagsMapping].value : "")

    const name = (status_name as string).toLowerCase();
    const { options } = useClientOptionList("status");

    const onSubmit = async () => {
        const status = options.find(
            (option) => option.label.toLowerCase() === selectedStatus
        );
        const tagMapping = tags ? TagsMapping[tags as keyof typeof TagsMapping].value : undefined;
        const prevTag = Object.entries(TagsMapping).find(
            ([_, tag]) => tag.value === tagMapping
        )?.[0]
        const newTag = Object.entries(TagsMapping).find(
            ([_, tag]) => tag.value === selectedTag
        )?.[0]
        if (prevTag !== newTag) {
            updateClientTag({ ID: client_id, tag: newTag }, {
                onSuccess: (data) => {
                    if (data.acknowledged) {
                        toast({
                            description: "Client Tag has been updated.",
                            variant: "success",
                        });
                        setEditable(false);
                        setSelectedTag("");
                    }
                },
            })
        }
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
                            setSelectedTag(tags ? TagsMapping[tags as keyof typeof TagsMapping].value : "")
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
                            <DialogTitle>Manage Client Tagging</DialogTitle>
                            <DialogDescription>
                                <p>
                                    Update the status of{" "}
                                    <span className="uppercase font-bold">{client as string}</span> by
                                    selecting from the list below.
                                </p>
                            </DialogDescription>
                        </DialogHeader>
                        <form className="space-y-2">
                            <div>
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
                            </div>
                            <div className='space-y-2'>
                                <header className='flex items-center justify-between'>
                                    <p className="whitespace-nowrap font-semibold">
                                        Tag Client
                                    </p>
                                    {selectedTag && <Button type='button' size="sm" variant="destructive" className='h-6' onClick={() => setSelectedTag("")}>Remove Tag</Button>}
                                </header>
                                <RadioGroup
                                    value={selectedTag ?? ""}
                                    onValueChange={setSelectedTag}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    {Object.values(TagsMapping).map(tag => (
                                        <Label
                                            key={tag.value}
                                            htmlFor={tag.value}
                                            className={cn("border p-4 px-6 flex gap-2 items-start justify-between rounded-lg cursor-pointer",
                                                selectedTag === tag.value && "border-emerald-300 bg-emerald-100")}
                                        >
                                            <div className="flex flex-col h-full justify-between">
                                                <tag.icon size={25} className={tag.className} />
                                                <div>
                                                    <p className='pt-2'>{tag.label}</p>
                                                    <p className="text-xs font-normal text-zinc-500">{tag.description}</p>
                                                </div>
                                            </div>
                                            <RadioGroupItem value={tag.value} id={tag.value} />
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
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
                                    ((selectedStatus === null ||
                                        selectedStatus === name)
                                        && (selectedTag === (tags ? TagsMapping[tags as keyof typeof TagsMapping].value : ""))) || isPending
                                }
                                onClick={onSubmit}
                                className="bg-main-100 hover:bg-main-400 text-white hover:text-white"
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog >
            </>
        )
    );

}

export default StatusSelect
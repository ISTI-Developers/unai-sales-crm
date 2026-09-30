import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import SignatureInput from '@/components/ui/input-signature';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/useUsers';
import { Conforme, Signatory } from '@/interfaces/requests.interface';
import { User } from '@/interfaces/user.interface';
import { useAuth } from '@/providers/auth.provider';
import { SignatureIcon, Trash2Icon } from 'lucide-react';
import { Dispatch, SetStateAction, useMemo } from 'react';

interface TabProps {
    owner?: User;
    conforme: Conforme;
    setConforme: Dispatch<SetStateAction<Conforme>>;
}
type SignatoryType = 'internal_signatory' | 'external_signatory';
function AcknowledgementTab({ owner, conforme, setConforme }: TabProps) {
    const { user } = useAuth();
    const { data: users = [] } = useUsers();

    const options = useMemo(() => {
        return users
            .filter(
                item =>
                    item.sales_unit &&
                    item.company?.ID === user?.company?.ID &&
                    item.status !== 'inactive'
            )
            .map(item => ({
                ID: item.ID,
                name: `${item.first_name} ${item.last_name}`,
                code: `${item.first_name.charAt(0)}${item.last_name.charAt(0)}${item.last_name.charAt(0)}`,
                position: item.role.name,
                sales_unit: item.sales_unit?.unit_name,
            }));
    }, [user?.company?.ID, users]);

    const salesUnitHead = useMemo(() => {
        const salesUnit = user?.sales_unit?.sales_unit_id;
        return users.find(item => item.sales_unit?.sales_unit_id === salesUnit && item.role.name.toLowerCase().includes("sales unit head"))
    }, [users, user])

    const addSignatory = (type: SignatoryType, value?: Signatory) => {
        setConforme(prev => ({
            ...prev,
            [type]: [
                ...prev[type],
                value ?? {
                    name: '',
                    title: '',
                    signature: undefined,
                },
            ],
        }));
    };

    const updateSignatory = (
        type: SignatoryType,
        index: number,
        updates: Partial<Conforme[typeof type][number]>
    ) => {
        setConforme(prev => ({
            ...prev,
            [type]: prev[type].map((signatory, i) =>
                i === index
                    ? {
                        ...signatory,
                        ...updates,
                    }
                    : signatory
            ),
        }));
    };

    const removeSignatory = (
        type: SignatoryType,
        index: number
    ) => {
        setConforme(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index),
        }));
    };

    const handleNameChange = (
        type: SignatoryType,
        index: number,
        name: string
    ) => {
        const selectedUser = options.find(item => item.name === name);

        updateSignatory(type, index, {
            name,
            title: selectedUser?.position ?? '',
        });
    };

    return (
        <div className='flex flex-col gap-4'>
            <section className="rounded-lg border p-4 space-y-3">
                <header className="flex items-center justify-between pb-2">
                    <p className="text-sm font-semibold">
                        Internal Signatories
                    </p>

                    <div className='flex gap-4'>
                        {(salesUnitHead?.ID !== owner?.ID && !conforme.internal_signatory.some(signatory => signatory.name === `${salesUnitHead?.first_name} ${salesUnitHead?.last_name}`)) &&
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addSignatory("internal_signatory", {
                                    name: `${salesUnitHead?.first_name} ${salesUnitHead?.last_name}`,
                                    title: "Sales Unit Head",
                                    signature: undefined
                                })}
                            >
                                Add SU Head
                            </Button>}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSignatory("internal_signatory")}
                        >
                            Add Other Signatory
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-[repeat(3,1fr)_2rem] gap-3 text-xs font-medium">
                    <p>Name</p>
                    <p>Position/Title</p>
                    <p>Signature (Optional)</p>
                    <span />
                </div>

                {conforme.internal_signatory.map((signatory, index) => {
                    const isOwner =
                        signatory.name ===
                        `${owner?.first_name} ${owner?.last_name}`;

                    return (
                        <div
                            key={index}
                            className="grid grid-cols-[repeat(3,1fr)_2rem] gap-3 items-center"
                        >
                            <Select
                                value={signatory.name}
                                disabled={isOwner}
                                onValueChange={value =>
                                    handleNameChange("internal_signatory", index, value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select signatory" />
                                </SelectTrigger>

                                <SelectContent>
                                    {options.map(item => (
                                        <SelectItem
                                            disabled={conforme.internal_signatory.some(exItem => exItem.name === item.name)}
                                            key={item.ID}
                                            value={item.name}
                                        >
                                            {item.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                value={signatory.title}
                                onChange={event =>
                                    updateSignatory("internal_signatory", index, {
                                        title: event.target.value,
                                    })
                                }
                                placeholder="Position/Title"
                            />

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        {signatory.signature ? signatory.signature.name :
                                            <>
                                                <SignatureIcon />
                                                Add Signature
                                            </>}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Add Signature
                                        </DialogTitle>
                                        <DialogDescription>Draw your signature below or upload one.</DialogDescription>
                                    </DialogHeader>
                                    <SignatureInput
                                        value={signatory.signature}
                                        onChange={file =>
                                            updateSignatory('internal_signatory', index, {
                                                signature: file,
                                            })
                                        }
                                    />
                                    <DialogFooter className='mx-auto text-sm text-zinc-500'>
                                        Click outside to close
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                disabled={isOwner}
                                onClick={() => removeSignatory("internal_signatory", index)}
                            >
                                <Trash2Icon />
                            </Button>
                        </div>
                    );
                })}
                <div className="space-y-3">
                    <header className="text-xs font-medium">
                        Internal Signatory Options
                    </header>

                    <RadioGroup
                        value={conforme.internal_signatory_options?.layout ?? 'separated'}
                        onValueChange={value => {
                            setConforme(prev => ({
                                ...prev,
                                internal_signatory_options: {
                                    ...prev.internal_signatory_options,
                                    layout: value as 'combined' | 'separated',
                                },
                            }));
                        }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem
                                value="separated"
                                id="signatory-separated"
                            />

                            <Label
                                htmlFor="signatory-separated"
                                className="font-normal cursor-pointer"
                            >
                                Separate each signatory
                            </Label>
                        </div>
                        <div className="flex items-start gap-2">
                            <RadioGroupItem
                                value="combined"
                                id="signatory-combined"
                            />

                            <div className="space-y-2">
                                <Label
                                    htmlFor="signatory-combined"
                                    className="font-normal cursor-pointer"
                                >
                                    Combine signatories
                                </Label>

                                {conforme.internal_signatory_options?.layout === 'combined' && (
                                    <div className="ml-1 flex items-center gap-2">
                                        <Checkbox
                                            id="use-code-names"
                                            checked={
                                                conforme.internal_signatory_options.use_code_names
                                            }
                                            onCheckedChange={checked => {
                                                setConforme(prev => ({
                                                    ...prev,
                                                    internal_signatory_options: {
                                                        ...prev.internal_signatory_options,
                                                        use_code_names: checked === true,
                                                    },
                                                }));
                                            }}
                                        />

                                        <Label
                                            htmlFor="use-code-names"
                                            className="text-xs font-normal cursor-pointer"
                                        >
                                            Use code names
                                        </Label>
                                    </div>
                                )}
                            </div>
                        </div>
                    </RadioGroup>
                </div>
            </section>
            <section className="rounded-lg border p-4 space-y-3">
                <header className="flex items-center justify-between pb-2">
                    <p className="text-sm font-semibold">
                        External Signatories
                    </p>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSignatory("external_signatory")}
                    >
                        Add Signatory
                    </Button>
                </header>

                <div className="grid grid-cols-[repeat(2,1fr)_2rem] gap-3 text-xs font-medium">
                    <p>Name</p>
                    <p>Position/Title</p>
                    <span />
                </div>

                {conforme.external_signatory.map((signatory, index) => {
                    return (
                        <div
                            key={index}
                            className="grid grid-cols-[repeat(2,1fr)_2rem] gap-3 items-center"
                        >
                            <Input
                                value={signatory.name}
                                onChange={event =>
                                    updateSignatory("external_signatory", index, {
                                        name: event.target.value,
                                    })
                                }
                                placeholder="Name"
                            />


                            <Input
                                value={signatory.title}
                                onChange={event =>
                                    updateSignatory("external_signatory", index, {
                                        title: event.target.value,
                                    })
                                }
                                placeholder="Position/Title"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSignatory("external_signatory", index)}
                            >
                                <Trash2Icon />
                            </Button>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}

export default AcknowledgementTab;
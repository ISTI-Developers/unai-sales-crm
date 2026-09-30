import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { appliesToPayment, Conforme, PaymentMethod, paymentMethods, PaymentRule } from "@/interfaces/requests.interface";
import { ordinal } from "@/lib/utils";
import { Trash2Icon, XIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

interface PaymentTabProps {
    conforme: Conforme;
    setConforme: Dispatch<SetStateAction<Conforme>>
}
function PaymentTab({ conforme, setConforme }: PaymentTabProps) {
    const paymentTerms = conforme.terms;

    return (
        <div className="space-y-4">
            <div className="border p-4 rounded-lg">
                <Label className="whitespace-nowrap">Billing Date:</Label>
                <div className="flex flex-wrap leading-tight gap-2 items-center">
                    <span>Every</span>
                    <Select value={String(paymentTerms.monthly_payment.startDate)}
                        onValueChange={(value) => {
                            const date = Number(value);
                            setConforme(prev => {
                                return {
                                    ...prev,
                                    terms: {
                                        ...prev.terms,
                                        monthly_payment: {
                                            ...prev.terms.monthly_payment,
                                            startDate: date
                                        }
                                    }
                                }
                            })
                        }}>
                        <SelectTrigger className="w-fit h-7">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array(31).fill(0).map((_, index) => {
                                return <SelectItem key={(index + 1)} value={`${index + 1}`}>
                                    {ordinal(index + 1)}
                                </SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                    <span>day of the month upon installation/commencement of the billboard. </span>
                    <span>Payments must be made with </span>
                    <Select value={String(paymentTerms.monthly_payment.payment_method)}
                        onValueChange={(value) => {
                            setConforme(prev => {
                                return {
                                    ...prev,
                                    terms: {
                                        ...prev.terms,
                                        monthly_payment: {
                                            ...prev.terms.monthly_payment,
                                            payment_method: value as PaymentMethod
                                        }
                                    }
                                }
                            })
                        }}>
                        <SelectTrigger className="w-fit h-7">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(paymentMethods).map(([code, value]) => {
                                return <SelectItem key={code} value={code}>
                                    {value}
                                </SelectItem>
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-4">
                <div className="flex gap-4 items-center">
                    <Label>Rate Terms</Label>
                    <AddMonthPopover onSubmit={(months) => setConforme((prev) => {
                        if (Object.keys(prev.terms.contract_terms).includes(String(months))) {
                            toast({
                                variant: "warning",
                                description: "Selected month is already present."
                            })
                            return prev;
                        }
                        return {
                            ...prev,
                            terms: {
                                ...prev.terms,
                                contract_terms: {
                                    ...prev.terms.contract_terms,
                                    [months]: [],
                                },
                            },
                        }
                    })} />
                </div>
                {Object.entries(paymentTerms.contract_terms).map(([duration, terms]) => {
                    const durationNumber = Number(duration);
                    const hasAdvance = terms.some((term) => term.type === "ADVANCE");
                    const hasDeposit = terms.some((term) => term.type === "DEPOSIT");
                    return (
                        <div
                            key={duration}
                            className="space-y-2 rounded-lg border p-4 relative group/container"
                        >
                            <Label className="whitespace-nowrap">
                                {duration}-month Contract:
                            </Label>
                            <div className="flex flex-col gap-2">
                                {terms.map((term, index) => (
                                    <ContractTermEditor
                                        key={`${duration}-${index}`}
                                        term={term}
                                        onRemove={() => {
                                            setConforme((prev) => ({
                                                ...prev,
                                                terms: {
                                                    ...prev.terms,
                                                    contract_terms: {
                                                        ...prev.terms.contract_terms,
                                                        [duration]: prev.terms.contract_terms[
                                                            Number(duration)
                                                        ].filter((_, currentIndex) =>
                                                            currentIndex !== index
                                                        ),
                                                    },
                                                },
                                            }));
                                        }}
                                        onChange={(updatedTerm) => {
                                            setConforme((prev) => ({
                                                ...prev,
                                                terms: {
                                                    ...prev.terms,
                                                    contract_terms: {
                                                        ...prev.terms.contract_terms,
                                                        [duration]: prev.terms.contract_terms[
                                                            Number(duration)
                                                        ].map((currentTerm, currentIndex) =>
                                                            currentIndex === index
                                                                ? updatedTerm
                                                                : currentTerm
                                                        ),
                                                    },
                                                },
                                            }));
                                        }}
                                    />
                                ))}
                                {!hasAdvance && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-fit"
                                        onClick={() => {
                                            setConforme((prev) => ({
                                                ...prev,
                                                terms: {
                                                    ...prev.terms,
                                                    contract_terms: {
                                                        ...prev.terms.contract_terms,
                                                        [durationNumber]: [
                                                            ...prev.terms.contract_terms[
                                                            durationNumber
                                                            ],
                                                            {
                                                                type: "ADVANCE",
                                                                applies_to: "START",
                                                                months: 1,
                                                            },
                                                        ],
                                                    },
                                                },
                                            }));
                                        }}
                                    >
                                        Add Advance
                                    </Button>
                                )}
                                {!hasDeposit && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-fit"
                                        onClick={() => {
                                            setConforme((prev) => ({
                                                ...prev,
                                                terms: {
                                                    ...prev.terms,
                                                    contract_terms: {
                                                        ...prev.terms.contract_terms,
                                                        [durationNumber]: [
                                                            ...prev.terms.contract_terms[
                                                            durationNumber
                                                            ],
                                                            {
                                                                type: "DEPOSIT",
                                                                applies_to: "END",
                                                                months: 1,
                                                            },
                                                        ],
                                                    },
                                                },
                                            }));
                                        }}
                                    >
                                        Add Deposit
                                    </Button>
                                )}
                            </div>
                            <Button onClick={() => {
                                setConforme((prev) => {
                                    const {
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        [durationNumber]: _,
                                        ...remainingTerms
                                    } = prev.terms.contract_terms;

                                    return {
                                        ...prev,
                                        terms: {
                                            ...prev.terms,
                                            contract_terms: remainingTerms,
                                        },
                                    };
                                });
                            }} variant="destructive" size="sm" className="opacity-0 group-hover/container:opacity-100 size-7 absolute right-1 -top-1">
                                <Trash2Icon />
                            </Button>
                        </div>
                    );
                })}
            </div>

        </div>
    )
}
interface AddMonthPopoverProps {
    onSubmit: (months: number) => void;
}
function AddMonthPopover({ onSubmit }: AddMonthPopoverProps) {
    const [months, setMonths] = useState(1)
    return <Popover>
        <PopoverTrigger asChild>
            <Button type="button" size="sm" variant="outline" >
                Add Rate Term
            </Button>
        </PopoverTrigger>
        <PopoverContent className="space-y-4">
            <Label>Months</Label>
            <Input type="number" value={Math.max(months, 0)} onChange={(e) => setMonths(e.target.valueAsNumber)} />
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onSubmit(months)}
            >
                Add
            </Button>
        </PopoverContent>
    </Popover>
}

function ContractTermEditor({
    term,
    onChange,
    onRemove
}: {
    term: PaymentRule;
    onChange: (term: PaymentRule) => void;
    onRemove: () => void;
}) {
    if (term.type === "ADVANCE") {
        return (
            <div className="relative group flex flex-wrap items-center gap-2 leading-tight">
                <Input
                    type="number"
                    min={1}
                    value={term.months}
                    onChange={(e) =>
                        onChange({
                            ...term,
                            months: Number(e.target.value),
                        })
                    }
                    className="h-7 w-[55px]"
                />

                <span>
                    month{term.months > 1 ? "s" : ""} advance payment applicable to the
                </span>
                <Select value={term.applies_to} onValueChange={(value) =>
                    onChange({
                        ...term,
                        applies_to: value as typeof term.applies_to,
                    })
                }>
                    <SelectTrigger className="w-fit h-7">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(appliesToPayment).map(([key, value]) => {
                            return <SelectItem key={key} value={key}>
                                {value.toLowerCase()}
                            </SelectItem>
                        })}
                    </SelectContent>
                </Select>
                <span>{term.months !== 1 ? term.months : ""} month{term.months > 1 ? "s" : ""}  of the contract.</span>
                <Button onClick={onRemove} variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 size-7 absolute right-0 top-0">
                    <XIcon />
                </Button>
            </div>
        );
    }

    if (term.type === "DEPOSIT") {
        return (
            <div className="relative group flex flex-wrap items-center gap-2 leading-tight">
                <Input
                    type="number"
                    min={1}
                    value={term.months}
                    onChange={(e) =>
                        onChange({
                            ...term,
                            months: Number(e.target.value),
                        })
                    }
                    className="h-7 w-[55px]"
                />

                <span>month deposit applicable to the</span>
                <Select value={term.applies_to} onValueChange={(value) =>
                    onChange({
                        ...term,
                        applies_to: value as typeof term.applies_to,
                    })
                }>
                    <SelectTrigger className="w-fit h-7">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(appliesToPayment).map(([key, value]) => {
                            return <SelectItem key={key} value={key}>
                                {value.toLowerCase()}
                            </SelectItem>
                        })}
                    </SelectContent>
                </Select>
                <span>month of the contract.</span>
                <Button onClick={onRemove} variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 size-7 absolute right-0 top-0">
                    <XIcon />
                </Button>
            </div>
        );
    }

    return null;
}

export default PaymentTab
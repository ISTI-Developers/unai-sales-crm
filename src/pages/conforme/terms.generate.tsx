import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"
import InputNumber from "@/components/ui/number-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Conforme } from "@/interfaces/requests.interface";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";

interface TermsTabProps {
    conforme: Conforme;
    setConforme: Dispatch<SetStateAction<Conforme>>
}
function TermsTab({ conforme, setConforme }: TermsTabProps) {
    const otherTerms = conforme.terms.other_terms;
    const { installation_and_dismantling, material_printing } = conforme.production;

    return (
        <div className="space-y-4">
            <header className="flex items-center gap-4">
                <Label>Other Terms</Label>
            </header>
            {otherTerms.map((term, index) => {
                const [before, after] = term.content.split("[value]");
                return !term.fixed && <div key={index} className="relative group border p-4 rounded-lg flex items-center gap-2 ">
                    <Checkbox checked={term.use} onCheckedChange={(checked) => setConforme(prev => {
                        return {
                            ...prev,
                            terms: {
                                ...prev.terms,
                                other_terms: prev.terms.other_terms.map((item, i) => {
                                    return i === index ? {
                                        ...item,
                                        use: !!checked
                                    } : item
                                })
                            }
                        }
                    })} />
                    <div>
                        <div className={cn("flex flex-wrap items-center gap-2", term.isBold ? "font-semibold" : "", term.isItalic ? "italic" : "")}>
                            {term.label && <span className={cn(term.isBold ? "" : "font-semibold")}>{term.label}: </span>}
                            {term.value !== undefined ? (
                                <>
                                    {before}
                                    <InputNumber
                                        value={term.value}
                                        onChange={(e) => {
                                            setConforme(prev => ({
                                                ...prev,
                                                terms: {
                                                    ...prev.terms,
                                                    other_terms: prev.terms.other_terms.map((item, i) =>
                                                        i === index
                                                            ? {
                                                                ...item,
                                                                value: Number(e.target.value)
                                                            }
                                                            : item
                                                    )
                                                }
                                            }));
                                        }}
                                        groupClassName="w-[100px]"
                                    />
                                    {after}
                                </>
                            ) : (
                                term.content
                            )}
                        </div>
                        {/* <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="size-7 absolute top-1 right-1 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 />
                        </Button> */}
                    </div>
                </div>
            })}
            <div className="relative group border p-4 rounded-lg flex flex-col gap-3">
                <p className="font-semibold">Additional Installation and Dismantling</p>
                <RadioGroup
                    value={installation_and_dismantling.internal ? "internal" : "custom"}
                    onValueChange={(value) => {
                        setConforme(prev => ({
                            ...prev,
                            production: {
                                ...prev.production,
                                installation_and_dismantling: {
                                    ...prev.production.installation_and_dismantling,
                                    internal: value === "internal",
                                    value: 20000
                                }
                            }
                        }))
                    }}
                    className="flex flex-col gap-3"
                >
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="internal" id="installation-internal" />
                        <Label htmlFor="installation-internal">Use internal rate</Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="custom" id="installation-custom" />
                        <Label htmlFor="installation-custom">Use custom rate</Label>

                        {!installation_and_dismantling.internal && (
                            <InputNumber
                                value={installation_and_dismantling.value}
                                groupClassName="max-w-[125px]"
                                onChange={(e) => {
                                    setConforme(prev => ({
                                        ...prev,
                                        production: {
                                            ...prev.production,
                                            installation_and_dismantling: {
                                                ...prev.production.installation_and_dismantling,
                                                value: Number(e.target.value)
                                            }
                                        }
                                    }))
                                }}
                            />
                        )}
                    </div>
                </RadioGroup>
            </div>
            <div className="relative group border p-4 rounded-lg flex flex-col gap-4">
                <p className="font-semibold">Material Printing</p>

                {/* Internal / Custom rate */}
                <RadioGroup
                    value={material_printing.internal ? "internal" : "custom"}
                    onValueChange={(value) => {
                        setConforme((prev) => {
                            const current = prev.production.material_printing;

                            if (value === "internal") {
                                return {
                                    ...prev,
                                    production: {
                                        ...prev.production,
                                        material_printing: {
                                            internal: true,
                                            format: current.format,
                                        },
                                    },
                                };
                            }

                            return {
                                ...prev,
                                production: {
                                    ...prev.production,
                                    material_printing:
                                        current.format === "fixed"
                                            ? {
                                                internal: false,
                                                format: "fixed",
                                                value:
                                                    typeof current.value === "number"
                                                        ? current.value
                                                        : 0,
                                            }
                                            : {
                                                internal: false,
                                                format: "regional",
                                                value:
                                                    current.value && typeof current.value !== "number"
                                                        ? current.value
                                                        : {
                                                            metro_manila: 23,
                                                            provincial: 25,
                                                        },
                                            },
                                },
                            };
                        });
                    }}
                    className="flex flex-col gap-3"
                >
                    <div className="flex items-center gap-2">
                        <RadioGroupItem
                            value="internal"
                            id="material-internal"
                        />
                        <Label htmlFor="material-internal">
                            Use internal cost
                        </Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <RadioGroupItem
                            value="custom"
                            id="material-custom"
                        />
                        <Label htmlFor="material-custom">
                            Use custom rate
                        </Label>
                    </div>
                </RadioGroup>
                {/* Format toggle */}
                <div className="flex flex-col gap-2">
                    <Label>Rate format</Label>

                    <RadioGroup
                        value={material_printing.format}
                        onValueChange={(value) => {
                            const format = value as "fixed" | "regional";

                            setConforme((prev) => {
                                const current = prev.production.material_printing;
                                const currentValue = current.value;

                                if (current.internal) {
                                    return {
                                        ...prev,
                                        production: {
                                            ...prev.production,
                                            material_printing: {
                                                internal: true,
                                                format,
                                            },
                                        },
                                    };
                                }

                                if (format === "fixed") {
                                    return {
                                        ...prev,
                                        production: {
                                            ...prev.production,
                                            material_printing: {
                                                internal: false,
                                                format: "fixed",
                                                value:
                                                    typeof currentValue === "number"
                                                        ? currentValue
                                                        : 0,
                                            },
                                        },
                                    };
                                }

                                return {
                                    ...prev,
                                    production: {
                                        ...prev.production,
                                        material_printing: {
                                            internal: false,
                                            format: "regional",
                                            value:
                                                currentValue &&
                                                    typeof currentValue !== "number"
                                                    ? currentValue
                                                    : {
                                                        metro_manila: 23,
                                                        provincial: 25,
                                                    },
                                        },
                                    },
                                };
                            });
                        }}
                        className="flex items-center gap-4"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="fixed" id="material-fixed" />
                            <Label htmlFor="material-fixed">Fixed rate for all</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="regional" id="material-regional" />
                            <Label htmlFor="material-regional">Regional rates</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Custom rate inputs */}
                {!material_printing.internal && (
                    <div className="flex flex-col gap-3">
                        {material_printing.format === "fixed" ? (
                            <div className="flex items-center gap-2">
                                <Label htmlFor="material-fixed-rate" className="whitespace-nowrap">
                                    Rate per sq. ft.
                                </Label>

                                <InputNumber
                                groupClassName="max-w-[125px]"
                                    value={
                                        typeof material_printing.value === "number"
                                            ? material_printing.value
                                            : 0
                                    }
                                    onChange={(e) => {
                                        setConforme((prev) => ({
                                            ...prev,
                                            production: {
                                                ...prev.production,
                                                material_printing: {
                                                    internal: false,
                                                    format: "fixed",
                                                    value: Number(e.target.value),
                                                },
                                            },
                                        }));
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                <div className="grid grid-cols-2 gap-2 items-center">
                                    <Label htmlFor="material-metro-manila" className="whitespace-nowrap">
                                        Metro Manila
                                    </Label>

                                    <InputNumber
                                        value={
                                            material_printing.value &&
                                                typeof material_printing.value !== "number"
                                                ? material_printing.value.metro_manila
                                                : 23
                                        }
                                        onChange={(e) => {
                                            setConforme((prev) => {
                                                const current =
                                                    prev.production.material_printing.value;

                                                return {
                                                    ...prev,
                                                    production: {
                                                        ...prev.production,
                                                        material_printing: {
                                                            internal: false,
                                                            format: "regional",
                                                            value: {
                                                                metro_manila: Number(e.target.value),
                                                                provincial:
                                                                    current &&
                                                                        typeof current !== "number"
                                                                        ? current.provincial
                                                                        : 25,
                                                            },
                                                        },
                                                    },
                                                };
                                            });
                                        }}
                                    />
                                </div>

                                 <div className="grid grid-cols-2 gap-2 items-center">
                                    <Label htmlFor="material-provincial">
                                        Provincial / NLEX / SLEX
                                    </Label>

                                    <InputNumber
                                        value={
                                            material_printing.value &&
                                                typeof material_printing.value !== "number"
                                                ? material_printing.value.provincial
                                                : 27
                                        }
                                        onChange={(e) => {
                                            setConforme((prev) => {
                                                const current =
                                                    prev.production.material_printing.value;

                                                return {
                                                    ...prev,
                                                    production: {
                                                        ...prev.production,
                                                        material_printing: {
                                                            internal: false,
                                                            format: "regional",
                                                            value: {
                                                                metro_manila:
                                                                    current &&
                                                                        typeof current !== "number"
                                                                        ? current.metro_manila
                                                                        : 23,
                                                                provincial: Number(e.target.value),
                                                            },
                                                        },
                                                    },
                                                };
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    )
}

export default TermsTab
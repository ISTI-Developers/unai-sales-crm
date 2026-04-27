import { useDeck } from "@/providers/deck.provider";
// import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import InputNumber from "../ui/number-input";
import { cn } from "@/lib/utils";
import { InclusionGenerator } from "@/misc/deckTemplate";
import { Switch } from "../ui/switch";

const DisplayOption = () => {
    const { selectedOptions, setOptions } = useDeck();

    if (!selectedOptions.display_options) return;

    const hasRateGenerator = !!selectedOptions.rate_generator;
    const displayOptions = selectedOptions.display_options;
    const productionCost = displayOptions.production_cost;
    return (<>
        <div className={cn("flex flex-col justify-between w-full gap-2")}>
            <MaterialCost materialCost={displayOptions.material_inclusions} isSingle={!hasRateGenerator} />
            {productionCost &&
                <div className="space-y-2">
                    <Label className="text-xs">Material Cost<br /><span className="text-[0.65rem]">(used if Free Material is ticked off)</span></Label>
                    {Object.entries(productionCost).map(([region, value]) => {
                        return <div key={region} className="grid grid-cols-2 items-center">
                            <Label className="capitalize text-xs">{region}</Label>
                            <InputNumber value={value} onChange={(e) => {
                                const value = Number(e.target.value);
                                setOptions(prev => {
                                    if (!prev) return prev;

                                    const updatedProdCost = prev.display_options!.production_cost!;



                                    return {
                                        ...prev,
                                        display_options: {
                                            ...prev.display_options,
                                            production_cost: { ...updatedProdCost, [region]: value }
                                        },
                                    };
                                });
                            }} />
                        </div>
                    })}
                </div>
            }
            <div className="flex flex-col w-full ">
                <Label className="text-xs font-bold" htmlFor="installation">Installation Inclusions</Label>
                <div className="flex flex-col gap-1 justify-between items-center w-full">
                    {displayOptions.installation_inclusions?.map((rate, index) => {
                        return <div key={rate.duration} className="grid grid-cols-2 items-center">
                            <Label className="text-[0.65rem] uppercase" htmlFor={`${rate.duration}_rate`}>{!hasRateGenerator ? "Free #" : `${rate.duration} months`}</Label>
                            <InputNumber id={`${rate.duration}_rate`} min={0} value={rate.count} isMoney={false} className='h-7 border-none shadow-none bg-white' onChange={(e) => {
                                const value = Number(e.target.value);
                                setOptions(prev => {
                                    if (!prev) return prev;

                                    const updatedInclusions = [...prev.display_options!.installation_inclusions!];

                                    if (updatedInclusions[index].type === "FREE") {
                                        updatedInclusions[index] = {
                                            ...updatedInclusions[index],
                                            count: value,
                                        };
                                    }

                                    return {
                                        ...prev,
                                        display_options: {
                                            ...prev.display_options,
                                            installation_inclusions: updatedInclusions,
                                        },
                                    };
                                });
                            }} />
                        </div>
                    })}
                </div>

            </div>
        </div>

        {/* <LandmarkOption checked={displayOptions?.landmark_visibility ?? false} onCheckedChange={(checked) => setOptions(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                display_options: {
                    ...prev.display_options,
                    landmark_visibility: checked
                }
            };
        })} /> */}
    </>)
}


const MaterialCost = ({ materialCost, isSingle }: { materialCost?: InclusionGenerator[]; isSingle: boolean }) => {
    const { setOptions } = useDeck();

    if (!materialCost || materialCost.length === 0) return;

    console.log(materialCost);
    return <div className="flex flex-col justify-between py-1">
        <Label className="text-xs font-bold" htmlFor="material">Material Inclusions</Label>
        {isSingle ?
            <div className="space-y-2">
                <header className="flex justify-between items-center">
                    <Label className="text-xs" htmlFor="material">{materialCost[0].type === "FREE" ? "Material #" : ""}</Label>
                    <div className="flex items-center gap-1">
                        <Label htmlFor="singleSwitch" className="text-xs">Free Material?</Label>
                        <Switch id="singleSwitch" checked={materialCost[0].type === "FREE"} onCheckedChange={() => {
                            setOptions(prev => {
                                if (!prev) return prev;

                                const updatedMaterials = [...prev.display_options!.material_inclusions!];

                                if (updatedMaterials[0].type === "FREE") {
                                    updatedMaterials[0] = {
                                        ...updatedMaterials[0],
                                        type: "PAID",
                                    };
                                    
                                } else {
                                    updatedMaterials[0] = {
                                        ...updatedMaterials[0],
                                        type: "FREE",
                                        count: 1
                                    };
                                }

                                return {
                                    ...prev,
                                    display_options: {
                                        ...prev.display_options,
                                        material_inclusions: updatedMaterials,
                                    },
                                };
                            });
                        }} />
                    </div>
                </header>
                {materialCost[0].type === "FREE" &&
                    <InputNumber id="material" min={0} value={materialCost[0].count} isMoney={false} className='h-7 border-none shadow-none bg-white' onChange={(e) => {
                        const value = Number(e.target.value);

                        setOptions(prev => {
                            if (!prev) return prev;

                            const updatedMaterials = [...prev.display_options!.material_inclusions!];

                            if (updatedMaterials[0].type === "FREE") {
                                updatedMaterials[0] = {
                                    ...updatedMaterials[0],
                                    count: value,
                                };
                            }

                            return {
                                ...prev,
                                display_options: {
                                    ...prev.display_options,
                                    material_inclusions: updatedMaterials,
                                },
                            };
                        });
                    }} />


                }

            </div> :
            <div className="space-y-2">
                {materialCost.map((month, index) => {
                    return <div className="space-y-2">
                        <header className="flex items-center gap-1 justify-between">
                            {month.type === "PAID" &&
                                <Label className="text-[0.65rem]" htmlFor={`m-${month.duration}_${index}`}>{`${month.duration} MONTHS`}</Label>
                            }
                            <Label htmlFor="singleSwitch" className="text-xs ml-auto">Free Material?</Label>
                            <Switch id="singleSwitch" checked={month.type === "FREE"} onCheckedChange={() => {
                                setOptions(prev => {
                                    if (!prev) return prev;

                                    const updatedMaterials = [...prev.display_options!.material_inclusions!];

                                    if (updatedMaterials[index].type === "FREE") {
                                        updatedMaterials[index] = {
                                            ...updatedMaterials[index],
                                            type: "PAID",
                                        };
                                    } else {
                                        updatedMaterials[index] = {
                                            ...updatedMaterials[index],
                                            type: "FREE",
                                            count: 1
                                        };
                                    }

                                    return {
                                        ...prev,
                                        display_options: {
                                            ...prev.display_options,
                                            material_inclusions: updatedMaterials,
                                        },
                                    };
                                });
                            }} />

                        </header>
                        <div className={cn("grid items-center gap-4", month.type === "FREE" ? "grid-cols-2" : "")}>
                            {month.type === "FREE" &&
                                <>
                                    <Label className="text-[0.65rem]" htmlFor={`m-${month.duration}_${index}`}>{`${month.duration} MONTHS`}</Label>
                                    <InputNumber id={`m-${month.duration}_${index}`} min={0} value={month.count} isMoney={false} className='h-7 border-none shadow-none bg-white' onChange={(e) => {
                                        const value = Number(e.target.value);

                                        setOptions(prev => {
                                            if (!prev) return prev;

                                            const updatedMaterials = [...prev.display_options!.material_inclusions!];

                                            if (updatedMaterials[index].type === "FREE") {
                                                updatedMaterials[index] = {
                                                    ...updatedMaterials[index],
                                                    count: value,
                                                };
                                            }

                                            return {
                                                ...prev,
                                                display_options: {
                                                    ...prev.display_options,
                                                    material_inclusions: updatedMaterials,
                                                },
                                            };
                                        });
                                    }} />
                                </>
                            }
                        </div>

                    </div>
                })}
            </div>}
        {/* <div className="flex gap-1 items-center">
            <Checkbox id="free-material" checked={freeMaterial} onCheckedChange={(check) => setFreeMaterial(!!check)} />
            <Label htmlFor="free-material">Free</Label>
        </div> */}
    </div>
}

// const LandmarkOption = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => {
//     return <div className="flex items-center justify-between gap-2">
//         <Label htmlFor="show" className="text-xs">Show Landmarks on map</Label>
//         <Checkbox
//             id="show"
//             checked={checked}
//             onCheckedChange={onCheckedChange}
//             className="bg-white border-none"
//         />
//     </div>
// }

export default DisplayOption
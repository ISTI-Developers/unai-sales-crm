import { useDeck } from "@/providers/deck.provider";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import InputNumber from "../ui/number-input";
import { cn } from "@/lib/utils";


const DisplayOption = () => {
    const { selectedOptions, setOptions } = useDeck();

    if (!selectedOptions.display_options) return;

    const hasRateGenerator = selectedOptions.rate_generator;
    const displayOptions = selectedOptions.display_options;
    return (<>
        <div className={cn("flex items-center justify-between w-full", hasRateGenerator ? "flex-col items-start" : "flex-row")}>
            <Label className="text-xs" htmlFor="material">FREE Material</Label>
            {!hasRateGenerator && typeof displayOptions.material_inclusions === "number" ?
                <InputNumber id="material" min={0} value={displayOptions.material_inclusions} className='h-7 border-none shadow-none text-end bg-white max-w-[100px]' onChange={(e) => setOptions(prev => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        display_options: {
                            ...prev.display_options,
                            material_inclusions: Number(e.target.value)
                        }
                    };
                })} />
                : <div className="flex flex-col gap-1 justify-between items-center w-full">
                    {Array.isArray(displayOptions.material_inclusions) && displayOptions.material_inclusions.map(rate => {
                        return <div key={rate.duration} className="flex items-center justify-between w-full">
                            <Label className="text-[0.6rem] font-semibold uppercase indent-4" htmlFor="material">{`${rate.duration} months`}</Label>
                            <InputNumber id="material" min={0} value={rate.count} className='h-7 border-none shadow-none text-end bg-white max-w-[100px]' onChange={(e) => setOptions(prev => {
                                if (!prev) return prev;

                                return {
                                    ...prev,
                                    display_options: {
                                        ...prev.display_options,
                                        material_inclusions: prev.display_options?.material_inclusions?.map(adj =>
                                            adj.duration === rate.duration
                                                ? { ...adj, count: Number(e.target.value) } // update only one key
                                                : adj
                                        )
                                    }
                                };
                            })} />
                        </div>
                    })}
                </div>
            }
        </div>
        <div className={cn("flex items-center justify-between w-full", hasRateGenerator ? "flex-col items-start" : "flex-row")}>
            <Label className="text-xs" htmlFor="installation">FREE Installation</Label>
            {!hasRateGenerator && typeof displayOptions.installation_inclusions === "number" ?
                <InputNumber id="installation" min={0} value={displayOptions.installation_inclusions} className='h-7 border-none shadow-none text-end bg-white max-w-[100px]' onChange={(e) => setOptions(prev => {
                    if (!prev) return prev;

                    return {
                        ...prev,
                        display_options: {
                            ...prev.display_options,
                            installation_inclusions: Number(e.target.value)
                        }
                    };
                })} />
                : <div className="flex flex-col gap-1 justify-between items-center w-full">
                    {Array.isArray(displayOptions.installation_inclusions) && displayOptions.installation_inclusions.map(rate => {
                        return <div key={rate.duration} className="flex items-center justify-between w-full">
                            <Label className="text-[0.6rem] font-semibold uppercase indent-4" htmlFor="material">{`${rate.duration} months`}</Label>
                            <InputNumber id="material" min={0} value={rate.count} className='h-7 border-none shadow-none text-end bg-white max-w-[100px]' onChange={(e) => setOptions(prev => {
                                if (!prev) return prev;

                                return {
                                    ...prev,
                                    display_options: {
                                        ...prev.display_options,
                                        installation_inclusions: prev.display_options?.installation_inclusions?.map(adj =>
                                            adj.duration === rate.duration
                                                ? { ...adj, count: Number(e.target.value) } // update only one key
                                                : adj
                                        )
                                    }
                                };
                            })} />
                        </div>
                    })}
                </div>
            }
        </div>
        <LandmarkOption checked={displayOptions?.landmark_visibility ?? false} onCheckedChange={(checked) => setOptions(prev => {
            if (!prev) return prev;

            return {
                ...prev,
                display_options: {
                    ...prev.display_options,
                    landmark_visibility: checked
                }
            };
        })} />
    </>)
}
const LandmarkOption = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => {
    return <div className="flex items-center justify-between gap-2">
        <Label htmlFor="show" className="text-xs">Show Landmarks on map</Label>
        <Checkbox
            id="show"
            checked={checked}
            onCheckedChange={onCheckedChange}
            className="bg-white border-none"
        />
    </div>
}

export default DisplayOption
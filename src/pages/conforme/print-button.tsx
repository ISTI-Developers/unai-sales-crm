import { FileCheck2, InfoIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface PrintButtonOptions {
    displayRateCard: boolean;
    mergePackageCost: boolean;
    displayTotalCost: boolean;
    removeVAT: boolean;
}
interface GenerateConformeButtonProps {
    onGenerate: (options: PrintButtonOptions) => void | Promise<void>;
    disabled?: boolean;
    loading?: boolean;
    hasOfferedRate?: boolean
    areAllDurationsSimilar?: boolean
}

export function GenerateConformeButton({
    onGenerate,
    disabled = false,
    loading = false,
    hasOfferedRate = false,
    areAllDurationsSimilar = false,
}: GenerateConformeButtonProps) {
    const [options, setOptions] = useState({
        displayRateCard: false,
        displayTotalCost: false,
        mergePackageCost: false,
        removeVAT: false,
    })

    return (
        <div className="flex items-center gap-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon"><SettingsIcon /></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Configure Print Layout
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Toggle options for the print layout below.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <main className="space-y-4">
                        <div className="flex items-center justify-between gap-1">
                            <Label htmlFor="rate-card">Show initially offered rate
                            </Label>
                            <Tooltip>
                                <TooltipTrigger className="mr-auto">
                                    <InfoIcon size={16} />
                                </TooltipTrigger>
                                <TooltipContent>Toggle to display the offered rate given to client.</TooltipContent>
                            </Tooltip>
                            <Switch disabled={!hasOfferedRate} id="rate-card" checked={options.displayRateCard} onCheckedChange={(checked) => setOptions(prev => ({
                                ...prev,
                                displayRateCard: !!checked
                            }))} />
                        </div>
                        <div className="flex items-center justify-between gap-1">
                            <Label htmlFor="total-cost" className="">Show individual total cost
                            </Label>
                            <Tooltip>
                                <TooltipTrigger className="mr-auto">
                                    <InfoIcon size={16} />
                                </TooltipTrigger>
                                <TooltipContent>Toggle to show individual total cost multipled by duration.</TooltipContent>
                            </Tooltip>
                            <Switch id="total-cost" checked={options.displayTotalCost} onCheckedChange={(checked) => setOptions(prev => ({
                                ...prev,
                                displayTotalCost: !!checked,
                                mergePackageCost: false,
                            }))} />
                        </div>
                        <div className="flex items-center justify-between gap-1">
                            <Label htmlFor="rental-cost" className="">Merge into packaged cost
                            </Label>
                            <Tooltip>
                                <TooltipTrigger className="mr-auto">
                                    <InfoIcon size={16} />
                                </TooltipTrigger>
                                <TooltipContent>Only available if all duration are the same</TooltipContent>
                            </Tooltip>
                            <Switch id="rental-cost" checked={options.mergePackageCost} disabled={!areAllDurationsSimilar} onCheckedChange={(checked) => setOptions(prev => ({
                                ...prev,
                                mergePackageCost: !!checked,
                                displayTotalCost: false,
                            }))} />
                        </div>
                        <div className="flex items-center justify-between gap-1">
                            <Label htmlFor="remove-vat">Remove VAT
                            </Label>
                            <Tooltip>
                                <TooltipTrigger className="mr-auto">
                                    <InfoIcon size={16} />
                                </TooltipTrigger>
                                <TooltipContent>Toggle to make contract VAT exempt.</TooltipContent>
                            </Tooltip>
                            <Switch id="remove-vat" checked={options.removeVAT} onCheckedChange={(checked) => setOptions(prev => ({
                                ...prev,
                                removeVAT: !!checked
                            }))} />
                        </div>
                    </main>
                    <AlertDialogFooter>
                        {/* <AlertDialogCancel>Close</AlertDialogCancel> */}
                        <AlertDialogAction disabled={disabled || loading}>Close</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button
                type="button"
                disabled={disabled || loading}
                className="gap-2 bg-main-100"
                onClick={() => onGenerate(options)}
            >
                <FileCheck2 className="size-4" />

                {loading ? "Generating..." : "Generate PDF"}
            </Button>
        </div>
    );
}
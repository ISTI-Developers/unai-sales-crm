import { FileCheck2, InfoIcon, PrinterIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface PrintButtonOptions {
    displayRateCard: boolean;
    mergePackageCost: boolean;
    removeVAT: boolean;
}
interface GenerateConformeButtonProps {
    onGenerate: (options: PrintButtonOptions) => void | Promise<void>;
    disabled?: boolean;
    loading?: boolean;
}

export function GenerateConformeButton({
    onGenerate,
    disabled = false,
    loading = false,
}: GenerateConformeButtonProps) {
    const [options, setOptions] = useState({
        displayRateCard: false,
        mergePackageCost: false,
        removeVAT: false,
    })

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    type="button"
                    disabled={disabled || loading}
                    className="gap-2 bg-main-100"
                >
                    <FileCheck2 className="size-4" />

                    {loading ? "Generating..." : "Generate PDF"}
                </Button>
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
                        <Label htmlFor="rate-card">Display rate card (if offered rate is not empty)
                        </Label>
                        <Tooltip>
                            <TooltipTrigger className="mr-auto">
                                <InfoIcon size={16} />
                            </TooltipTrigger>
                            <TooltipContent>Toggle to display the initial offered monthly rate and discounted rate.</TooltipContent>
                        </Tooltip>
                        <Switch id="rate-card" checked={options.displayRateCard} onCheckedChange={(checked) => setOptions(prev => ({
                            ...prev,
                            displayRateCard: !!checked
                        }))} />
                    </div>
                    <div className="flex items-center justify-between gap-1">
                        <Label htmlFor="rental-cost" className="" aria-disabled={!options.displayRateCard}>Merge package cost
                        </Label>
                        <Tooltip>
                            <TooltipTrigger className="mr-auto">
                                <InfoIcon size={16} />
                            </TooltipTrigger>
                            <TooltipContent>Enable display rate card to toggle.</TooltipContent>
                        </Tooltip>
                        <Switch id="rental-cost" disabled={!options.displayRateCard} checked={options.mergePackageCost} onCheckedChange={(checked) => setOptions(prev => ({
                            ...prev,
                            mergePackageCost: !!checked
                        }))} />
                    </div>
                    <div className="flex items-center justify-between gap-1">
                        <Label htmlFor="remove-vat">Remove VAT (VAT Exempt)
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
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onGenerate(options)} disabled={disabled || loading}><PrinterIcon />Print</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
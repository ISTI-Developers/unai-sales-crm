import { Label } from "@/components/ui/label"
import InputNumber from "@/components/ui/number-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AddOns, Conforme } from "@/interfaces/requests.interface";
import { Dispatch, SetStateAction, useMemo } from "react";

interface AddOnsSectionProps {
    conforme: Conforme;
    setConforme: Dispatch<SetStateAction<Conforme>>
}
function AddOnsSection({ conforme, setConforme }: AddOnsSectionProps) {

    const generateFreeMaterialPrintingClause = () => {

        const hasFreePrinting = freeMaterialPrinting.some(free => free !== 0);

        if (hasFreePrinting) {
            return <div className="flex flex-wrap items-center gap-1.5">
                <span>Client is given</span>
                <span className="font-semibold">1 time</span>
                <span>material production for FREE, succeeding shall be for the account of client at </span>
                <div>
                    <InputNumber value={conforme.material_cost} />
                    <span>per sqft.</span>
                </div>
            </div>
        }
        return <div>
            <Label>Material Printing</Label>
            <RadioGroup>
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="charge_client" id="charge_client" />
                    <Label htmlFor="charge_client">
                        Client pays for material printing
                    </Label>
                </div>

                <div className="flex items-center gap-2">
                    <RadioGroupItem value="client_print" id="client_print" />
                    <Label htmlFor="client_print">
                        Client handles material printing
                    </Label>
                </div>
            </RadioGroup>
        </div>
    }

    return (
        <div className="space-y-4">
            <header className="flex items-center gap-4">
                <Label>Add-ons Terms</Label>
            </header>
            <main>
                {generateFreeMaterialPrintingClause()}
            </main>
        </div>
    )
}

export default AddOnsSection
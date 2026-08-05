import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import ClientBrandCombobox from "../ui/client-brand-combo-box";
import ReportForm from "./form.report";
import { useMemo, useState } from "react";
import { Client } from "@/interfaces/client.interface";
import { useReports } from "@/providers/reports.provider";
import { generateWeeks } from "@/lib/utils";
import { Label } from "../ui/label";

function ReportDialog() {
    const { selectedWeeks } = useReports();
    const [client, setClient] = useState<Client>();
    const weeks = useMemo(generateWeeks, []);
    const currentWeek = weeks.find(week => week.isCurrent)?.yearweek
    return (
        <Dialog modal={false}>
            <DialogTrigger asChild>
                <Button className="h-7 px-2 pr-3 text-xs flex items-center gap-1" variant="outline">
                    <PlusIcon />
                    <span>New Report</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Report</DialogTitle>
                    <DialogDescription>Quickly create a new client activity for today.</DialogDescription>
                </DialogHeader>
                <main className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label>Client</Label>
                        <ClientBrandCombobox value={client} onValueChange={setClient} className="rounded-xl" />
                        {client &&
                            <>
                                <Label>Brand</Label>
                                <span className="text-xs border rounded-xl shadow p-2 px-4 h-10 flex items-center">{client.brand || "N/A"}</span>
                            </>}
                    </div>
                    {client &&
                        <ReportForm report={undefined} clientID={client?.client_id} onOpenChange={() => { }} selectedWeeks={selectedWeeks} yearweek={currentWeek!} modal />
                    }
                </main>
            </DialogContent>
        </Dialog>
    )
}

export default ReportDialog
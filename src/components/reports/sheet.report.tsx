import { cn, generateWeeks } from "@/lib/utils"
import { ScrollArea } from "../ui/scroll-area"
import { AnimatePresence, motion } from "framer-motion"
import { Label } from "recharts"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../ui/sheet"
import ReportCard from "./card.report"
import ReportForm from "./form.report"
import { useReports } from "@/providers/reports.provider"
import { useMemo, useState } from "react"
import { Activity } from "@/interfaces/reports.interface"
import { useDeleteReport } from "@/hooks/useReports"
import { toast } from "@/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/providers/auth.provider"


function ReportSheet() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { selectedWeeks, sheetData, sheetOpen, setSheetOpen } = useReports();
    const { mutate: deleteReport } = useDeleteReport()
    const weekInfo = generateWeeks().find(item => item.yearweek === Number(sheetData?.columnID))!;
    const [selectedReport, setSelectedReport] = useState<Activity | undefined>()

    const processedReports = useMemo(() => {
        if (!sheetData) return undefined;
        if (typeof sheetData.reports === "string") return undefined;
        return [...sheetData.reports].sort((a, b) => {
            return new Date(b.date_modified).getTime() - new Date(a.date_modified).getTime();
        })
    }, [sheetData])
    const handleDeleteReport = (ID: number) => {

        deleteReport({ ID: ID }, {
            onSuccess: () => {
                toast({
                    variant: "success",
                    description: "report has been deleted successfully"
                })
                queryClient.refetchQueries({
                    queryKey: ["reports", new Date().getFullYear(), user?.ID, selectedWeeks]
                })
            }
        })
    }
    return (
        <Sheet modal={false} open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="p-4 sm:max-w-lg" onInteractOutside={(e) => {
                const target = e.target as HTMLElement;

                if (target.closest("[data-report-button]")) {
                    e.preventDefault();
                }
            }}>
                <SheetHeader className='space-y-0'>
                    <SheetTitle>{`Wk${weekInfo?.isoWeek} Activities`}</SheetTitle>
                    <SheetDescription>{sheetData?.client?.client}</SheetDescription>
                </SheetHeader>
                <main className='flex flex-col gap-4 py-4'>
                    <ReportForm report={selectedReport ?? undefined} onOpenChange={() => {
                        setSelectedReport(undefined)
                    }} modal={true} yearweek={Number(sheetData?.columnID)} selectedWeeks={selectedWeeks} clientID={sheetData?.client?.ID ?? 0} />
                </main>
                <footer className="flex flex-col gap-2">
                    <Label>This week's Activities</Label>
                    <ScrollArea className='overflow-y-auto'>
                        <div className='h-[70vh] flex flex-col gap-2'>
                            <AnimatePresence initial={false}>
                                {processedReports?.map((report) => (
                                    <motion.div
                                        key={report.ID}
                                        layout
                                        initial={{ opacity: 0, y: -12, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -12, scale: 0.98 }}
                                        transition={{
                                            duration: 0.2,
                                            ease: "easeOut",
                                        }}
                                    >
                                        <ReportCard report={report} onSelect={setSelectedReport} onDelete={handleDeleteReport} className={cn("transition-all", selectedReport?.ID === report.ID ? "border-amber-400 bg-amber-100 animate-pulse" : "")} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </footer>
            </SheetContent>
        </Sheet>
    )
}

export default ReportSheet
import Search from "@/components/search";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LEDBoard, LEDBoards } from "@/data/LEDBoards";
import { columns } from "@/data/ledPicker.columns";
import { useResponsiveTable } from "@/hooks/use-responsive-table";
import { Cart, LEDSiteRow } from "@/interfaces/requests.interface";
import { cn } from "@/lib/utils";
import { addDays } from "date-fns";
import { PlusIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

interface LEDPickerProps {
    cartLEDs: LEDSiteRow[];
    setCart: Dispatch<SetStateAction<Cart>>;
}
function LedPicker({ cartLEDs, setCart }: LEDPickerProps) {
    const [open, setOpen] = useState(false);
    const { table, setGlobalFilter } = useResponsiveTable({ data: LEDBoards, columns: columns, size: 30 })
    const [selectedSites, setSelectedSites] = useState<LEDBoard[]>([])

    const onSelectLEDs = () => {
        const leds = selectedSites.map(site => {
            const endDate = new Date();
            const existing = cartLEDs.find(
                item => item.site.site_code === site.site_code
            );

            if (existing) {
                return existing;
            }
            return {
                site: {
                    ...site,
                    price: String(site.discounted_rate),
                },
                srp: String(site.spots_price),
                spots_count: 0,
                spots_rate: "0",
                is_free: false,
                package_rate: "0",
                offered_rate: "0",
                date: {
                    from: endDate,
                    to: addDays(endDate, 29),
                },
            };
        })
        setCart(prev => ({
            ...prev,
            leds,
        }));
        setOpen(false)
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className='w-fit h-7 pl-3'>
                    <PlusIcon />
                    <p>Add LED</p>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] lg:max-w-[70vw] flex flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>Sites Selection</DialogTitle>
                    <DialogDescription>
                        Select the LED boards you wish to add to your conforme.
                    </DialogDescription>
                </DialogHeader>

                <Search setValue={setGlobalFilter} />

                <ScrollArea className="h-[400px] min-h-0 w-full">
                    <main className="grid grid-cols-1 gap-4 p-1">
                        {table.getRowModel().rows.map((row) => (
                            <LEDCard
                                key={row.id}
                                site={row.original}
                                selectedSites={selectedSites}
                                setSite={setSelectedSites}
                            />
                        ))}
                    </main>
                </ScrollArea>

                <footer className="ml-auto">
                    <Button
                        type="button"
                        disabled={selectedSites.length === 0}
                        onClick={onSelectLEDs}
                        variant="outline"
                        className="bg-main-100 text-white"
                    >
                        {cartLEDs.length > 0 ? "Update" : "Add"} ({selectedSites.length}) sites
                    </Button>
                </footer>
            </DialogContent>
        </Dialog>
    )
}
function LEDCard({
    site,
    selectedSites,
    setSite
}: {
    site: LEDBoard;
    selectedSites: LEDBoard[];
    setSite: Dispatch<SetStateAction<LEDBoard[]>>;
}) {

    return (
        <div
            role="button"
            onClick={() => {
                setSite(prev => {
                    if (prev.some(p => p.site_code === site.site_code)) {
                        return prev.filter(p => p.site_code !== site.site_code);
                    }

                    return [...prev, site];
                });
            }}
            className="relative rounded-lg border overflow-hidden w-full"
        >
            <div className={cn("text-xs leading-tight p-3 transition-all", selectedSites.some(
                item => item.site_code === site.site_code
            ) ? "bg-emerald-100 text-emerald-700" : "")}>
                <h3 className='text-sm font-semibold'>{site.site_code} <span>({site.size})</span></h3>
                <p className="text-[0.65rem] font-light">{site.address}</p>
                <p className="text-[0.55rem] italic font-light">{site.board_facing}</p>
            </div>
        </div>
    );
}
export default LedPicker
import { useThumbnail } from '@/hooks/useSites'
import { DeckSite } from '@/interfaces/deck.interface';
import { cn } from '@/lib/utils';
import { format, isBefore } from 'date-fns';
import { ReactNode, useMemo } from 'react';
const PreviewItem = ({ item, className }: { item: DeckSite; className?: string }) => {
    const { data } = useThumbnail(item.image)
    return (
        <div
            role='button'
            onClick={() => {
                const element = document.getElementById(item.site_code);
                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        inline: "center",
                        block: "nearest"
                    });
                }
            }}
            className={cn(
                "w-full bg-white aspect-video bg-contain bg-no-repeat rounded overflow-hidden relative flex-shrink-0 max-w-[200px]",
                className
            )}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <div className="w-full h-[2vh] bg-main-500 flex items-center gap-4 justify-between px-2">
                <img src="/unai-w.png" alt="" className="h-full p-1 px-0" />
                <p className="text-white font-semibold text-[4px]">
                    {`Billboard Site in ${item.city}`}
                </p>
            </div>
            <div className="grid grid-cols-[2fr_1fr] h-full px-2 gap-2">
                {data ?
                    <img src={data} alt="" className="w-full p-1 px-0  aspect-video translate-y-3" />
                    : <div className='w-[95%] h-[55%] mt-[40%] -translate-y-1/2 bg-zinc-100'></div>}
                <div className="py-4 grid grid-cols-2 h-fit pr-3">
                    <div className="leading-none">
                        <DeckLabel>
                            Availability
                        </DeckLabel>
                        <AvailabilityField site={item} />
                    </div>
                    <div className="leading-none">
                        <DeckLabel>
                            ROFR
                        </DeckLabel>
                        <DeckValue>TBA</DeckValue>
                    </div>
                    <div className="leading-none">
                        <DeckLabel>
                            Site Code
                        </DeckLabel>
                        <DeckValue>{item.site_code}</DeckValue>
                    </div>
                    <div className="leading-none">
                        <DeckLabel>
                            Size (H x W)
                        </DeckLabel>
                        <DeckValue>{item.size}</DeckValue>
                    </div>
                    <div className="leading-none col-[1/3]">
                        <DeckLabel>
                            Address
                        </DeckLabel>
                        <DeckValue className="text-[2px]">{item.address}</DeckValue>
                    </div>
                    <div className="leading-none col-[1/3]">
                        <DeckLabel>
                            Facing
                        </DeckLabel>
                        <DeckValue>{item.board_facing}</DeckValue>
                    </div>
                    <div className="leading-none col-[1/3]">
                        <DeckLabel>
                            Bound
                        </DeckLabel>
                        <DeckValue>{item.bound}</DeckValue>
                    </div>
                    <div className="leading-none">
                        <DeckLabel>
                            Traffic Count
                        </DeckLabel>
                        <DeckValue>{item.traffic_count}</DeckValue>
                    </div>
                    <div className="leading-none">
                        <DeckLabel>
                            Population
                        </DeckLabel>
                        <DeckValue>{item.vicinity_population}</DeckValue>
                    </div>
                    <div className="leading-none">
                        <DeckLabel>
                            Landmarks
                        </DeckLabel>
                        <DeckValue>{item.vicinity_population}</DeckValue>
                    </div>
                </div>
            </div>
        </div>
    )
}
const AvailabilityField = ({ site }: { site: DeckSite }) => {
    const availability = useMemo(() => {
        if (!site.availability) return "OPEN";

        if (isBefore(new Date(site.availability), new Date())) return "OPEN";

        return format(new Date(site.availability), "PP")
    }, [site.availability])
    return <DeckValue className="text-red-300 whitespace-nowrap leading-none">
        {availability}
    </DeckValue>
};

// const LandmarksField = () => {

// }
const DeckLabel = ({ children }: { children: ReactNode }) => {
    return <p className="text-[1.5px] text-slate-500 uppercase">{children}:</p>
}

const DeckValue = ({ children, className }: { children: ReactNode; className?: string }) => {
    return <p className={cn("text-[2px] font-bold uppercase leading-none", className)}>{children}</p>;
}
export default PreviewItem
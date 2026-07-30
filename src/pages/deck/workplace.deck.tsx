import { SiteItem } from '@/components/deck/sites.item';
import { Button } from '@/components/ui/button';
import { useDeck } from '@/providers/deck.provider'
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useMemo, useRef } from 'react'

function DeckWorkplace() {
    const { selectedSites: sites, selectedSite, setSelectedSite } = useDeck();


    const canScroll = useRef(true);
    const direction = useRef(1);

    const goPrevious = () => {
        direction.current = -1;
        setSelectedSite(p => Math.max(p - 1, 0));
    };

    const goNext = () => {
        direction.current = 1;
        setSelectedSite(p => Math.min(p + 1, sites.length - 1));
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!canScroll.current) return;

        canScroll.current = false;

        setTimeout(() => {
            canScroll.current = true;
        }, 350);

        if (e.deltaY > 0) {
            goNext();
        } else {
            goPrevious()
        }
    };
    const currentSite = useMemo(() => {
        if (sites.length === 0) return;
        return sites[selectedSite];
    }, [selectedSite, sites]);

    return (
        <div onWheel={handleWheel} className="flex flex-1 items-center justify-center overflow-hidden p-4 lg:p-0">
            <div
                className="relative aspect-[16/9] border-2 rounded-lg flex items-center justify-center bg-zinc-100 transition-all"
                style={{
                    width: `min(100%, calc(60vh * 16 / 9))`,
                }}
            >

                <div
                    className="aspect-[16/9] bg-zinc-100 overflow-hidden rounded-lg h-full w-full max-w-[calc((100vh-8rem)*16/9)] max-h-[calc(100vh-8rem)]"

                >
                    <div
                        key={currentSite?.ID ?? "empty"}
                        className="h-full w-full"
                    >
                        {!currentSite ? (
                            <div className="flex h-full items-center justify-center">
                                Select a site to start now
                            </div>
                        ) : (
                            <SiteItem item={currentSite} />
                        )}
                    </div>
                </div>
                <Button size="icon" variant="outline" disabled={selectedSite === 0} className='lg:hidden absolute top-1/2 -translate-y-1/3 -left-4 rounded-full' onClick={goPrevious}><ChevronLeft /></Button>
                <Button size="icon" variant="outline" disabled={selectedSite === sites.length - 1} className='lg:hidden absolute top-1/2 -translate-y-1/3 -right-4 rounded-full ' onClick={goNext}><ChevronRight /></Button>
            </div>
        </div>
    )
}

export default DeckWorkplace
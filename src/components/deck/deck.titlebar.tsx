import { useUpdateDeck, useDeck as useOneDeck } from '@/hooks/useDeck';
import { useGeneratePowerpoint } from '@/hooks/usePrint';
import { Deck } from '@/misc/deckTemplate';
import { MoreHorizontalIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ButtonGroup } from '../ui/button-group';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useDeck } from '@/providers/deck.provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { format } from 'date-fns';
import { useAuth } from '@/providers/auth.provider';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const progressMap = {
    STALE: {
        label: "Awaiting changes",
        className: "bg-zinc-500 ",
    },
    STORED: {
        label: "Draft saved!",
        className: "bg-emerald-100 hover:bg-emerald-100 text-emerald-600",
    },
    SAVED: {
        label: "Deck is up to date",
        className: "bg-emerald-100 hover:bg-emerald-100 text-emerald-600",
    },
    SAVING: {
        label: "Saving draft...",
        className: "bg-yellow-100 hover:bg-yellow-100 text-yellow-600 animate-pulse"
    }
} as const;

type ProgressItem = (typeof progressMap)[keyof typeof progressMap];
const TitleBar = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams()
    const deckID = searchParams.get("token");

    const { data } = useOneDeck(deckID);
    const { mutate } = useUpdateDeck();
    const { selectedSites, selectedFilters, selectedOptions, title, setTitle } = useDeck();
    const { print } = useGeneratePowerpoint();

    const [progress, setProgress] = useState<ProgressItem>(progressMap.STALE)
    const onSaveAndGenerate = async () => {
        await print();
        onSave();
    }

    const onSave = (status?: number) => {
        if (!user || !deckID || selectedSites.length === 0) return;

        if (!selectedSites[0].image) return;

        console.count("rendered")
        console.log(selectedSites)

        const deck: Deck = {
            ID: data?.ID ?? 1,
            user_id: data?.user_id ?? Number(user.ID),
            token: data?.token ?? deckID,
            title: title,
            sites: selectedSites.map(site => ({
                site_code: site.site_code,
                image: site.image
            })),
            description: "",
            thumbnail: selectedSites[0].image,
            filters: selectedFilters,
            options: selectedOptions,
            status: status ?? 1,
            created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            modified_at: format(new Date(), "yyyy-MM-dd HH:mm:ss")
        }
        mutate(deck, {
            onSuccess: () => {
                if (status !== 3) {
                    toast({
                        variant: "success",
                        title: "Deck has been saved successfully"
                    })
                }
                setProgress(status === 3 ? progressMap.STORED : progressMap.SAVED)

            }
        });
    }
    const shouldSave = useMemo(() => {
        if (data === undefined) return false;
        if (!data) return true;

        const originalCodes = data.sites.map(site => site.site_code);
        const selectedCodes = selectedSites.map(site => site.site_code);
        const tempSelectedSites = selectedSites.map(site => ({
            image: site.image,
            site_code: site.site_code,
        }));

        const isSameSites =
            originalCodes.length === selectedCodes.length &&
            originalCodes.every(code => selectedCodes.includes(code!)) && JSON.stringify(data.sites) === JSON.stringify(tempSelectedSites);

        const isSameFilters =
            JSON.stringify(data.filters) === JSON.stringify(selectedFilters);

        const isSameOptions =
            JSON.stringify(data.options) === JSON.stringify(selectedOptions);

        const isSameTitle = data.title === title;

        return !(isSameSites && isSameFilters && isSameOptions && isSameTitle);
    }, [data, selectedFilters, selectedOptions, selectedSites, title]);


    useEffect(() => {
        let isActive = true;
        const timeout = setTimeout(() => {
            if (!isActive || selectedSites.length === 0 || !shouldSave) return;
            setProgress(progressMap.SAVING)
            onSave(3)
        }, 2000);

        return () => {
            clearTimeout(timeout);
            setProgress(progressMap.STALE)
            isActive = false;
        } // ✅ cancels previous timer
    }, [shouldSave, selectedSites, selectedFilters, selectedOptions, title]);


    return <div className="flex gap-4 justify-between items-center w-full">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="shadow-none h-7 w-fit text-xs border-zinc-100 hover:border-zinc-300 focus-visible:ring-0" />
        <Badge className={cn('ml-auto h-5 font-medium text-[0.65rem]', progress?.className)}>{progress?.label}</Badge>
        <ButtonGroup>
            <Button className="h-6 px-2 text-[0.6rem] " variant="outline" onClick={onSaveAndGenerate} disabled={selectedSites.length === 0}>Save & Generate</Button>
            <DropdownMenu >
                <DropdownMenuTrigger asChild>
                    <Button className="h-6 px-2 text-[0.6rem]" variant="outline" disabled={selectedSites.length === 0}>
                        <MoreHorizontalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-full">
                    <DropdownMenuItem className="text-[0.6rem]" onClick={() => onSave()}>Save Only</DropdownMenuItem>
                    <DropdownMenuItem className="text-[0.6rem]" onClick={print}>Generate Only</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </ButtonGroup>
    </div>
}

export default TitleBar
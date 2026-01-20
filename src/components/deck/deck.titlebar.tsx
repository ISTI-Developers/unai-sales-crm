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

const TitleBar = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams()
    const deckID = searchParams.get("token");

    const { data } = useOneDeck(deckID);
    const { mutate } = useUpdateDeck();
    const { selectedSites, selectedFilters, selectedOptions, title, setTitle } = useDeck();
    const { print } = useGeneratePowerpoint();

    const onSaveAndGenerate = async () => {
        await print();
        onSave();
    }

    const onSave = () => {
        if (!user || !deckID || selectedSites.length === 0) return;

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
            thumbnail: selectedSites[0].image!,
            filters: selectedFilters,
            options: selectedOptions,
            status: 1,
            created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            modified_at: format(new Date(), "yyyy-MM-dd HH:mm:ss")
        }
        console.log(deck)
        mutate(deck);
    }


    return <div className="flex justify-between items-center w-full">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="shadow-none h-7 w-fit text-xs border-zinc-100 hover:border-zinc-300 focus-visible:ring-0" />
        <ButtonGroup>
            <Button className="h-6 px-2 text-[0.6rem] " variant="outline" onClick={onSaveAndGenerate} disabled={selectedSites.length === 0}>Save & Generate</Button>
            <DropdownMenu >
                <DropdownMenuTrigger asChild>
                    <Button className="h-6 px-2 text-[0.6rem]" variant="outline" disabled={selectedSites.length === 0}>
                        <MoreHorizontalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-full">
                    <DropdownMenuItem className="text-[0.6rem]" onClick={onSave}>Save Only</DropdownMenuItem>
                    <DropdownMenuItem className="text-[0.6rem]" onClick={print}>Generate Only</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </ButtonGroup>
    </div>
}

export default TitleBar
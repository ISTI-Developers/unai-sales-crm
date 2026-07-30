import { useMemo, useState } from 'react';
import { Input } from '../ui/input'
import { Deck } from '@/misc/deckTemplate';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useUsers } from '@/hooks/useUsers';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MonitorIcon, User2 } from 'lucide-react';
import { useThumbnail } from '@/hooks/useSites';
import { useAllDecks, useImportDeck } from '@/hooks/useDeck';
import { useNavigate } from 'react-router-dom';

function ShareDeck() {
    const { data: decks } = useAllDecks();
    const [valid, setValid] = useState(true)
    const [deckFound, setDeckFound] = useState<Deck>()
    const { mutate } = useImportDeck()
    const navigate = useNavigate();

    const handleImportDeck = () => {
        if (!deckFound) return;

        mutate(deckFound.token, {
            onSuccess: (data) => {
                if (data) {
                    navigate(`/deck/edit?token=${data.token}`)
                }
            }
        })
    }
    const handleShareCodeChange = (code: string) => {
        if (!decks) return;
        if (code.length === 0) {
            setValid(true);
            setDeckFound(undefined)
            return;
        }

        const timeout = setTimeout(() => {
            const match = decks.find(deck => {
                return deck.token.split("-")[4] === code.toLowerCase()
            });
            if (!match) {
                setValid(false)
                return;
            }

            setDeckFound(match)
            setValid(true);
        }, 1000);

        return () => clearTimeout(timeout)
    }
    return (
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>Import Deck</DialogTitle>
                <DialogDescription>Import other deck by pasting the code below.</DialogDescription>
            </DialogHeader>
            <main className="flex flex-col gap-2">
                <Input data-invalid={!valid} onChange={(e) => handleShareCodeChange(e.target.value)} className="w-1/2 data-[invalid=true]:border-red-400 data-[invalid=true]:text-red-600 data-[invalid=true]:bg-red-200/50 data-[invalid=true]:animate-buzz" />
                <span className="text-[0.65rem] italic text-zinc-400">Please verify deck information before importing.</span>
                {deckFound ? <div className="border rounded-md flex flex-col gap-2 p-2">
                    <DeckItem deck={deckFound} />
                </div> : !valid ? <div className="border  p-2 bg-red-50 rounded-md text-center text-red-300 border-red-300">
                    Deck not found. Please double check your code.
                </div> : <div className="text-center border p-2 rounded-lg flex justify-center items-center bg-zinc-50 text-zinc-500 border-zinc-300">Enter deck code above to view details</div>}
            </main>
            <DialogFooter>
                <Button type="button" onClick={handleImportDeck} disabled={!valid && !!deckFound}>Import</Button>
            </DialogFooter>
        </DialogContent>
    )
}

const DeckItem = ({ deck }: { deck: Deck }) => {
    const { data, isLoading } = useThumbnail(deck.thumbnail);
    const length = typeof deck.sites === "string" ? JSON.parse(deck.sites).length : deck.sites.length

    return <div className='space-y-2'>
        <div className='aspect-video overflow-hidden rounded-lg'>
            {isLoading ? <div className="w-full bg-slate-200 animate-pulse" /> :
                <img src={data} alt="" className="w-full h-full object-cover" />
            }
        </div>
        <div className='flex items-center justify-between'>
            <div>
                <div className="flex items-center gap-1">
                    <p>{deck.title}</p>
                </div>
                <div className="text-sm flex items-center gap-1">
                    <UserDetails id={deck.user_id} />
                </div>
            </div>
            <div className='flex items-center gap-1'>
                <MonitorIcon size={16} />
                <p className='text-xs'>{length} site{length > 1 && "s"} found</p>
            </div>
        </div>
    </div>
}
const UserDetails = ({ id }: { id: number }) => {
    const { data: users, isLoading } = useUsers();
    const user = useMemo(() => {
        if (!users || isLoading) return undefined;

        return users.find(u => u.ID === id);
    }, [users, isLoading, id])

    return user && <div className='flex items-center gap-2'>
        <Avatar className='size-6'>
            <AvatarImage src={`${import.meta.env.VITE_SERVER}images/${user.image}`} />
            <AvatarFallback>
                <User2 size={10} />
            </AvatarFallback>
        </Avatar>
        <p>
            {`${user.first_name} ${user.last_name}`}
        </p>
    </div>
}

export default ShareDeck
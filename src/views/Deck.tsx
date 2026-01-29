import Search from "@/components/search";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useThumbnail } from "@/hooks/useSites";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { DeckProvider } from "@/providers/deck.provider";
// import { AnimatePresence, motion } from "framer-motion";
import { Deck as Deck_1 } from "@/misc/deckTemplate";
import { format } from "date-fns";
import { CirclePlus, Trash2 } from "lucide-react";
import { lazy, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, Route, Routes } from "react-router-dom";
import { useDecks, useDeleteDeck } from "@/hooks/useDeck";
import { useAuth } from "@/providers/auth.provider";
import { v4 } from "uuid";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const EditDeck = lazy(() => import("@/pages/deck/deck.edit"))

const Deck = () => {
  return (
    // <DeckProvider>
    <Container title="Sales Deck">
      <Helmet>
        <title>Sales Deck | Sales Platform</title>
      </Helmet>
      <Page className="space-y-4">
        <DeckProvider>
          <Routes>
            <Route index element={<Main />} />
            <Route path="edit" element={
              <EditDeck />
            } />
            <Route path="new" element={
              <EditDeck />
            } />
          </Routes>
        </DeckProvider>
      </Page>
    </Container >
    // </DeckProvider>
  );
};

const Main = () => {
  const { user } = useAuth();
  const { data: decks } = useDecks(user ? Number(user.ID) : null);
  const [search, setSearch] = useState("");

  const deckList = useMemo(() => {
    if (!decks) return [];
    if (search.length === 0) return decks;

    return decks.filter(deck => deck.title.includes(search));
  }, [decks, search])
  return <>
    <header className="flex justify-between gap-2">
      <Search setValue={setSearch} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild className="ml-auto h-7 px-2" variant="outline" size="sm">
            <Link to={`./new?token=${v4()}`}>
              <CirclePlus />
              <span className="hidden lg:flex">New Deck</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="lg:hidden">
          Add
        </TooltipContent>
      </Tooltip>
      {/* <Tooltip>
        <TooltipTrigger asChild>
          <Button className="h-7 px-2" variant="outline" size="sm">
            <Pen />
            <span className="hidden lg:flex">Edit Decks</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="lg:hidden">
          Edit
        </TooltipContent>
      </Tooltip> */}
    </header >
    {deckList.length > 0 ?
      < main className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {deckList.map(deck => {
          return <DeckCard key={deck.title} deck={deck} />
        })}
      </main>
      : <div className="bg-zinc-100 w-full rounded-lg font-semibold p-4 py-16 text-sm text-zinc-400 text-center">
        <p>Create your first Sales Deck now!</p>
      </div>}
  </>
}


const DeckCard = ({ deck }: { deck: Deck_1 }) => {
  const { data, isLoading } = useThumbnail(deck.thumbnail);
  const { mutate } = useDeleteDeck();

  return <div className="relative flex flex-col gap-2 border p-2 shadow rounded-lg max-w-sm group overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center gap-2 bg-black/5 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto">
      <Button asChild className="rounded-full border-t shadow-sm shadow-white/50 text-white backdrop-blur-[2px] text-sm" variant="ghost">
        <Link to={`/deck/edit?token=${deck.token}`} >VIEW</Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full border-t shadow-sm shadow-red-50 text-red-50 bg-red-100/20 backdrop-blur-[2px] text-sm">
            <Trash2 />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
          </AlertDialogHeader>
          <main>
            <p>Are you sure you want to delete this saved deck?</p>
          </main>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-300 hover:bg-red-500" onClick={() => mutate(deck.ID)}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    <div className="rounded-md overflow-hidden">
      {isLoading ? <div className="w-full h-[200px] bg-slate-200 animate-pulse" /> :
        <img src={data} alt="" className="w-full max-h-[200px] object-cover" />
      }
    </div>
    <div className="grid gap-0.5 items-center">
      <p className="font-semibold">{deck.title}</p>
      <p className="text-[0.6rem]">{`Last edited on ${format(new Date(deck.modified_at), "PPP")}`}</p>
    </div>
  </div>
}
export default Deck;

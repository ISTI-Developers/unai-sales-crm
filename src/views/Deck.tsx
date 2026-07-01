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
import { CirclePlus, LayoutGrid, LayoutList, LucideProps, Trash2 } from "lucide-react";
import { Dispatch, ForwardRefExoticComponent, lazy, RefAttributes, SetStateAction, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { useDecks, useDeleteDeck, useDeleteMultipleDecks } from "@/hooks/useDeck";
import { useAuth } from "@/providers/auth.provider";
import { v4 } from "uuid";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

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

interface View {
  value: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  label: string;
  className: string;
}
const views: View[] = [{
  value: "grid",
  icon: LayoutGrid,
  label: "Grid View",
  className: "grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-4"
},
{
  value: "list",
  icon: LayoutList,
  label: "List View",
  className: "flex flex-col gap-4"
}];
const Main = () => {
  const { user } = useAuth();
  const { data: decks } = useDecks(user ? Number(user.ID) : null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [selectedDecks, setDecks] = useState<Deck_1[]>([]);
  const { mutate } = useDeleteMultipleDecks();

  const deckList = useMemo(() => {
    if (!decks) return [];
    if (search.length === 0) return decks;

    return decks.filter(deck => deck.title.includes(search));
  }, [decks, search])

  const currentView = useMemo(() => {
    return views.find(item => item.value === view)!
  }, [view])
  return <>
    <header className="flex flex-wrap justify-between gap-2">
      <Search setValue={setSearch} />
      <div className="flex items-center gap-2">
        <ButtonGroup>
          {views.map((item) => (
            <Button
              variant="outline"
              size="sm"
              data-toggle={view === item.value}
              onClick={() => setView(item.value)}
              className="h-7 data-[toggle=true]:bg-emerald-100 data-[toggle=true]:text-emerald-600 data-[toggle=true]:hover:bg-emerald-200 data-[toggle=true]:hover:text-emerald-700 data-[toggle=true]:pointer-events-none">
              <item.icon />
            </Button>
          ))}
        </ButtonGroup>
        {selectedDecks.length > 0 &&
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="h-7" variant="destructive">Delete Selected</Button>
            </AlertDialogTrigger>
            <AlertDialogContent aria-describedby={undefined}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
              </AlertDialogHeader>
              <main>
                <p>Are you sure you want to delete these {selectedDecks.length} deck/s?</p>
              </main>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-300 hover:bg-red-500" onClick={() => {
                  mutate(selectedDecks.map(deck => deck.ID), {
                    onSuccess: () => {
                      setDecks([])
                    }
                  })
                }}>Proceed</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      </div>
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
    </header >
    {
      deckList.length > 0 ?
        <ScrollArea>
          <main className={cn("max-h-[calc(100vh_-_8rem)]", currentView.className)}>
            {deckList.map(deck => {
              return <DeckCard key={deck.ID} deck={deck} currentView={currentView} selectedDecks={selectedDecks} setDecks={setDecks} />
            })}
          </main>
        </ScrollArea>
        : <div className="bg-zinc-100 w-full rounded-lg font-semibold p-4 py-16 text-sm text-zinc-400 text-center">
          {!search.length ? <p>Create your first Sales Deck now!</p> : <p>Deck not found.</p>}
        </div>
    }
  </>
}


const DeckCard = ({ deck, currentView, setDecks, selectedDecks }: { deck: Deck_1; currentView: View; selectedDecks: Deck_1[]; setDecks: Dispatch<SetStateAction<Deck_1[]>> }) => {
  const { data, isLoading } = useThumbnail(deck.thumbnail);
  const { mutate } = useDeleteDeck();
  const navigate = useNavigate();

  return <div role="link" onClick={() => {
    navigate(`/deck/edit?token=${deck.token}`);
  }} className={cn("relative grid gap-4 border p-2 shadow rounded-lg group cursor-pointer", currentView.value === "grid" ? "grid-rows-[1fr_50px] min-w-full overflow-hidden" : "grid-cols-[auto_1fr]")} >
    <div className={cn("absolute top-4 left-4 z-[11] opacity-0 group-hover:opacity-100 transition-all", selectedDecks.some(s => s.token === deck.token) ? "opacity-100" : "")}>
      <Checkbox
        className="bg-white border-2 size-6 data-[state=checked]:bg-emerald-300 data-[state=checked]:text-emerald-700 data-[state=checked]:border-emerald-900"
        checked={selectedDecks.some(s => s.token === deck.token)}
        onClick={(e) => e.stopPropagation()}
        onCheckedChange={(checked) => {
          setDecks(prev => {
            if (checked) {
              return [...prev, deck];
            }

            return prev.filter(s => s.token !== deck.token);
          });
        }}
      />
    </div>
    {
      deck.status === 3 &&
      <Badge className={cn("absolute bg-yellow-200 text-yellow-600 hover:bg-yellow-200 top-4 right-4 uppercase")}>Draft</Badge>
    }
    <div className={cn("absolute flex items-center justify-center gap-2 opacity-100 w-fit bottom-3 right-3")}>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} className={cn("rounded-md text-sm border border-red-200 bg-red-200 hover:bg-red-100 text-red-700")}>
            <Trash2 />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent aria-describedby={undefined}>
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
    <div className={cn("rounded-md overflow-hidden aspect-video transition-all", currentView.value === "grid" ? "" : "max-h-[100px]")}>
      {isLoading ? <div className="w-full bg-slate-200 animate-pulse" /> :
        <img src={data} alt="" className="w-full h-full object-cover" />
      }
    </div>
    <div className="flex flex-col items-start leading-0">
      <Link to={`/deck/edit?token=${deck.token}`} className="font-semibold hover:underline">
        {deck.title}
      </Link>
      <p className="text-[0.6rem]" onClick={(e) => e.stopPropagation()}>{`Last edited on ${format(new Date(deck.modified_at), "PPP")}`}</p>
    </div>
  </div >
}
export default Deck;

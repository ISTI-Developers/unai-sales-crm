import TitleBar from "@/components/deck/deck.titlebar";
import { useHorizontalWheelScroll } from "@/hooks/useHorizontalScroll";
import { cn } from "@/lib/utils";
import { Navigate, useLocation, useSearchParams } from "react-router-dom"
import DeckToolbar from "./toolbar.deck";
import DeckWorkplace from "./workplace.deck";
import PreviewsList from "@/components/deck/preview.list";
import { useDeck } from "@/providers/deck.provider";

const EditDeck = () => {
  const [params] = useSearchParams();
  const location = useLocation();
  const scrollRef = useHorizontalWheelScroll<HTMLDivElement>()
  const { option } = useDeck()

  if (!params.get("token") && location.pathname.includes("edit")) {
    return <Navigate to="/deck" replace />
  }
  return (
    <div className="relative flex h-[calc(100vh-10px)] overflow-y-hidden flex-col-reverse lg:flex-row">
      <DeckToolbar />
      <section className={cn("relative flex min-w-0 min-h-0 flex-1 flex-col pb-[5rem] lg:pb-0 transition-all", option ? "pb-[45vh]" : "")}>
        <TitleBar />
        <DeckWorkplace />
        <div ref={scrollRef} className="px-4 flex gap-4 overflow-x-auto scrollbar-none max-w-full lg:max-w-2xl xl:max-w-[850px] mx-auto lg:pb-4">
          <PreviewsList />
        </div>
      </section>
    </div>
  )
}



export default EditDeck
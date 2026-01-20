import TitleBar from "@/components/deck/deck.titlebar";
import OptionsPanel from "@/components/deck/options.panel";
import PreviewsList from "@/components/deck/preview.list";
import SitesPreview from "@/components/deck/sites.preview";
import SiteSelection from "@/components/deck/sites.selection";
import { Button } from "@/components/ui/button";
import { useHorizontalWheelScroll } from "@/hooks/useHorizontalScroll";
import { cn } from "@/lib/utils";
import Page from "@/misc/Page";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom"

const EditDeck = () => {
  const [params] = useSearchParams();
  const location = useLocation();
  const scrollRef = useHorizontalWheelScroll<HTMLDivElement>()

  const [isLeftOpen, toggleLeftBar] = useState(true);
  const [isRightOpen, toggleRightBar] = useState(true);


  if (!params.get("token") && location.pathname.includes("edit")) {
    return <Navigate to="/deck" replace />
  }
  return (
    <Page>
      <div className={cn("grid w-full overflow-x-hidden gap-2 text-xs", isLeftOpen && isRightOpen ? "grid-cols-[200px_1fr_200px] xl:grid-cols-[240px_1fr_240px] 2xl:grid-cols-[300px_1fr_300px]" : isLeftOpen ? "grid-cols-[200px_1fr] xl:grid-cols-[240px_1fr] 2xl:grid-cols-[300px_1fr]" : isRightOpen ? "grid-cols-[1fr_200px] xl:grid-cols-[1fr_240px] 2xl:grid-cols-[1fr_300px]" : "grid-cols-1")}>
        <section className={cn("bg-zinc-100 w-full h-[calc(100vh-122px)] rounded-md p-2 gap-2", isLeftOpen ? "flex flex-col" : "hidden")}>
          <SiteSelection />
        </section>
        <section className={cn("min-w-0 w-full h-[calc(100vh-122px)] rounded-md grid gap-2 grid-rows-[36px_1fr_auto] 2xl:grid-rows-[36px_1fr_auto]")}>
          <section className="bg-zinc-100 rounded-md flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={() => toggleLeftBar(prev => !prev)}>
              {isLeftOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </Button>
            <TitleBar />
            <Button variant="ghost" size="icon" onClick={() => toggleRightBar(prev => !prev)}>
              {isRightOpen ? <PanelRightClose /> : <PanelRightOpen />}
            </Button>
          </section>
          <SitesPreview />
          <section ref={scrollRef} className="bg-zinc-100 rounded-md min-w-0 p-2 flex items-center gap-2 overflow-x-auto">
            <PreviewsList />
          </section>
        </section>
        <section className={cn("bg-zinc-100 w-full rounded-md p-2  h-[calc(100vh-122px)] overflow-y-auto scrollbar-thin", isRightOpen ? "flex flex-col" : "hidden")}>
          <OptionsPanel />
        </section>
      </div>
    </Page>
  )
}



export default EditDeck
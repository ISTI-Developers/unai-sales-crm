import { useDeck } from "@/providers/deck.provider"
import { SiteItem } from "./sites.item";
import { ScrollArea } from "../ui/scroll-area";

const SitesPreview = () => {
  const { selectedSites } = useDeck();

  return (
    <ScrollArea>
      <section className="bg-zinc-100 rounded-md p-2 flex flex-col items-center overflow-y-auto gap-2">
        {selectedSites.map(item => {
          return <SiteItem item={item} key={item.ID} />
        })}
      </section>
    </ScrollArea>
  )
}

export default SitesPreview

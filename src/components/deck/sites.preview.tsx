import { useDeck } from "@/providers/deck.provider"
import { SiteItem } from "./sites.item";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

const SitesPreview = () => {
  const { selectedSites } = useDeck();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      setWidth(entry.contentRect.width);
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <ScrollArea>
      <section ref={containerRef} className="bg-zinc-100 rounded-md p-2 flex flex-col items-center overflow-y-auto gap-2">
        {selectedSites.map(item => {
          return <SiteItem item={item} width={width} />
        })}
      </section>
    </ScrollArea>
  )
}

export default SitesPreview

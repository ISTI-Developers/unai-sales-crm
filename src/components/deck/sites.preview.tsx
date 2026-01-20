import { useDeck } from "@/providers/deck.provider"
import { SiteItem } from "./sites.item";
import { useEffect, useRef, useState } from "react";

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
    <section ref={containerRef} className="bg-zinc-100 rounded-md p-2 flex flex-col items-center max-h-[calc(100vh-278px)] overflow-y-auto gap-2">
      {selectedSites.map(item => {
        return <SiteItem item={item} width={width}/>
      })}
    </section>
  )
}

export default SitesPreview

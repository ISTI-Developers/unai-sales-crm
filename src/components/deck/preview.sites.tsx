import { cn } from "@/lib/utils";
import { useDeck } from "@/providers/deck.provider copy";
import { useSidebar } from "@/providers/sidebar.provider";
import { Badge } from "../ui/badge";
import { useRef, useEffect, useState } from "react";
import LazySiteItem from "./site.item.lazy";

const SitePreview = () => {
  const { selectedSites } = useDeck();
  const { isCollapsed } = useSidebar();

  const siteRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeSite, setActiveSite] = useState<string | null>(null);

  const scrollToSite = (siteCode: string) => {
    const section = siteRefs.current[siteCode];
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // 👁 Track visible section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          const id = visible.target.getAttribute("data-site-code");
          if (id) setActiveSite(id);
        }
      },
      {
        root: document.querySelector(".scroll-container"), // target scroll container if needed
        rootMargin: "0px 0px -70% 0px", // top bias
        threshold: 0.2, // trigger when 20% visible
      }
    );

    selectedSites.forEach((site) => {
      const el = siteRefs.current[site.site_code];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selectedSites]);

  return (
    <div className="flex flex-col gap-2 max-w-[60vw] xl:max-w-[65vw]">
      {/* Badge nav */}
      <div
        className={cn(
          "flex gap-2 py-0.5 w-full max-w-[60vw] overflow-x-auto scrollbar-thin",
          isCollapsed ? "max-w-[70vw]" : ""
        )}
      >
        {selectedSites.map((site) => (
          <Badge
            role="button"
            key={site.site_code}
            onClick={() => scrollToSite(site.site_code)}
            className={cn(
              "px-1.5 text-[0.65rem] whitespace-nowrap cursor-pointer transition-colors",
              site.site_code === activeSite
                ? "bg-red-400 text-white"
                : "bg-main-100 text-white"
            )}
            variant="outline"
          >
            {site.site_code}
          </Badge>
        ))}
      </div>

      {/* Scrollable site sections */}
      <div className="h-[calc(100vh-12.5rem)] overflow-y-auto space-y-4 rounded-lg">
        {selectedSites.map((site) => (
          <div
            key={site.site_code}
            data-site-code={site.site_code}
            ref={(el) => {
              siteRefs.current[site.site_code] = el;
            }}
          >
            <LazySiteItem key={site.ID} site={site} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SitePreview;

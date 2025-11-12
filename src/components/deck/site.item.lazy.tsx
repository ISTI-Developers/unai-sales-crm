import { DeckSite } from "@/providers/deck.provider";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
const SiteItem = lazy(() => import("./site.item")); // code-splitting

const LazySiteItem = ({ site }: { site: DeckSite }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible && (
        <Suspense fallback={<div className="h-40 bg-muted rounded-md" />}>
          <SiteItem site={site} />
        </Suspense>
      )}
    </div>
  );
};

export default LazySiteItem;

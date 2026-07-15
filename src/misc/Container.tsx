import { ReactNode, lazy, Suspense } from "react";
import Page from "./Page";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
// import Notifications from "./Notifications";

const PageTitle = lazy(() => import("@/misc/PageTitle"));

interface ContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
}
const Container = ({ children, title = "", className }: ContainerProps) => {
  const { pathname } = useLocation();
  return (
    <div
      className={cn(
        "flex flex-col md:gap-2 text-black"
      )}
    >
      <header className="bg-red-500 w-full md:rounded-b-lg flex items-center justify-between p-2 text-white sticky top-0 lg:relative z-[2]">

        <Suspense fallback={<>Loading...</>}>
          <PageTitle title={title} />
        </Suspense>
        {/* <Notifications /> */}
      </header>
      <AnimatePresence>
        <Page
          className={cn(
            "bg-white shadow-md md:rounded-lg p-4 flex flex-col h-full lg:min-h-0 gap-4 overflow-y-auto w-full",
            pathname.split("/").length > 2 ? "max-h-[calc(100dvh_-_5.75rem)]" : "max-h-[calc(100dvh_-_3.25rem)]",
            className
          )}
        >
          {children}
        </Page>
      </AnimatePresence>
    </div>
  );
};
export default Container;

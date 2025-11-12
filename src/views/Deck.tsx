import Filters from "@/components/deck/filters";
import Header from "@/components/deck/header.page";
import Options from "@/components/deck/options";
import SitePreview from "@/components/deck/preview.sites";
import SearchFilter from "@/components/deck/search.filter";
import SiteSelection from "@/components/deck/selection.sites";
import { Progress } from "@/components/ui/progress";
import { useAvailableSites } from "@/hooks/useSites";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { DeckProvider, useDeck } from "@/providers/deck.provider";
import { AnimatePresence, motion } from "framer-motion";
import { Helmet } from "react-helmet";

const Deck = () => {
  return (
    <DeckProvider>
      <Container title="Billboard Deck Generator">
        <Helmet>
          <title>Deck | Sales Platform</title>
        </Helmet>
        <Main />
      </Container>
    </DeckProvider>
  );
};

const Main = () => {
  const { printStatus, isGenerating, selectedSites, page } = useDeck();
  const { isLoading, isError } = useAvailableSites();


  if (isError) return <>Error fetching</>;

  if (isLoading) return <>Fetching available sites...</>;
  return (
    <>
      <AnimatePresence>
        <Page className="relative overflow-x-hidden space-y-2 overflow-hidden">
          {isGenerating && (
            <div className="fixed top-0 left-0 w-full h-full flex flex-col text-sm items-center justify-center bg-black bg-opacity-30 z-20 pointer-events-auto text-white backdrop-blur-sm">
              <Progress value={(printStatus.length / selectedSites.length) * 100} className="max-w-sm bg-white" />
              {printStatus.length !== selectedSites.length ?
                <p className="animate-pulse">Generating slides...</p> : <p className="animate-pulse">Donwloading your deck...</p>
              }
            </div>
          )}
          <Header />
          <AnimatePresence>
            {page === 0 ? (
              <motion.div
                key="first"
                initial={{ x: "-100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "50%", opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative grid grid-cols-[3fr_7fr] gap-4"
              >
                <Filters />
                <div>
                  <SearchFilter />
                  <SiteSelection />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="second"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-50%", opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative grid grid-cols-[4fr_6fr] gap-4"
              >
                <Options />
                <SitePreview />
              </motion.div>
            )}
          </AnimatePresence>
        </Page>
      </AnimatePresence>
    </>
  );
};
export default Deck;

import Maps from "@/components/sites/maps";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/data/data-table";
import { columns } from "@/data/sites.columns";
import { useSites } from "@/hooks/useSites";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import UnderConstructionPage from "@/misc/UnderConstructionPage";
import ViewSite from "@/pages/sites/view.sites";
import { TabsContent } from "@radix-ui/react-tabs";
import { AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { Route, Routes } from "react-router-dom";

const Sites = () => {
  return (
    <Container title="Sites">
      <Helmet>
        <title>Sites | Sales Platform</title>
      </Helmet>
      <Routes>
        <Route path="/*" element={<Main />} />
        <Route path="/add" element={<UnderConstructionPage />} />
        <Route path="/bulk_add" element={<UnderConstructionPage />} />
        <Route path="/:id/" element={<ViewSite />} />
        <Route path="/:id/edit" element={<UnderConstructionPage />} />
      </Routes>
    </Container>
  );
};

const Main = () => {
  const { data, isLoading, fetchStatus } = useSites();
  return (
    <AnimatePresence>
      <Page className="w-full">
        <Tabs defaultValue="list">
          <TabsList className="bg-white rounded-none h-6 w-full justify-start border-b">
            <TabsTrigger value="list" className="text-xs uppercase rounded-none">Sites</TabsTrigger>
            <TabsTrigger value="maps" className="text-xs uppercase rounded-none">Map View</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="pt-2">
            {isLoading
              ? fetchStatus
              : data && (
                <>
                  <DataTable columns={columns} data={data} size={500} />
                </>
              )}
          </TabsContent>
          <TabsContent value="maps">
            <Maps />
          </TabsContent>
        </Tabs>
      </Page>
    </AnimatePresence>
  );
};

export default Sites;

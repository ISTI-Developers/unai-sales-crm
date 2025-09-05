import { DataTable } from "@/data/data-table";
import { columns } from "@/data/sites.columns";
import { useSites } from "@/hooks/useSites";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import UnderConstructionPage from "@/misc/UnderConstructionPage";
import ViewSite from "@/pages/sites/view.sites";
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
        {isLoading
          ? fetchStatus
          : data && (
              <>
                <DataTable columns={columns} data={data} size={500} />
              </>
            )}
      </Page>
    </AnimatePresence>
  );
};

export default Sites;

import Maps from "@/components/sites/maps";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/data/data-table";
import { columns } from "@/data/sites.columns";
import { useSites } from "@/hooks/useSites";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { useAuth } from "@/providers/auth.provider";
import { TabsContent } from "@radix-ui/react-tabs";
import { AnimatePresence } from "framer-motion";
import { CirclePlus } from "lucide-react";
import { lazy, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, Route, Routes } from "react-router-dom";

const AddSite = lazy(() => import("@/pages/sites/add.sites"));
const ViewSite = lazy(() => import("@/pages/sites/view.sites"));
const UnderConstructionPage = lazy(() => import("@/misc/UnderConstructionPage"));
const EditSite = lazy(() => import("@/pages/sites/edit.sites"))

const Sites = () => {
  return (
    <Container title="Sites">
      <Helmet>
        <title>Sites | Sales Platform</title>
      </Helmet>
      <Routes>
        <Route path="/*" element={<Main />} />
        <Route path="/add" element={<AddSite />} />
        <Route path="/bulk_add" element={<UnderConstructionPage />} />
        <Route path="/:id/" element={<ViewSite />} />
        <Route path="/:id/edit" element={<EditSite />} />
      </Routes>
    </Container>
  );
};

const Main = () => {
  const { data, isLoading, fetchStatus } = useSites();
  const { user } = useAuth();

  const filteredColumns = useMemo(() => {
    if (!user) return [];

    if (user.role.role_id === 13) {
      return columns.filter(column => column.id !== "price")
    }
    return columns;
  }, [user])
  return (
    <AnimatePresence>
      <Page className="w-full">
        <Tabs defaultValue="list">
          <TabsList className="w-full justify-start px-1">
            <TabsTrigger value="list" className="text-xs uppercase data-[state=active]:bg-zinc-200">Sites</TabsTrigger>
            <TabsTrigger value="maps" className="text-xs uppercase data-[state=active]:bg-zinc-200">Map View</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="pt-2">
            {isLoading
              ? fetchStatus
              : data && (
                <>
                  <DataTable columns={filteredColumns} data={data} size={500}>
                    <Button asChild variant="outline" className="px-3" size="sm">
                      <Link to="/sites/add">
                        <CirclePlus />
                        <p>New Site</p>
                      </Link>
                    </Button>
                  </DataTable>
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

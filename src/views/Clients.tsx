import { Button } from "@/components/ui/button";
import { columns } from "@/data/clients.columns";
import { DataTable } from "@/data/data-table";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import AddClient from "@/pages/clients/add.client";
import BulkAddClient from "@/pages/clients/bulkAdd.client";
import ManageClient from "@/pages/clients/manage.client";
import { useClient } from "@/providers/client.provider";
import { AnimatePresence } from "framer-motion";
import { CirclePlus, FilePlus2 } from "lucide-react";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, Route, Routes, useLocation } from "react-router-dom";

const Clients = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.match("add")) {
      localStorage.removeItem("client");
    }
  }, [location.pathname]);
  return (
    <Container title="Clients">
      <Helmet>
        <title>Clients | Sales CRM</title>
      </Helmet>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/add" element={<AddClient />} />
        <Route path="/bulk_add" element={<BulkAddClient />} />
        <Route path="/:id/" element={<ManageClient />} />
        <Route path="/:id/edit" element={<AddClient />} />
      </Routes>
    </Container>
  );
};

const Main = () => {
  const { data } = useClient();

  return (
    <>
      <header className="flex items-center gap-4">
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-1.5 pl-2"
        >
          <Link to="./add">
            <CirclePlus size={16} />
            New Client
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-1.5 pl-2"
        >
          <Link to="./bulk_add">
            <FilePlus2 size={16} />
            Multiple Clients
          </Link>
        </Button>
      </header>
      <AnimatePresence>
        <Page className="w-full">
          {data && <DataTable columns={columns} data={data} />}
        </Page>
      </AnimatePresence>
    </>
  );
};

export default Clients;

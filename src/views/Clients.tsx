/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import { columns } from "@/data/clients.columns";
import { DataTable } from "@/data/data-table";
import { useAccess, useClients } from "@/hooks/useClients";
import { ClientTable } from "@/interfaces/client.interface";
import Container from "@/misc/Container";
import Page from "@/misc/Page";
import { AnimatePresence } from "framer-motion";
import { CirclePlus, FilePlus2 } from "lucide-react";
import { useEffect, lazy, Suspense, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, Route, Routes, useLocation } from "react-router-dom";

const AddClient = lazy(() => import("@/pages/clients/add.client"));
const BulkAddClient = lazy(() => import("@/pages/clients/bulkAdd.client"));
const ManageClient = lazy(() => import("@/pages/clients/manage.client"));
const UpdateClient = lazy(() => import("@/pages/clients/update.client"));

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
        <title>Clients | Sales Platform</title>
      </Helmet>
      <Routes>
        <Route path="/*" element={<Main />} />
        <Route
          path="/add"
          element={
            <Suspense fallback={<div>Loading form...</div>}>
              <AddClient />
            </Suspense>
          }
        />
        <Route
          path="/bulk_add"
          element={
            <Suspense fallback={<div>Loading form...</div>}>
              <BulkAddClient />
            </Suspense>
          }
        />
        <Route
          path="/:id/:tab?"
          element={
            <Suspense fallback={<div>Loading client info...</div>}>
              <ManageClient />
            </Suspense>
          }
        />
        <Route
          path="/:id/edit"
          element={
            <Suspense fallback={<div>Loading edit form...</div>}>
              <UpdateClient />
            </Suspense>
          }
        />
      </Routes>
    </Container>
  );
};

const Main = () => {
  const { access: add } = useAccess("clients.add");
  const { data, isLoading, fetchStatus } = useClients();

  const clients: ClientTable[] = useMemo(() => {
    if (!data || isLoading) return [];
    const grouped = data.reduce((acc, item) => {
      if (!acc[item.client_id]) {
        acc[item.client_id] = {
          ...item,
          account_executives: []
        } as ClientTable

      }
      if (!acc[item.client_id].account_executives.some(a => a.account_id === item.account_id)) {
        acc[item.client_id].account_executives.push({
          account_id: item.account_id,
          account_executive: item.account_executive,
          alias: item.account_code,
          sales_unit_id: item.account_su_id,
          sales_unit: item.account_su,
        });
      }
      return acc
    }, {} as Record<string, ClientTable>)

    return Object.values(grouped);

  }, [data, isLoading])

  const clientsWithChildren = useMemo(() => {
    if (clients.length === 0) return clients;

    const grouped = Object.values(
      clients.reduce((acc, item) => {
        const clientName = item.name.toUpperCase().trim()
        if (!acc[clientName]) {
          acc[clientName] = {
            ...item,
            name: clientName,
            children: [],
          } as ClientTable & { children?: ClientTable[] };
        } else {
          acc[clientName].children?.push(item);
        }
        return acc;
      }, {} as Record<string, ClientTable & { children?: ClientTable[] }>)
    );


    const groupedValues = Object.values(grouped).map(client => {
      if (client.children?.length === 0) {
        const { children, ...rest } = client; // remove children
        return rest; // return client without children
      }
      return client; // return as-is if has children
    });



    const ORDER = ["HOT", "ACTIVE", "ON/OFF", "FOR ELECTIONS", "POOL"];
    return groupedValues.sort(
      (a, b) => ORDER.indexOf(a.status_name as string) - ORDER.indexOf(b.status_name as string)
    );
  }, [clients])

  if (isLoading) {
    return <>{fetchStatus}...</>;
  }


  return (
    <>
      <AnimatePresence>
        <Page className="w-full">
          {data && (
            <DataTable columns={columns} data={clientsWithChildren} size={100} getSubRows={(row: ClientTable) => row.children}>
              {add && (
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
              )}
            </DataTable>
          )}
        </Page>
      </AnimatePresence>
    </>
  );
};

export default Clients;

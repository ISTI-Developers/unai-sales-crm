/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { columns } from "@/data/clients.columns";
import ResponsiveTable from "@/data/responsive-table";
import { useAccess, useClients } from "@/hooks/useClients";
import { ClientTable } from "@/interfaces/client.interface";
import Container from "@/misc/Container";
import { Row } from "@tanstack/react-table";
import { CirclePlus, FilePlus2, MoreVertical } from "lucide-react";
import { useEffect, lazy, Suspense, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, Route, Routes, useLocation } from "react-router-dom";

const AddClient = lazy(() => import("@/pages/clients/add.client"));
const BulkAddClient = lazy(() => import("@/pages/clients/bulkAdd.client"));
const ManageClient = lazy(() => import("@/pages/clients/manage.client"));
const UpdateClient = lazy(() => import("@/pages/clients/update.client"));
const TransferClient = lazy(() => import("@/pages/clients/transfer.client"));

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

interface DuplicateGroup extends ClientTable {
  type: "group";
  children: ClientNode[];
}

interface ClientHierarchy extends ClientTable {
  type: "client";
  children: ClientNode[];
}

type ClientNode = ClientHierarchy | DuplicateGroup;

const Main = () => {
  const { access: add } = useAccess("clients.add");
  const { data, isLoading, fetchStatus } = useClients();

  const companyID = localStorage.getItem("companyID");

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
          account_image: item.account_image,
          alias: item.account_code,
          sales_unit_id: item.account_su_id,
          sales_unit: item.account_su,
        });
      }
      return acc
    }, {} as Record<string, ClientTable>)

    return Object.values(grouped);

  }, [data, isLoading])

  const clientWithGroupings = useMemo(() => {
    if (clients.length === 0) return [];

    const roots: ClientHierarchy[] = [];
    // create map of clients
    const clientMap = new Map<number, ClientHierarchy>();
    for (const client of clients) {
      clientMap.set(client.client_id, {
        ...client,
        type: "client",
        children: [],
      });
    }

    // add children to parents
    for (const client of clientMap.values()) {
      if (!client.parent_id) {
        roots.push(client);
        continue;
      }

      const parent = clientMap.get(client.parent_id);

      if (parent) {
        parent.children?.push(client)
      } else {
        roots.push(client)
      }
    }

    // 

    function groupSiblings(nodes: ClientHierarchy[]): ClientNode[] {
      const grouped = new Map<string, ClientHierarchy[]>();

      // Group by name
      for (const node of nodes) {
        const key = node.name.trim().toLowerCase();

        if (!grouped.has(key)) {
          grouped.set(key, []);
        }

        grouped.get(key)!.push(node);
      }

      const result: ClientNode[] = [];

      for (const clients of grouped.values()) {
        if (clients.length === 1) {
          result.push(clients[0]);
        } else {
          result.push({
            ...clients[0],
            type: "group",
            children: clients.slice(1),
          });
        }
      }

      return result;
    }
    function groupDuplicates(node: ClientHierarchy) {
      for (const child of node.children) {
        if (child.type === "client") {
          groupDuplicates(child);
        }
      }

      node.children = groupSiblings(
        node.children.filter(
          (child): child is ClientHierarchy => child.type === "client"
        )
      );
    }


    for (const root of roots) {
      groupDuplicates(root);
    }

    const tree = groupSiblings(roots);

    return tree;

  }, [clients])

  const filteredData = useMemo(() => {
    const ORDER = ["HOT", "ACTIVE", "ON/OFF", "POOL"];

    return [...clientWithGroupings].sort((a, b) => {
      // 1. Current company first
      const aIsCompany = String(a.company_id) === companyID;
      const bIsCompany = String(b.company_id) === companyID;

      if (aIsCompany && !bIsCompany) return -1;
      if (!aIsCompany && bIsCompany) return 1;

      // 2. Status order
      const statusDiff =
        ORDER.indexOf(a.status_name as string) -
        ORDER.indexOf(b.status_name as string);

      if (statusDiff !== 0) return statusDiff;

      // 3. Client name
      return a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
    });
  }, [clientWithGroupings, companyID]);

  const filteredColumns = useMemo(() => {
    if (companyID !== "5") {
      return columns.filter(col => col.id !== "sales_unit")
    }
    return columns.filter(col => col.id !== "company");
  }, [companyID])
  if (isLoading) {
    return <>{fetchStatus}...</>;
  }

  function rowOrChildrenMatch<TData>(row: Row<TData>, search: string): boolean {
    const selfMatches = row.getAllCells().some(cell => {
      if (!cell.column.getCanGlobalFilter()) {
        return false;
      }
      return String(cell.getValue() ?? "")
        .toLowerCase()
        .includes(search);
    });

    if (selfMatches) {
      return true;
    }

    return row.subRows.some(child => rowOrChildrenMatch(child, search));
  };
  return (
    <div>
      <ResponsiveTable
        columns={filteredColumns}
        data={filteredData}
        size={100}
        globalFilterFn={(row, _, filterValue) => {
          const search = String(filterValue).toLowerCase();

          if (rowOrChildrenMatch(row, search)) {
            return true;
          }

          let parent = row.getParentRow();

          while (parent) {
            if (
              String(parent.original.name ?? "")
                .toLowerCase()
                .includes(search)
            ) {
              return true;
            }

            parent = parent.getParentRow();
          }

          return false;
        }}
        getSubRows={(row) => row.children}>
        {add && (
          <header className="flex items-center gap-4">
            <ButtonGroup>
              <Button
                asChild
                variant="outline"
                className="flex items-center gap-1.5 pl-2 h-7 text-xs"
              >
                <Link to="./add">
                  <CirclePlus size={16} />
                  New Client
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="p-2 h-7"
                  >
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="./bulk_add" className="space-x-2 h-7 text-xs">
                      <FilePlus2 size={16} />
                      <p>
                        Batch Clients
                      </p>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ButtonGroup>
            <ButtonGroup>
              <TransferClient />
            </ButtonGroup>
          </header>
        )}
      </ResponsiveTable>
      {/* {data && (
        <DataTable columns={filteredColumns} data={filteredData} size={100}
          globalFilterFn={(row, _, filterValue) => {
            const search = String(filterValue).toLowerCase();

            // Default global search across all visible/searchable columns
            const selfMatches = row.getAllCells().some(cell => {
              const value = cell.getValue();
              return String(value ?? "").toLowerCase().includes(search);
            });

            if (selfMatches) {
              return true;
            }

            // If any ancestor matched by name, keep this row
            let parent = row.getParentRow();

            while (parent) {
              const parentName = String(parent.original.name ?? "").toLowerCase();

              if (parentName.includes(search)) {
                return true;
              }

              parent = parent.getParentRow();
            }

            return false;
          }} getSubRows={(row) => row.children}>

        </DataTable>
      )} */}
    </div>
  );
};

export default Clients;

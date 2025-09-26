import { Button } from "@/components/ui/button";
import { useClient, useAccess } from "@/hooks/useClients";
import { capitalize } from "@/lib/utils";
import Page from "@/misc/Page";
import { useAuth } from "@/providers/auth.provider";
import { ChevronLeft } from "lucide-react";
import { useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import ClientTabs from "./tabs.client";
import { useUserReportViewAccesses } from "@/hooks/useSettings";

const ManageClient = () => {
  const { user } = useAuth();
  const { access } = useAccess(10);
  const { data: reportAccess } = useUserReportViewAccesses((user?.ID as number) ?? 0);

  const clientID = localStorage.getItem("client");
  const { data: client, isLoading, isError, error } = useClient(clientID);

  const hasEditAccess = useMemo(() => {
    if (!user || !client || !reportAccess) return false;

    const salesUnit = user.sales_unit;
    if (!salesUnit) {
      return user.role.role_id in [1, 3, 10, 11];
    }

    return (salesUnit.sales_unit_id === client.sales_unit_id && access.edit);
  }, [access, user, client, reportAccess]);



  if (isLoading) return <p>Loading client...</p>;
  if (isError) {
    return (
      <p>Error: {error instanceof Error ? error.message : "Unknown error"}</p>
    );
  }

  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>
          {capitalize(client?.name ?? "")} | Clients | Sales Platform
        </title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">
          {capitalize(client?.name ?? "")}
        </h1>
        <Button variant="link" type="button" asChild>
          <Link to="/clients" onClick={() => localStorage.removeItem("client")}>
            <ChevronLeft /> Back
          </Link>
        </Button>
      </header>
      {client ?
        <ClientTabs client={client} canEdit={hasEditAccess} />
        : <>Loading...</>}
    </Page>
  );
};

export default ManageClient;

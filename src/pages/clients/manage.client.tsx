import { Button } from "@/components/ui/button";
import { useClient, useAccess } from "@/hooks/useClients";
import { capitalize } from "@/lib/utils";
import Page from "@/misc/Page";
import { useAuth } from "@/providers/auth.provider";
import { ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useUserReportViewAccesses } from "@/hooks/useSettings";
import StatusSelect from "@/components/status-select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientTab from "./client.tab";
import ContactsTab from "./contacts.tab";
import ReportsTab from "./reports.tab";
import ClientHistory from "@/components/clients/history.clients";
import { getISOWeek } from "date-fns";
import { generateWeeks } from "@/data/reports.columns";
import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";

const ManageClient = () => {
  const { user } = useAuth();
  const { access: editAll } = useAccess("clients.editAll");
  const { access: editCompany } = useAccess("clients.editCompany");
  const { access: editAccountHandling } = useAccess("clients.editAccountHandling");
  const { access: editStatus } = useAccess("clients.editStatus");
  const { access: editContact } = useAccess("clients.editContact");
  const { data: reportAccess } = useUserReportViewAccesses((user?.ID as number) ?? 0);
  const currentISOWeek = getISOWeek(new Date());
  const clientID = localStorage.getItem("client");
  const { data: client, isLoading, isError, error } = useClient(clientID);
  const [tab, setTab] = useState("reports")

  const weeks = useMemo(() => generateWeeks(), [])
  const hasEditAccess = useMemo(() => {
    if (!user || !client || !reportAccess) return false;

    const salesUnit = user.sales_unit;
    const canEditAtleastOne = editAll || editCompany || editAccountHandling || editContact || editStatus;
    if (!salesUnit) {
      return canEditAtleastOne; //admin roles
    }

    return (salesUnit.sales_unit_id === client.sales_unit_id && canEditAtleastOne);
  }, [user, client, reportAccess, editAll, editCompany, editAccountHandling, editContact, editStatus]);



  if (isLoading) return <p>Loading client...</p>;
  if (isError || !client) {
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
        {/* <h1 className="text-blue-500 font-bold uppercase">
          <Badge variant="outline" className="bg-emerald-200 text-emerald-600 border-emerald-600 text-base pr-4 py-2 rounded-full flex gap-2">
            <CircleCheck />
            <p>Good Payer</p>
          </Badge>
        </h1> */}
        <Button variant="link" type="button" asChild>
          <Link to="/clients" onClick={() => localStorage.removeItem("client")}>
            <ChevronLeft /> Back
          </Link>
        </Button>
        {hasEditAccess &&
          <Button
            asChild
            type="button"
            size="sm"
            onClick={() =>
              localStorage.setItem("client", String(client.client_id))
            }
            className="w-fit lg:col-end-3 ml-auto bg-main-400 text-white hover:bg-main-700 hover:text-white"
          >
            <Link to={`./edit`}>Edit Client</Link>
          </Button>
        }
      </header>
      <div className="grid lg:grid-cols-2 gap-4">
        <section id="client_details" className="bg-zinc-50 w-full h-full p-4 rounded-lg space-y-2">
          <header className="flex justify-between items-start">
            <div className="w-full">
              <p className="font-bold">
                {client.name}
              </p>
              <p className="truncate">{client.brand}</p>
            </div>
            <StatusSelect data={client} className="text-base px-4 cursor-pointer" />
          </header>
          <Separator />
          <ClientTab client={client} />
          <Separator />
          <footer>
            <Tabs defaultValue="Contact">
              <TabsList>
                <TabsTrigger value="Contact">Contact Person</TabsTrigger>
              </TabsList>
              <TabsContent value="Contact">
                <ContactsTab client={client} />
              </TabsContent>
            </Tabs>
          </footer>
        </section>
        <section id="client-activities">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full justify-between bg-white">
              <div className="bg-zinc-50 flex justify-between rounded-lg">
                <TabsTrigger value="reports">Weekly Activities</TabsTrigger>
                <TabsTrigger value="logs" className="mr-auto">Change History</TabsTrigger>
              </div>
              {tab === "reports" &&
                <Label className="ml-auto pr-2" htmlFor="activity">Current: {weeks[currentISOWeek - 1]}</Label>
              }
            </TabsList>
            <TabsContent value="reports">
              <ReportsTab clientID={client.client_id} />
            </TabsContent>
            <TabsContent value="logs">
              <ClientHistory clientIDs={[client.client_id]} />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Page >
  );
};

export default ManageClient;

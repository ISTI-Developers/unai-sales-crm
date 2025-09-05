import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientAccess } from "@/hooks/useClients";
import { ClientInformation } from "@/interfaces/client.interface"
import { lazy, Suspense, useState } from "react";
import { Link, useParams } from "react-router-dom"

const ClientHistory = lazy(() => import("@/components/clients/history.clients"));
const ClientTab = lazy(() => import("@/pages/clients/client.tab"));
const ContactTab = lazy(() => import("@/pages/clients/contact.tab"));
const ReportsTab = lazy(() => import("@/pages/clients/reports.tab"));

const ClientTabs = ({ client, canEdit }: { client: ClientInformation, canEdit: boolean }) => {
    const params = useParams();
    const [activeTab, setTab] = useState(params?.tab ?? "client");
    const { access } = useClientAccess(10);

    const tabs = [
        {
            value: "client",
            content:
                <Suspense fallback={<>Loading...</>}>
                    <ClientTab basic={client} />
                </Suspense>
        },
        {
            value: "contact",
            content: access.view ?
                <Suspense fallback={<>Loading...</>}>
                    <ContactTab data={{
                        address: client.address,
                        contact_person: client.contact_person,
                        designation: client.designation,
                        email_address: client.email_address,
                        contact_number: client.contact_number,
                        type_name: client.type_name,
                        source_name: client.source_name,
                    }} canEdit={false} />
                </Suspense>
                : <div className="text-center text-zinc-500">
                    Only the admin and the client account owner can view this contact information details.
                    <br />
                    Please contact them if you wish to have access.
                </div>
        },
        {
            value: "reports",
            content: <Suspense fallback={<>Loading...</>}>
                <ReportsTab clientID={client.client_id} canEdit={access.view} />
            </Suspense>
        },
        {
            value: "history",
            content: <Suspense fallback={<>Loading...</>}>
                <ClientHistory
                    clientIDs={[
                        client.client_id,
                        client.client_account_id as number,
                    ]}
                />
            </Suspense>
        }
    ]

    return (
        <Tabs value={activeTab} onValueChange={setTab} className="w-full bg-zinc-100 rounded-md p-4 pt-3">
            <TabsList className="w-full justify-start gap-2">
                <TabsTrigger value="client">Client</TabsTrigger>
                <TabsTrigger value="contact">Contact Person</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                {/* <TabsTrigger value="others">Others</TabsTrigger> */}
                {canEdit && (
                    <Button
                        asChild
                        type="button"
                        size="sm"
                        onClick={() =>
                            localStorage.setItem("client", String(client.client_id))
                        }
                        className="w-fit lg:col-end-3 ml-auto bg-main-400 text-white hover:bg-main-700 hover:text-white"
                    >
                        <Link to={`./edit`}>Edit Details</Link>
                    </Button>
                )}
            </TabsList>
            {tabs.map((tab, index) => <TabsContent key={index} className="bg-white p-4 rounded-md" value={tab.value}>
                {tab.content}
            </TabsContent>)}
        </Tabs>
    )
}

export default ClientTabs
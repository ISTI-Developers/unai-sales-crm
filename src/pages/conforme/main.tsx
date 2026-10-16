import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { columns } from "@/data/request.columns"
import ResponsiveTable from "@/data/responsive-table"
import { useRequests } from "@/hooks/useRequests"
import { useUsers } from "@/hooks/useUsers"
import { CartDetails, RequestTable } from "@/interfaces/requests.interface"
import { useAuth } from "@/providers/auth.provider"
import { CheckCheckIcon, CirclePlus, ListTodoIcon, PackageIcon, CircleDashedIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { v4 } from "uuid"

function Main() {
    const { user } = useAuth();
    const { data: users, isLoading: isUsersLoading } = useUsers();
    const { data, isLoading } = useRequests(1);
    const [activeTab, setActiveTab] = useState(localStorage.getItem("conforme-tab") ?? "all")

    const sales_unit = useMemo(() => {
        if (!user || !users || isUsersLoading) return [];
        const salesUnit = user.sales_unit?.sales_unit_id;

        return users.filter(item => item.sales_unit?.sales_unit_id === salesUnit).map(item => Number(item.ID));
    }, [user, users, isUsersLoading])

    const requests: RequestTable[] = useMemo(() => {
        if (!data || !user || isLoading) return [];

        const allRequests = data.map(item => {
            const details = JSON.parse(item.details) as CartDetails;
            return {
                ...item,
                brand: details.brand.toUpperCase(),
                client_name: details.client_name.toUpperCase(),
            }
        });
        return allRequests.filter(request => {
            if ([1, 3, 10].includes(user.role.role_id)) {
                return request;
            }
            return sales_unit.some(item => item === request.user_id)
        })
    }, [data, isLoading, sales_unit, user]);

    const filteredRequests = useMemo(() => {
        if (activeTab === "all") return requests;

        if (activeTab === "todo") return requests.filter(item => item.approvers.some(approver => approver.ID === user?.ID && approver.status !== 1));

        return requests.filter(item => activeTab === "pending" ? item.status !== 1 : item.status === 1);
    }, [activeTab, requests, user?.ID])

    const filteredColumns = useMemo(() => {
        if (activeTab === "done") {
            return columns.filter(col => col.id !== "approver");
        }
        return columns;
    }, [activeTab])
    return (
        <div className="p-3 space-y-4">
            <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value);
                localStorage.setItem("conforme-tab", value)
            }}>
                <TabsList className="flex pr-1">
                    <TabsTrigger className="flex gap-2 text-xs" value="all"><PackageIcon size={16} />ALL</TabsTrigger>
                    <TabsTrigger className="flex gap-2 text-xs" value="todo"><ListTodoIcon size={16} />TO-DO</TabsTrigger>
                    <TabsTrigger className="flex gap-2 text-xs" value="pending"><CircleDashedIcon size={16} />PENDING</TabsTrigger>
                    <TabsTrigger className="flex gap-2 text-xs" value="done"><CheckCheckIcon size={16} />DONE</TabsTrigger>
                    <Button asChild className="ml-auto h-7 px-2 pr-3" variant="outline" size="sm">
                        <Link to={`./create?token=${v4()}`}>
                            <CirclePlus />
                            <span className="leading-0">Conforme Request</span>
                        </Link>
                    </Button>
                </TabsList>
                <TabsContent value={activeTab}>
                    <ResponsiveTable data={filteredRequests} columns={filteredColumns} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Main
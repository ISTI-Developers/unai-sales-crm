import { Button } from "@/components/ui/button"
import { columns } from "@/data/request.columns"
import ResponsiveTable from "@/data/responsive-table"
import { useRequests } from "@/hooks/useRequests"
import { useUsers } from "@/hooks/useUsers"
import { CartDetails, RequestTable } from "@/interfaces/requests.interface"
import { useAuth } from "@/providers/auth.provider"
import { CirclePlus } from "lucide-react"
import { useMemo } from "react"
import { Link } from "react-router-dom"
import { v4 } from "uuid"

function Main() {
    const { user } = useAuth();
    const { data: users, isLoading: isUsersLoading } = useUsers();
    const { data, isLoading } = useRequests(1);

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
    return (
        <div className="p-3 space-y-4">
            <ResponsiveTable data={requests} columns={columns}>
                <Button asChild className="ml-auto h-7 px-2 pr-3" variant="outline" size="sm">
                    <Link to={`./create?token=${v4()}`}>
                        <CirclePlus />
                        <span className="leading-0">Conforme Request</span>
                    </Link>
                </Button>
            </ResponsiveTable>
        </div>
    )
}

export default Main
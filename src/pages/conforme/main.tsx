import { Button } from "@/components/ui/button"
import { columns } from "@/data/request.columns"
import ResponsiveTable from "@/data/responsive-table"
import { useRequests } from "@/hooks/useRequests"
import { CartDetails, RequestTable } from "@/interfaces/requests.interface"
import { CirclePlus } from "lucide-react"
import { useMemo } from "react"
import { Link } from "react-router-dom"
import { v4 } from "uuid"

function Main() {
    const { data, isLoading } = useRequests(1);

    const requests: RequestTable[] = useMemo(() => {
        if (!data || isLoading) return [];

        return data.map(item => {
            const details = JSON.parse(item.details) as CartDetails;
            return {
                ...item,
                brand: details.brand,
                client_name: details.client_name,
            }
        });
    }, [data, isLoading]);
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
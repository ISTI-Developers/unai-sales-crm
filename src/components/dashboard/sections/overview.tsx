import { useAuth } from "@/providers/auth.provider"
import Bookings from "../cards/bookings"
import Clients from "../cards/clients"
import Sites from "../cards/sites"
import { useMemo } from "react"

const Overview = () => {
    const { user } = useAuth();

    const access = useMemo(() => {
        if (!user) return { clients: false, bookings: false, sites: false };

        return { clients: user.role.role_id !== 13, bookings: user.company?.ID === 5, sites: user.company?.ID === 5 };
    }, [user])
    return (
        <section className="flex gap-4">
            {access.clients &&
                <Clients />
            }
            {access.bookings &&
                <Bookings />
            }
            {access.sites &&
                <Sites />
            }
        </section>
    )
}

export default Overview
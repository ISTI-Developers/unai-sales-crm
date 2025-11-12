import { useAuth } from "@/providers/auth.provider";
import ClientAccountDistribution from "../cards/clientAccountDistribution";
import ClientStatusDistribution from "../cards/clientStatusDistribution";
import SiteAvailability from "../cards/siteAvailability";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const Graphs = () => {
    const { user } = useAuth();

    const access = useMemo(() => {
        if (!user) return { status: false, accounts: false, sites: false };

        return { status: user.role.role_id !== 13, accounts: user.role.role_id !== 13, sites: user.company?.ID === 5 };
    }, [user])
    return (
        <section className={cn("grid gap-4", user?.role.role_id === 13 ? "grid-cols-1 w-1/2" : "grid-cols-3")}>
            {access.status &&
                <ClientStatusDistribution />
            }
            {access.accounts &&
                <ClientAccountDistribution />
            }
            {access.sites &&
                <SiteAvailability />
            }
        </section>
    );
};

export default Graphs;

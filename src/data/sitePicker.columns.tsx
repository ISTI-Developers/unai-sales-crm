import { SiteAvailability } from "@/interfaces/sites.interface";
import { ColumnDef } from "@tanstack/react-table";
import { Building, MapPin } from "lucide-react";

export type SiteAvailabilityWithStatus = SiteAvailability & {
    availability: string;
}
export const columns: ColumnDef<SiteAvailabilityWithStatus>[] = [
    {
        accessorKey: "site_code",
        header: "Site Code",
        enableColumnFilter: false,
        meta: {
            icon: Building
        }
    },
    {
        accessorKey: "address",
        header: "Address",
        enableColumnFilter: false,
        meta: {
            icon: MapPin
        }
    },
    {
        accessorKey: "city",
        header: "City",
        meta: {
            icon: MapPin
        }
    },
]
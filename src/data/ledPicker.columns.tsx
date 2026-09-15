import { ColumnDef } from "@tanstack/react-table";
import { Building, MapPin } from "lucide-react";
import { LEDBoard } from "./LEDBoards";

export const columns: ColumnDef<LEDBoard>[] = [
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
    {
        accessorKey: "board_facing",
        header: "Facing",
        meta: {
            icon: MapPin
        }
    },
]
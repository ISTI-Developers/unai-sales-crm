import { useSalesUnits } from "@/hooks/useCompanies";
import { Account, ClientTable } from "@/interfaces/client.interface"
import { SalesUnitMember } from "@/interfaces/user.interface";
import { CellContext } from "@tanstack/react-table"
import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
const reportsSummaryConfig = {
    DRF: {
        label: "DRF",
        color: "#991b1b",
    },
    SU_1: {
        label: "SU 1",
        color: "#9a3412",
    },
    SU_2: {
        label: "SU 2",
        color: "#854d0e",
    },
    SU_3: {
        label: "SU 3",
        color: "#065f46",
    },
    SU_4: {
        label: "SU 4",
        color: "#1e40af",
    },
    SU_5: {
        label: "SU 5",
        color: "#1e1b4b",
    },
    "SU_6-V": {
        label: "SU 6",
        color: "#581c87",
    },
    "SU_6-M": {
        label: "SU 6",
        color: "#671fa7",
    },
    SU_7: {
        label: "SU 7",
        color: "#881337",
    },
    MGM: {
        label: "MGM",
        color: "#d1a093"
    },
    Sales: {
        label: "TAMC Sales",
        color: "#a112e3"
    },
    UTASI_Sales: {
        label: "UTASI Sales",
        color: "#f19283"
    }
}

const ClientAccounts = (cell: CellContext<ClientTable, unknown>) => {
    const { row } = cell;
    const { data: units, isLoading } = useSalesUnits();

    const accounts = row.original.account_executives as Account[];
    // const AEs = accounts.map(account => account.account_executive);

    const AEs = useMemo(() => {
        if (!units || isLoading) return undefined;
        // get sales units from the accounts.
        const accountUnits = accounts.map(account => account.sales_unit_id);

        // get account IDs from the accounts.
        const accountIDs = accounts.map(account => account.account_id);

        // filter the units with the accountUnits array.
        const unitsFound = units.filter(unit => accountUnits.some(accountUnit => unit.sales_unit_id === accountUnit));

        // check if each member, including the head, of the unit is an account.
        const validatedUnits = unitsFound.map(unit => {
            // collect all user IDs (head + members)
            const unitUserIds = [
                (unit.sales_unit_head as SalesUnitMember).user_id,
                ...(unit.sales_unit_members as SalesUnitMember[]).map(m => m.user_id),
            ];

            // split them into inside vs missing
            const inside = unitUserIds.filter(id => accountIDs.includes(id as number));
            const missing = unitUserIds.filter(id => !accountIDs.includes(id as number));

            return {
                sales_unit_id: unit.sales_unit_id,
                sales_unit_name: unit.sales_unit_name,
                inside,
                missing,
            };
        });

        //generate the text
        const clientAccounts = validatedUnits.map(unit => {
            return accounts.filter(account => unit.inside.some(id => id === account.account_id));
        })

        return clientAccounts.flat();
    }, [units, isLoading, accounts]);
    return <div className="flex flex-col text-xs leading-tight">
        {AEs ?
            <AvatarGroup>
                {AEs.map(ae => {
                    const color = ae.sales_unit ?
                        reportsSummaryConfig[
                            ae.sales_unit
                                .split(" ")
                                .join("_") as keyof typeof reportsSummaryConfig
                        ]?.color : "#d22735";
                    return <Tooltip key={ae.account_id}>
                        <TooltipTrigger asChild>
                            <Avatar key={ae.alias} className="size-8 border-2" style={{
                                borderColor: color,
                                backgroundColor: `${color}30`,
                                color: color,
                            }}>

                                <AvatarImage src={`${import.meta.env.VITE_SERVER}images/${ae.account_image}`} className="object-cover object-top" />
                                <AvatarFallback className="text-[0.6rem] uppercase">{ae.alias}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>{ae.account_executive}</TooltipContent>
                    </Tooltip>
                })}
            </AvatarGroup>
            // <>
            //     {AEs.map(ae => {
            //         return <p key={ae.alias} className="capitalize text-[0.65rem]">{ae.account_image}</p>
            //     })}
            // </>
            : "---"
        }

    </div >
}

export default ClientAccounts
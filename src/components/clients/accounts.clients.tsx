import { useSalesUnits } from "@/hooks/useCompanies";
import { Account, ClientTable } from "@/interfaces/client.interface"
import { SalesUnitMember } from "@/interfaces/user.interface";
import { capitalize } from "@/lib/utils";
import { CellContext } from "@tanstack/react-table"
import { useMemo } from "react";

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
                isComplete: missing.length === 0,
            };
        });

        //generate the text
        const clientAccounts = validatedUnits.map(unit => {
            if (unit.isComplete) {
                return unit.sales_unit_name
            }
            return accounts.filter(account => unit.inside.some(id => id === account.account_id)).map(account => capitalize(account.account_executive));
        })

        // console.log(clientAccounts);
        return clientAccounts.flat();
    }, [units, isLoading, accounts]);
    return <div className="flex flex-col text-xs leading-tight">
        {AEs ? AEs.map(ae => {
            return <p>{ae}</p>
        }) : "---"}
    </div>
}

export default ClientAccounts
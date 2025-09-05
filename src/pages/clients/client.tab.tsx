import Field from "@/components/field"
import { Badge } from "@/components/ui/badge";
import { useSalesUnits } from "@/hooks/useCompanies";
import { ClientInformation } from "@/interfaces/client.interface"
import { SalesUnitMember } from "@/interfaces/user.interface";
import { capitalize, cn, colors } from "@/lib/utils";
import { useMemo } from "react";

const ClientTab = ({ basic }: { basic: ClientInformation }) => {
    const { data: units, isLoading } = useSalesUnits();
    const mediums = useMemo(() => {
        if (!basic) return <></>;
        return (
            <div className="flex flex-wrap gap-1.5">
                {basic.mediums.map((medium) => {
                    const index = medium.medium_id % colors.length;

                    const color = colors[index] ?? "#233345";
                    return (
                        <Badge
                            key={medium.cm_id}
                            variant="outline"
                            className="text-white"
                            style={{ backgroundColor: color }}
                        >
                            {medium.name}
                        </Badge>
                    );
                })}
            </div>
        );
    }, [basic]);

    const industry = useMemo(() => {
        if (!basic.industry) return <>N/A</>;

        if (basic.industry) {
            const color = colors[basic.industry - 1] ?? "#233345";
            return (
                <div>
                    <Badge
                        variant="outline"
                        className="text-white"
                        style={{ backgroundColor: color }}
                    >
                        {basic.industry_name}
                    </Badge>
                </div>
            );
        }
        return <>N/A</>;
    }, [basic]);

    const status = useMemo(() => {
        if (!basic) return <>N/A</>;

        const name = basic.status_name.toLowerCase();
        const statusMap: {
            [key: string]:
            | "default"
            | "secondary"
            | "destructive"
            | "outline"
            | null
            | undefined;
        } = {
            active: "outline",
            hot: "outline",
            pool: "destructive",
            "on/off": "secondary",
            "for elections": "secondary",
        };

        const statusClasses: { [key: string]: string } = {
            active: "bg-green-100 text-green-700 border-green-300",
            hot: "bg-yellow-100 text-yellow-500 border-yellow-400",
            "on/off": "bg-sky-100 text-sky-600 border-sky-400",
            "for elections": "bg-sky-100 text-sky-600 border-sky-400",
        };

        return (
            <div>
                <Badge
                    variant={statusMap[name]}
                    className={cn(statusClasses[name], "uppercase")}
                >
                    {basic.status_name}
                </Badge>
            </div>
        );
    }, [basic]);

    const AEs = useMemo(() => {
        if (!units || isLoading) return undefined;
        const accounts = basic.account_executives;
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
    }, [units, isLoading, basic.account_executives]);

    const fields = [
        {
            id: "brand",
            label: "brand",
            value: basic.brand || "---"
        },
        {
            id: "industry",
            label: "industry",
            value: industry
        },
        {
            id: "mediums",
            label: "mediums",
            value: mediums
        },
        {
            id: "status",
            label: "status",
            value: status
        },
        {
            id: "company",
            label: "company",
            value: basic.company
        },
        {
            id: "sales_unit",
            label: "sales_unit",
            value: basic.sales_unit
        },
        {
            id: "account_executive",
            label: "account_executive",
            value: AEs ? AEs.join(", ") : "---"
        },
    ];

    return (
        <div className="flex flex-col gap-4 text-sm">
            {fields.slice(0, 4).map(field => <Field key={field.id} {...field} />)}
            <hr />
            {fields.slice(4).map(field => <Field key={field.id} {...field} />)}
        </div>
    )
}

export default ClientTab
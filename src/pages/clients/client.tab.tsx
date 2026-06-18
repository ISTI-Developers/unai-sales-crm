import Field from "@/components/field"
import Mediums from "@/components/mediums";
import { Separator } from "@/components/ui/separator";
import { ClientInformation } from "@/interfaces/client.interface"
import { Building, Building2, Component, Search, Settings2, ShoppingBasket, Users2 } from "lucide-react";

const ClientTab = ({ client }: { client: ClientInformation }) => {

    return (
        <main className="space-y-2">
            <div className="grid grid-cols-2 gap-4 p-2">
                <Field id="industry" label="Industry" value={client.industry_name} vertical icon={<Building2 size={16} />} />
                <Field id="type" label="Type" value={client.type_name} vertical icon={<Settings2 size={16} />} />
                <Field id="source" label="Source" value={client.source_name} vertical icon={<Search size={16} />} />
                <Field id="mediums" label="Mediums" value={<Mediums mediums={client.mediums} />} vertical icon={<ShoppingBasket size={16} />} />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 p-2">
                <Field id="account_executive" label="account_executive" value={client.account_executives.map(ae => ae.account_executive).join(", ")} vertical icon={<Users2 size={16} />} />
                <Field id="sales_unit" label="sales_unit" value={client.sales_unit} vertical icon={<Component size={16} />} />
                <Field id="company" label="Company" value={client.company} vertical icon={<Building size={16} />} />
            </div>
        </main>
    )
}

export default ClientTab
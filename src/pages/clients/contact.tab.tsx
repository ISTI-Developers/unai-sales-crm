import Field from "@/components/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllClientOptions } from "@/hooks/useClientOptions";
import { ClientInformation, ClientOptions } from "@/interfaces/client.interface"
import { useMemo, useState } from "react";

const ContactTab = ({ data, canEdit }: { data: Pick<ClientInformation, "contact_person" | "designation" | "email_address" | "contact_number" | "address" | "type_name" | "source_name">; canEdit: boolean }) => {
    const [onEdit, setEdit] = useState(false);
    const [contact, setContact] = useState(data)

    const onSubmit = () => {
        const changes = Object.keys(contact).reduce((diff, key) => {
            if (contact[key as keyof typeof contact] !== data[key as keyof typeof data]) {
                diff[key as keyof typeof contact] = contact[key as keyof typeof contact];
            }
            return diff;
        }, {} as Partial<typeof contact>);
        console.log(changes);
        setEdit(false)
    }

    return (
        <div className="flex flex-col gap-4 text-sm">
            {Object.keys(data).map(field => (
                <Field
                    key={field}
                    id={field}
                    label={field.replace(/name/gi, "")}
                    value={<ContactItem edit={onEdit} data={contact} field={field} onChange={(value) => setContact(prev => ({
                        ...prev,
                        [field]: value
                    }))} />}
                />
            ))}
            {canEdit && !onEdit &&
                <Button
                    type="button"
                    size="sm"
                    className="w-fit ml-auto bg-main-400 text-white hover:bg-main-700 hover:text-white"
                    onClick={() => setEdit(true)}
                >
                    Edit Details
                </Button>
            }
            {onEdit && <div className="flex items-center gap-2 ml-auto">
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="w-fit"
                    onClick={() => setEdit(false)}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    size="sm"
                    className="bg-main-400 text-white hover:bg-main-700 hover:text-white"
                    onClick={onSubmit}
                >
                    Save
                </Button>
            </div>}
        </div>
    )
}

interface ContactItemProps<TData> {
    edit: boolean;
    data: TData;
    field: string;
    onChange: (value: string) => void
}

function ContactItem<TData>({ edit, data, field, onChange }: ContactItemProps<TData>) {
    const clientOptions = useAllClientOptions();

    const options = useMemo(() => {
        const clientOption = clientOptions[field.split("_")[0] as keyof typeof clientOptions];

        if (clientOption) {
            return (clientOption as ClientOptions[]).map(item => {
                return {
                    id: item.misc_id,
                    name: item.name
                }
            })
        }

        return []
    }, [clientOptions, field])

    if (!edit) return data[field as keyof typeof data] || "---"


    return field.includes("name") ? <Select
        value={data[field as keyof typeof data]?.toString() ?? ""}
        required
        onValueChange={(value) => onChange(value)}>
        <SelectTrigger className="w-full max-w-sm">
            <SelectValue placeholder={`Select ${field.replace(/_/g, " ")}`} />
        </SelectTrigger>
        <SelectContent>
            {options
                .filter((option) => option.id !== 0)
                .map((option) => {
                    return (
                        <SelectItem
                            key={`${field}_${option.id}`}
                            value={option.name}
                            className="capitalize"
                        >
                            {option.name}
                        </SelectItem>
                    );
                })}
        </SelectContent>
    </Select> : <Input value={data[field as keyof typeof data]?.toString() ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full max-w-sm" />
}

// const ContactItem = ({ edit, data }: { edit: boolean; fallback: ReactNode }) => {
//     return edit ? : data[field as keyof typeof data] || "---"
// }

export default ContactTab
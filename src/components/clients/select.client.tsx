import { useAllClientOptions } from "@/hooks/useClientOptions";
import { ClientForm, ClientOptions } from "@/interfaces/client.interface";
import { SetStateAction, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Company } from "@/interfaces/company.interface";
import { SalesGroup, User } from "@/interfaces/user.interface";

const SelectField = ({
  client,
  field,
  setClient,
}: {
  client: ClientForm;
  field:
    | {
        id: string;
        type: string;
        data: ClientOptions[] | Company[] | User[] | SalesGroup[] | undefined;
      }
    | undefined;
  setClient: React.Dispatch<SetStateAction<ClientForm | null>>;
}) => {
  const { isLoading } = useAllClientOptions();

  const options: { id: number; name: string }[] = useMemo(() => {
    if (!field) return [];

    if (!field.data) return [];
    switch (field.type) {
      case "misc":
        return (field.data as ClientOptions[]).map((option) => ({
          id: option.misc_id,
          name: option.name,
        }));
      case "company":
        return (field.data as Company[]).map((option) => ({
          id: option.ID,
          name: option.name,
        }));
      case "salesUnit":
        return (field.data as SalesGroup[]).map((option) => ({
          id: option.sales_unit_id as number,
          name: option.sales_unit_name,
        }));
      case "user":
        return (field.data as User[]).map((option) => ({
          id: option.ID as number,
          name: `${option.first_name} ${option.last_name}`,
        }));
      default:
        return [];
    }
  }, [field]);
  return (
    field && (
      <Select
        value={client[field.id] as string}
        disabled={isLoading}
        required
        onValueChange={(value) =>
          setClient((prev) => {
            if (!prev) return prev;
            return { ...prev, [field.id]: value } as ClientForm;
          })
        }
      >
        <SelectTrigger className="capitalize">
          <SelectValue placeholder={`Select ${field.id.replace(/_/g, " ")}`} />
        </SelectTrigger>
        <SelectContent>
          {options
            .filter((option) => option.id !== 0)
            .map((option) => {
              return (
                <SelectItem
                  key={`${field.id}_${option.id}`}
                  value={option.name}
                  className="capitalize"
                >
                  {option.name}
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>
    )
  );
};
export default SelectField;

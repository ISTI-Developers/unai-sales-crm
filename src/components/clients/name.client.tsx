import { useClientNames } from "@/hooks/useClients";
import { useMemo } from "react";
import { ClientCombobox } from "../ui/client-combo-box";

const ClientNameField = ({
  name,
  setName,
  isParentClients
}: {
  name: string;
  setName: (name: string) => void;
  isParentClients?: boolean
}) => {
  const { data: clients, isLoading } = useClientNames();

  const options = useMemo(() => {
    if (!clients || isLoading) return [];
    return clients
      .filter(item => isParentClients ? item.is_parent : !item.is_parent)
      .map((client) => ({
        id: String(client.ID),
        name: client.name.trim(),
      }))
  }, [clients, isLoading, isParentClients]);
  return (
    <div className="relative group">
      <ClientCombobox clients={options} value={name} onChange={setName} />
    </div>
  );
};
export default ClientNameField;

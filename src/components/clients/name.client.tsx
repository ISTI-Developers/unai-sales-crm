import { useClientNames } from "@/hooks/useClients";
import { useMemo } from "react";
import { ClientCombobox } from "../ui/client-combo-box";

const ClientNameField = ({
  name,
  setName,
}: {
  name: string;
  setName: (name: string) => void
}) => {
  const { data: clients, isLoading } = useClientNames();

  const options = useMemo(() => {
    if (!clients || isLoading) return [];
    return clients
      .map((client) => ({
        id: String(client.ID),
        name: client.name.trim(),
      }))
  }, [clients, isLoading]);
  return (
    <div className="relative group">
      <ClientCombobox clients={options} value={name} onChange={setName} />
    </div>
  );
};
export default ClientNameField;

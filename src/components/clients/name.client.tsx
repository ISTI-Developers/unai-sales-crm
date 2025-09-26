import { useClients } from "@/hooks/useClients";
import { useMemo } from "react";
import { ClientCombobox } from "../ui/client-combo-box";

const ClientNameField = ({
  name,
  setName,
}: {
  name: string;
  setName: (name: string) => void
}) => {
  const { data: clients, isLoading } = useClients();

  const options = useMemo(() => {
    if (!clients || isLoading) return [];

    const seen = new Set<string>();

    return clients
      .map((client) => ({
        id: String(client.client_id),
        name: client.name,
      }))
      .filter((client) => {
        if (seen.has(client.name)) return false;
        seen.add(client.name);
        return true;
      });
  }, [clients, isLoading]);
  return (
    <div className="relative group">
      <ClientCombobox clients={options} value={name} onChange={setName} />
    </div>
  );
};
export default ClientNameField;

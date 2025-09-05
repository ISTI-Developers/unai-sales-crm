import { useClients } from "@/hooks/useClients";
import { ClientForm } from "@/interfaces/client.interface";
import Fuse from "fuse.js";
import { useMemo } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const ClientNameField = ({
  name,
  setClient,
}: {
  name: string;
  setClient: React.Dispatch<React.SetStateAction<ClientForm | null>>;
}) => {
  const { data: clients, isLoading, fetchStatus } = useClients();
  const clientSuggestions = useMemo(() => {
    if (isLoading || name.length < 3) return null;

    const fuse = new Fuse(clients ?? [], {
      includeMatches: true,
      threshold: 0.2,
      keys: ["name"],
    });

    const result = fuse.search(name);

    if (result.length === 0) return null;

    return result.map((result) => {
      return {
        ...result.item,
        indices: result.matches?.map((match) => match.indices),
      };
    });
  }, [clients, isLoading, name]);

  const clientExists = useMemo(() => {
    if (!clients || name.length < 3) return null;

    const normalize = (str: string) => str.replace(/\s+/g, "").toUpperCase();
    return clients.find((item) => normalize(item.name) === normalize(name));
  }, [clients, name]);

  return (
    <div className="relative group">
      <Input
        id="name"
        value={name}
        required
        className={cn(
          "peer ring-0 focus-visible:ring-0 outline-none",
          clientExists
            ? "border-red-100 border-2 animate-buzz text-red-500"
            : ""
        )}
        onChange={(e) => {
          const text = e.target.value;
          setClient((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              name: text,
            };
          });
        }}
        placeholder={isLoading ? fetchStatus : undefined}
        disabled={isLoading}
      />
      {clientSuggestions && (
        <div className="opacity-0 pointer-events-none peer-focus:opacity-100 peer-focus:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto absolute w-full max-h-[300px] overflow-y-auto bg-white rounded-lg border z-[2]">
          {clientSuggestions.map((client) => {
            const indices = client.indices;
            return (
              <Button
                type="button"
                variant="ghost"
                key={client.client_id}
                className="hover:bg-slate-50 p-2 flex gap-[0.5px] w-full rounded-none text-xs uppercase justify-start"
                onClick={() => setClient(prev => {
                  if (!prev) return prev;

                  return {
                    ...prev,
                    name: client.name
                  }
                })}
              >
                {client.name.split("").map((char, index) => {
                  const key = indices?.some((range) =>
                    range.some(([start, end]) => index >= start && index <= end)
                  );
                  return (
                    <p className={key ? "text-red-100" : ""}>
                      {char === " " ? <>&nbsp;</> : char}
                    </p>
                  );
                })}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ClientNameField;

import { ClientTable } from "@/interfaces/client.interface";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDeleteClient } from "@/hooks/useClients";

function DeleteClient({
  client,
  onOpenChange,
}: {
  client: ClientTable;
  onOpenChange: (open: boolean) => void;
}) {
  const { mutate: deleteClient } = useDeleteClient();
  const { toast } = useToast();
  const onContinue = async () => {
    deleteClient(
      { ID: client.client_id as number },
      {
        onSuccess: () => {
          onOpenChange(false);
          toast({
            description: `Client deletion success.`,
            variant: "success",
          });
        },
      }
    );
  };
  return (
    <DialogContent aria-describedby={undefined}>
      <DialogHeader>
        <DialogTitle>Client Deletion</DialogTitle>
      </DialogHeader>
      <div>
        Are you sure you want to delete{" "}
        <span className="font-semibold">{client.name as string}</span>?
      </div>
      <DialogFooter>
        <Button variant="destructive" onClick={onContinue}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default DeleteClient;

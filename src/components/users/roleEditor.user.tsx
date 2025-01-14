import { RoleEditorProps } from "@/interfaces/user.interface";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUser } from "@/providers/users.provider";
import { List } from "@/interfaces";
import { Button } from "../ui/button";
import { PenBox } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/providers/role.provider";

const RoleEditor = ({ row }: RoleEditorProps) => {
  const role: string = row.getValue("role");
  const item = row.original;
  const { toast } = useToast();
  const { changeRole, forceReload } = useUser();
  const { roleOptions } = useRole();

  const [isEditable, setEditable] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<List | null>(null);

  const onSubmit = async () => {
    if (selectedRole !== null) {
      const response = await changeRole(String(item.ID), item.user, selectedRole.id, selectedRole.label);

      if (response.acknowledged) {
        toast({
          description: `Role update success!`,
          variant: "success",
        });
        setEditable(false);
        forceReload();
      } else {
        toast({
          title: "Role Update Error",
          description: `ERROR: ${
            response.error ||
            "An error has occured. Send a ticket to the developer."
          }`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setEditable(false);
            setSelectedRole(null);
          }
        }}
        open={isEditable}
      >
        <DialogTrigger asChild>
          <p
            className="relative group select-none cursor-pointer flex gap-2 items-center max-w-[230px]"
            onClick={() => setEditable(true)}
          >
            <span className="capitalize">{role}</span>
            <PenBox className="absolute top-1/2 -translate-y-1/2 right-0 opacity-0 group-hover:opacity-100" />
          </p>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <p>
              Change the role of{" "}
              <span className="underline uppercase font-bold">{item.user}</span>{" "}
              by selecting from the list below. Note that the user must relogin
              to apply the changes.
            </p>
          </DialogDescription>
          <form className="flex items-center gap-2">
            <Label htmlFor="role">New Role</Label>
            <Select
              value={selectedRole?.value ?? role}
              onValueChange={(value) => {
                const roleValue = roleOptions.find(
                  (role: List) => role.value === value
                );
                if (roleValue) {
                  setSelectedRole(roleValue);
                }
              }}
            >
              <SelectTrigger className="max-w-[200px] capitalize" id="role">
                <SelectValue className="capitalize" placeholder="select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role: List) => {
                  return (
                    <SelectItem value={role.value} className="capitalize">
                      {role.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </form>
          <DialogFooter className="pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditable(false);
                setSelectedRole(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={selectedRole === null || selectedRole.value === role}
              onClick={onSubmit}
              className="bg-main-100 hover:bg-main-400 text-white hover:text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoleEditor;

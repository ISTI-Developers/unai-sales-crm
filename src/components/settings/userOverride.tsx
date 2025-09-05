import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { capitalize } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { User } from "@/interfaces/user.interface";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { ReportAccess, useSettings } from "@/providers/settings.provider";
import { useToast } from "@/hooks/use-toast";
import { useUsers } from "@/hooks/useUsers";

interface SalesEmployees extends User {
  access: string;
}

function UserOverride() {
  const { data: users } = useUsers();
  const { getReportViewingAccess, reload } = useSettings();
  const [accesses, setAccesses] = useState<ReportAccess[]>([]);

  useEffect(() => {
    const setup = async () => {
      const response = await getReportViewingAccess();
      if (response) {
        setAccesses(response);
      }
    };
    setup();
  }, [reload]);

  const salesEmployees: SalesEmployees[] = useMemo(() => {
    if (!users || users.length === 0 || accesses.length === 0) return [];

    return users
      .filter((user) => [3, 4, 5, 10].includes(user.role.role_id))
      .map((user) => {
        const hasOverridenAccess = accesses.find(
          (access) => access.account_id === user.ID
        );
        return {
          ...user,
          access:
            hasOverridenAccess && hasOverridenAccess.report_access
              ? hasOverridenAccess.report_access
              : user.role.role_id === 3
              ? "all"
              : [4, 10].includes(user.role.role_id)
              ? "team"
              : "own",
        };
      })
      .sort(
        (a, b) =>
          a.first_name.localeCompare(b.first_name) &&
          a.role.role_id - b.role.role_id
      );
  }, [accesses, users]);
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm">Manage user viewing access for reports.</h2>
      <ScrollArea className="max-h-[400px] rounded-md">
        <div className="shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 bg-slate-300 text-main-100 shadow-lg text-xs uppercase font-bold z-[2] w-1/2">
                  Name
                </TableHead>
                <TableHead className="sticky top-0 bg-slate-300 text-main-100 shadow-lg text-xs uppercase font-bold z-[2] w-1/2">
                  Access
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white">
              {salesEmployees.map((employee) => {
                return <UserItem key={employee.ID} employee={employee} />;
              })}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </section>
  );
}

function UserItem({ employee }: { employee: SalesEmployees }) {
  const accessMap = {
    all: "All Reports",
    team: "Own and Team Reports",
    own: "Own Reports Only",
  };
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const { updateReportViewAccess, doReload } = useSettings();
  const { toast } = useToast();

  const onContinue = async () => {
    if (!selectedOption) return;

    const response = await updateReportViewAccess(
      selectedOption,
      employee.ID as number
    );
    if (response) {
      doReload((val) => (val += 1));
      setSelectedOption(null);
      toast({
        title: "Report View Access",
        variant: "success",
        description: "Configuration success.",
      });
    } else {
      toast({
        title: "Retrieval Error",
        variant: "destructive",
        description: response,
      });
    }
  };

  return (
    <TableRow key={employee.ID}>
      <TableCell>
        {capitalize(employee.first_name + " " + employee.last_name)}
      </TableCell>
      <TableCell>
        <Dialog
          open={selectedOption !== null}
          onOpenChange={(open) => console.log(open)}
        >
          <Select value={employee.access} onValueChange={setSelectedOption}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select access" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="team">Own and Team Reports</SelectItem>
              <SelectItem value="own">Own Reports Only</SelectItem>
            </SelectContent>
          </Select>
          {selectedOption && (
            <DialogContent aria-describedby={undefined}>
              <DialogTitle>Report Viewing Access Override</DialogTitle>
              <div>
                Set access of{" "}
                {capitalize(employee.first_name + " " + employee.last_name)}{" "}
                from{" "}
                <span className="font-semibold pr-1">
                  {accessMap[employee.access as keyof typeof accessMap]}
                </span>
                to
                <span className="font-semibold pl-1">
                  {accessMap[selectedOption as keyof typeof accessMap]}
                </span>
                ?
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setSelectedOption(null)}>
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  onClick={onContinue}
                  className={
                    "bg-main-100 hover:bg-main-700 text-white hover:text-white"
                  }
                >
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
export default UserOverride;

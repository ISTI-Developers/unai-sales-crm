import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Contract } from "@/interfaces/contract.interface";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columns: ColumnDef<Contract>[] = [
  {
    id: "contract_no",
    accessorKey: "contract_no",
    header: () => {
      return <p className="text-center">Contract No.</p>;
    },
    cell: ({ row }) => {
      const name: string = row.getValue("contract_no");

      return <p className="text-start">{name}</p>;
    },
  },
  {
    id: "client",
    accessorKey: "client",
  },
  {
    id: "company",
    accessorKey: "company",
  },
  {
    id: "contract_term",
    accessorKey: "contract_term",
    header: () => {
      return <p className="text-center">Term</p>;
    },
    cell: ({ row }) => {
      const contract: Contract = row.original;

      const { date_from, date_to } = contract;
      const start = format(new Date(date_from), "MMM dd, yyyy");
      const end = format(new Date(date_to), "MMM dd, yyyy");

      return <p>{`${start} - ${end}`}</p>;
    },
  },
  {
    id: "contract_status",
    accessorKey: "contract_status",
    header: () => {
      return <p className="text-center">Status</p>;
    },
    cell: ({ row }) => {
      const status: string = row.getValue("contract_status");
      let className = "bg-green-300 text-green-700 border-green-500";
      switch (status) {
        case "Pending":
          className = "bg-yellow-100 text-yellow-700 border-yellow-500";
          break;
        case "For Approval":
          className = "bg-sky-100 text-sky-700 border-sky-500";
          break;
      }
      return (
        <Badge variant="outline" className={className}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    accessorKey: "actions",
    cell: ({ row }) => {
      const contract: Contract = row.original;

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-main-100 text-white border-main-300 hover:bg-main-500 hover:text-white"
            >
              View
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Contract Information</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="grid grid-rows-3 grid-flow-col gap-4">
              <ContractField
                title="Contract No."
                value={contract.contract_no}
              />
              <ContractField title="Client" value={contract.client} />
              <ContractField title="Company" value={contract.company} />
              <ContractField
                title="Grand Total"
                value={Intl.NumberFormat("en-PH", {
                  style: "currency",
                  currency: "PHP",
                }).format(Number(contract.grand_total))}
              />
              <ContractField
                title="Contract Term"
                value={contract.contract_term}
              />
              <ContractField
                title="Contract Status"
                value={contract.contract_status}
              />
            </div>
            {contract.items && (
              <>
                <Separator />
                <div>
                  <h1 className="px-1.5 font-semibold">Related Contracts</h1>
                  <Table>
                    <TableHeader>
                      <TableHead>Contract No.</TableHead>
                      <TableHead>Contract Term</TableHead>
                      <TableHead>Grand Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableHeader>
                    <TableBody>
                      {contract.items.map((item) => {
                        return (
                          <TableRow key={item.contract_no}>
                            <TableCell>{item.contract_no}</TableCell>
                            <TableCell>{`${format(
                              new Date(item.date_from),
                              "MMM dd, yyyy"
                            )} - ${format(
                              new Date(item.date_to),
                              "MMM dd, yyyy"
                            )}`}</TableCell>
                            <TableCell>
                              {Intl.NumberFormat("en-PH", {
                                style: "currency",
                                currency: "PHP",
                              }).format(Number(item.grand_total))}
                            </TableCell>
                            <TableCell>{item.contract_status}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      );
    },
  },
];

const ContractField = ({ title, value }: { title: string; value: string }) => {
  if (title === "Contract Status") {
    let className = "bg-green-300 text-green-700 border-green-500";
    switch (value) {
      case "Pending":
        className = "bg-yellow-100 text-yellow-700 border-yellow-500";
        break;
      case "For Approval":
        className = "bg-sky-100 text-sky-700 border-sky-500";
        break;
    }
    return (
      <div className="flex flex-col gap-2">
        <p className="text-gray-500 text-sm">{title}</p>
        <Badge variant="outline" className={cn(className, "w-fit h-fit")}>
          {value}
        </Badge>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <p className="text-gray-500 text-sm">{title}</p>
      <p>{value}</p>
    </div>
  );
};

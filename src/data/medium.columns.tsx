import { Company } from "@/interfaces/company.interface";
import { MediumWithCompanies } from "@/interfaces/mediums.interface";
import { ColumnDef } from "@tanstack/react-table";
import { companyColors } from "./mediums.keymap";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { List } from "@/interfaces";
import { MultiComboBox } from "@/components/multicombobox";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";
import { useDeleteMediumm, useUpdateMedium } from "@/hooks/useMediums";


export const columns: ColumnDef<MediumWithCompanies>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: () => {
      return <p className="pl-4">Name</p>;
    },
    cell: ({ row }) => {
      const name: string = row.getValue("name");

      return <p className="pl-4 max-w-[200px]">{name}</p>;
    },
  },
  {
    id: "companies",
    accessorKey: "companies",
    header: "Companies",
    cell: ({ row }) => {
      const medium: MediumWithCompanies = row.original;
      const companies: Company[] = row.getValue("companies");

      return (
        <div className="flex flex-row gap-2">
          {companies.map((company) => {
            const colorItem = companyColors.find(
              (unit) => unit.company === company.code
            );

            const color = colorItem ? colorItem.color : "#183145";

            return (
              <Badge
                key={`${medium.company_medium_id}_${company.ID}`}
                variant="outline"
                className="text-white"
                style={{ backgroundColor: color }}
              >
                {company.code}
              </Badge>
            );
          })}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const companies: Company[] = row.getValue(columnId);
      return companies.some((company) => filterValue.includes(company.code));
    },
  },
  {
    id: "actions",
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const medium = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <span className="sr-only">Open Menu</span>
              <MoreHorizontal size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <EditButton item={medium} />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => e.preventDefault()}>
              <DeleteButton item={medium} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const DeleteButton = ({ item }: { item: MediumWithCompanies }) => {
  const { mutate: deleteMedium } = useDeleteMediumm();
  const { toast } = useToast();
  const onDelete = async () => {
    deleteMedium(item.ID, {
      onSuccess: (data) => {
        if (data.acknowledged) {
          toast({
            variant: "success",
            description: "Medium has been deleted.",
          });
        }
      },
    });
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full text-start text-red-100">
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Medium</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete{" "}
          <span className="font-bold">{item.name}</span> medium?
        </DialogDescription>
        <DialogFooter>
          <Button type="button" variant="destructive" onClick={onDelete}>
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditButton = ({ item }: { item: MediumWithCompanies }) => {
  const { data: companies } = useCompanies();
  const { mutate: updateMedium } = useUpdateMedium();
  const { toast } = useToast();
  const [medium, setMedium] = useState<MediumWithCompanies>({
    ID: 0,
    name: "",
    company_medium_id: 0,
    companies: [],
  });
  const [selectedCompanies, setSelectedCompanies] = useState<List[]>();
  const [open, toggleOpen] = useState(false);

  useEffect(() => {
    if (!item) return;
    console.count("Render");

    setMedium(item);
    setSelectedCompanies(
      item.companies.map((company) => ({
        id: String(company.ID),
        label: company.code,
        value: company.code,
      }))
    );
  }, []);

  const options: List[] = useMemo(() => {
    if (!companies) return [];

    return companies.map((company) => {
      return {
        id: String(company.ID),
        label: company.code,
        value: company.code,
      };
    });
  }, [companies]);

  const updateCompanies = (id: string) => {
    setSelectedCompanies((prev) => {
      // Ensure `prev` is initialized as an array if undefined
      if (!prev) return [];

      const isSelected = prev.some((company) => company.id == id);

      // Check if the option exists in `options`
      const selectedOption = options.find((option) => option.id == id);

      // Only update if `selectedOption` exists or if we are removing an item
      const updatedCompanies = isSelected
        ? prev.filter((company) => company.id != id)
        : selectedOption
        ? [...prev, selectedOption]
        : prev;

      return [...updatedCompanies];
    });
  };

  const onSubmit = async () => {
    if (!medium || !selectedCompanies) return;

    const oldMedium = { ...item };
    const curMedium = { ...medium, companies: [...selectedCompanies] };

    const newMedium = {
      ...oldMedium,
      name: { old: oldMedium.name, new: curMedium.name },
      companies: [
        oldMedium.companies.map((company) => ({
          id: company.ID,
          code: company.code,
        })),
        curMedium.companies.map((company) => ({
          id: parseInt(company.id),
          code: company.value,
        })),
      ],
      company_medium_id: Number(oldMedium.company_medium_id),
    };

    updateMedium(newMedium, {
      onSuccess: (data) => {
        if (data.acknowledged) {
          toast({
            variant: "success",
            description: "Medium has been updated.",
          });
          toggleOpen(false);
        }
      },
    });
  };

  return (
    medium && (
      <Dialog modal open={open} onOpenChange={toggleOpen}>
        <DialogTrigger className="w-full text-start hover:bg-zinc-100 text-sm p-2 rounded-sm">Edit</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medium</DialogTitle>
          </DialogHeader>
          <form className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                value={medium.name}
                onChange={(e) =>
                  setMedium((prev) => {
                    return {
                      ...prev,
                      name: e.target.value,
                    };
                  })
                }
              />
            </div>
            {selectedCompanies && (
              <div>
                <Label>Companies</Label>
                <MultiComboBox
                  list={options}
                  title="Companies"
                  value={selectedCompanies}
                  setValue={updateCompanies}
                />
              </div>
            )}
            <DialogFooter>
              <Button type="submit" onClick={onSubmit}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  );
};

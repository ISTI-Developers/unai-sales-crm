import { FormEvent, useMemo } from "react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { MediumCompany } from "@/interfaces/mediums.interface";
import { List } from "@/interfaces";
import { Button } from "../ui/button";
import { Plus, Trash } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCompanies } from "@/hooks/useCompanies";

const AddMedium = ({
  mediums,
  setMedium,
  addRow,
  removeRow,
  onSubmit,
}: {
  mediums: MediumCompany[];
  setMedium: (value: string, index: number, id: string) => void;
  addRow: () => void;
  removeRow: (index: number) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) => {
  return (
    <DialogContent
      aria-describedby="Form for adding mediums"
      className="min-w-[800px]"
    >
      <DialogHeader>
        <DialogTitle>Add New Medium</DialogTitle>
      </DialogHeader>
      <Button
        type="button"
        variant="outline"
        className="w-fit ml-auto flex items-center gap-2 pl-1.5"
        onClick={addRow}
      >
        <Plus />
        Add Row
      </Button>
      <form className="flex flex-col gap-4 w-full" onSubmit={onSubmit}>
        <div className="grid grid-cols-[1fr_3fr_.5fr] gap-4 px-2">
          <Label>Medium</Label>
          <Label>Company</Label>
          <Label className="text-end">Action</Label>
        </div>
        <section className="flex flex-col gap-4 px-2 pt-0.5 pb-4 max-h-[300px] overflow-y-auto scrollbar-thin">
          {mediums.map((medium, index) => {
            return (
              <MediumField
                key={`medium_${index}`}
                size={mediums.length}
                medium={medium}
                setMedium={(value, id) => setMedium(value, index, id)}
                removeRow={() => removeRow(index)}
              />
            );
          })}
        </section>
        <DialogFooter>
          <Button
            variant="ghost"
            className={
              status === "active"
                ? ""
                : "bg-main-100 hover:bg-main-400 text-white hover:text-white"
            }
          >
            Submit
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

const MediumField = ({
  size,
  medium,
  setMedium,
  removeRow,
}: {
  size: number;
  medium: MediumCompany;
  setMedium: (value: string, id: string) => void;
  removeRow: () => void;
}) => {
  const { data: companies } = useCompanies();

  const options: List[] = useMemo(() => {
    if (!companies) return [];

    return companies.map((company) => {
      return {
        id: String(company.ID),
        value: company.code,
        label: `${company.code} - ${company.name}`,
      };
    });
  }, [companies]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: "-50px" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "-50px" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="grid grid-cols-[1fr_3fr_.5fr] gap-4 items-center"
      >
        <Input
          id="medium_name"
          type="text"
          autoComplete="off"
          value={medium.name}
          onChange={(e) => setMedium(e.target.value, "name")}
        />
        <Select
          value={medium.company}
          onValueChange={(value) => setMedium(value, "company")}
        >
          <SelectTrigger id="company">
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => {
              return (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Button
          disabled={size === 1}
          type="button"
          variant="destructive"
          size="icon"
          className="ml-auto"
          onClick={removeRow}
        >
          <Trash />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddMedium;

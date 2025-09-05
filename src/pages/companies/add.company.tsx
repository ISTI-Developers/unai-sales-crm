import { ComboBox } from "@/components/combobox";
import { MultiComboBox } from "@/components/multicombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCompanies, useInsertCompany } from "@/hooks/useCompanies";
import { useAvailableSalesUnits } from "@/hooks/useUsers";
import { List } from "@/interfaces";
import { Company } from "@/interfaces/company.interface";
import { SalesUnit, UnitHead } from "@/interfaces/user.interface";
import { cn } from "@/lib/utils";
import Page from "@/misc/Page";
import { AnimatePresence, motion } from "framer-motion";
import Fuse from "fuse.js";
import {
  Building,
  CaseUpper,
  ChevronLeft,
  CirclePlus,
  CircleX,
} from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { v4 } from "uuid";

const AddCompany = () => {
  const { data: existingCompanies } = useCompanies();
  const { data: availableUsers } = useAvailableSalesUnits();
  const { mutate: insertCompany } = useInsertCompany();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [units, setUnits] = useState<SalesUnit[]>([]);

  const fuse = useMemo(() => {
    if (!existingCompanies) return null;
    return new Fuse(existingCompanies, {
      threshold: 0.3,
      keys: ["name", "code"],
    });
  }, [existingCompanies]);

  const availableUnitHeads: List[] = useMemo(() => {
    if (!availableUsers) return [];
    const results = availableUsers.filter(
      (user) =>
        ![1, 2, 5].includes(user.role_id) &&
        !units.some((unit) => Number(unit.unit_head.id) === user.user_id)
    );
    return results.map((user) => {
      const fullName = `${user.first_name} ${user.last_name}`;
      return {
        id: String(user.user_id),
        value: fullName,
        label: fullName,
        role: user.role_id,
      };
    });
  }, [availableUsers, units]);

  const availableUnitMembers: List[] = useMemo(() => {
    if (!availableUsers) return [];
    const results = availableUsers.filter(
      (user) =>
        ![1, 2].includes(user.role_id) &&
        !units.some((unit) =>
          unit.unit_members.some((member) => Number(member.id) === user.user_id)
        )
    );
    return results.map((user) => {
      const fullName = `${user.first_name} ${user.last_name}`;
      return {
        id: String(user.user_id),
        value: fullName,
        label: fullName,
        role: user.role_id,
      };
    });
  }, [availableUsers, units]);

  const isReady = useMemo(() => {
    // Check if name or code is empty
    if (name === "" || code === "") return false;

    // Check if salesUnits is empty
    if (units.length === 0) return false;

    // Check if any unit has a value of 0

    const hasZeroValues = units.some((unit) =>
      Object.values(unit)
        .slice(0, 3)
        .some((value: string | List | UnitHead) => {
          if (typeof value === "object") {
            return Object.values(value).some((val: string) => val.length === 0);
          }
          return value.length === 0;
        })
    );
    if (hasZeroValues) return false;

    // All conditions pass, return true
    return true;
  }, [units, name, code]);

  const generateUnit = () => {
    setUnits((prev) => {
      return [
        ...prev,
        {
          temp_id: v4(),
          unit_name: "",
          unit_head: {
            id: v4(),
            name: "",
          },
          unit_members: [],
        },
      ];
    });
  };

  const setHead = (name: string, index: number, id: string) => {
    setUnits((prev) => {
      const updatedUnits = [...prev];

      updatedUnits[index] = {
        ...updatedUnits[index],
        unit_head: {
          id: id,
          name: name,
        },
      };

      return updatedUnits;
    });
  };

  const setMembers = (id: string, index: number, action?: string) => {
    if (availableUnitMembers.length === 0) return;
    setUnits((prev) => {
      const updatedUnits = [...prev];
      const unit = updatedUnits[index];

      // Remove logic (either explicitly passed action or toggling logic)
      const updatedMembers = action
        ? unit.unit_members.filter((item) => item.id !== id) // remove if action is specified
        : unit.unit_members.some((item) => item.id === id)
        ? unit.unit_members.filter((item) => item.id !== id) // remove if already exists
        : [
            ...unit.unit_members,
            availableUnitMembers.find((item) => item.id === id),
          ].filter((item): item is List => item !== undefined); // add if it doesn't exist and filter undefined

      updatedUnits[index] = {
        ...unit,
        unit_members: updatedMembers,
      };

      return updatedUnits;
    });
  };

  const removeUnit = (index: number) => {
    setUnits((prev) => {
      return prev.filter((_, i) => i !== index);
    });
  };
  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setName(value);
    setCode(
      value
        .split(" ")
        .map((words: string) => words.substring(0, 1))
        .join("")
    );

    if (value.length > 1) {
      if (fuse) {
        const results = fuse.search(value);
        setMatches(results.map((result) => result.item));
      }
    } else {
      setMatches([]);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newCompany = {
      name: name,
      code: code.toUpperCase(),
      sales_units: [...units],
    };

    insertCompany(newCompany, {
      onSuccess: () => {
        toast({
          description: `Company ${code.toUpperCase()} and its ${
            units.length
          } sales unit/s have been created.`,
          variant: "success",
        });
        navigate("/companies");
      },
      onError: (error) =>
        toast({
          description: `${
            typeof error === "object" && error !== null && "error" in error
              ? (error as { error?: string }).error
              : "Please contact the IT developer."
          }`,
          variant: "destructive",
        }),
    });
  };
  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>Add Company | Sales Platform</title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">New Company</h1>
        <Button variant="link" type="button" asChild>
          <Link to="/companies">
            <ChevronLeft /> Back
          </Link>
        </Button>
      </header>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="company_name">
            <Building strokeWidth={1} />
          </Label>
          <Input
            id="company_name"
            placeholder="Enter company name"
            value={name}
            onChange={onNameChange}
            className={cn(
              "max-w-[500px] focus-visible:ring-0"
              //   error !== null
              //     ? "border-4 border-red-100 text-red-500 animate-buzz"
              //     : ""
            )}
          />
          <AnimatePresence>
            {matches.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-100 flex items-center gap-1 p-1 px-2 text-sm rounded-md animate-fade"
              >
                <p>Do you mean:</p>
                <div className="font-semibold italic text-slate-600">
                  {matches.map((match) => match.name).join(", ")}
                </div>
                {/* {JSON.stringify(matches)} */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="company_code">
            <CaseUpper strokeWidth={1} />
          </Label>
          <Input
            id="company_code"
            placeholder="Enter company code"
            value={code}
            onChange={(e) => {
              const { value } = e.target;

              setCode(value ?? "");
            }}
            className={cn("max-w-[500px] focus-visible:ring-0")}
          />
        </div>
        <ScrollArea className="h-[calc(100vh-24.5rem)] border rounded-md p-4">
          <fieldset
            className="transition-all opacity-100 disabled:opacity-50 disabled:select-none"
            disabled={name.trim().length === 0 || matches.length > 0}
          >
            <AnimatePresence>
              {units.length > 0 ? (
                <motion.div
                  key="with-sales-units"
                  className="flex flex-col gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: "spring", duration: 0.2 }}
                      className="w-fit ml-auto sticky top-0 z-10"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-1.5 px-2"
                        onClick={generateUnit}
                      >
                        <CirclePlus size={14} />
                        Add Sales Unit
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                  <AnimatePresence>
                    {units.map((unit, index) => {
                      return (
                        <motion.div
                          key={unit.temp_id}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          transition={{ type: "spring", duration: 0.2 }}
                          className="border rounded-md flex flex-col"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-full ml-auto"
                            onClick={() => removeUnit(index)}
                          >
                            <CircleX className="text-red-100" />
                          </Button>
                          <div className="px-4 pb-4 flex flex-col gap-4">
                            <div>
                              <Label htmlFor="unit_name" className="capitalize">
                                Name
                              </Label>
                              <Input
                                type="text"
                                id="unit_name"
                                value={unit.unit_name}
                                placeholder={`ex. Sales Unit ${index + 1}`}
                                onChange={(e) => {
                                  setUnits((prev) => {
                                    const updatedUnits = [...prev];
                                    updatedUnits[index] = {
                                      ...updatedUnits[index],
                                      unit_name: e.target.value,
                                    };

                                    return updatedUnits;
                                  });
                                }}
                              />
                            </div>
                            <div className="flex flex-col">
                              <Label
                                htmlFor="unit_head"
                                className="capitalize pb-1"
                              >
                                Head
                              </Label>
                              <ComboBox
                                title="head"
                                list={availableUnitHeads}
                                value={unit.unit_head.name}
                                setValue={(id, value) =>
                                  setHead(value, index, id)
                                }
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="unit_members"
                                className="capitalize"
                              >
                                Members
                              </Label>
                              <MultiComboBox
                                title="members"
                                list={availableUnitMembers}
                                value={unit.unit_members}
                                setValue={(id, action) =>
                                  setMembers(id, index, action)
                                }
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-sales-units"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.2 }}
                  className="-mt-1"
                >
                  <div className="text-sm text-gray-500 inline-flex items-center gap-1.5 pb-4 pt-2">
                    Start adding sales units by clicking
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 px-2"
                      onClick={generateUnit}
                    >
                      <CirclePlus size={14} />
                      Add Sales Unit
                    </Button>
                    button.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </fieldset>
        </ScrollArea>
        <Button
          type="submit"
          variant="ghost"
          disabled={!isReady}
          className="w-fit bg-main-100 hover:bg-main-700 text-white hover:text-white ml-auto px-6"
        >
          Submit
        </Button>
      </form>
    </Page>
  );
};

export default AddCompany;

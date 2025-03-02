import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Page from "@/misc/Page";
import { useCompany } from "@/providers/company.provider";
import classNames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building,
  CaseUpper,
  ChevronLeft,
  CircleAlert,
  CirclePlus,
  CircleX,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { v4 } from "uuid";
import { ComboBox } from "@/components/combobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MultiComboBox } from "@/components/multicombobox";
import { useUser } from "@/providers/users.provider";
import { SalesUnit } from "@/interfaces/user.interface";
import { List } from "@/interfaces";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

const EditCompany = () => {
  const ID = localStorage.getItem("company");
  const { companies, updateCompany, salesGroupCompanies } = useCompany();
  const { toast } = useToast();
  const { getResponseFromUserParamType, users } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [salesUnits, setSalesUnits] = useState<SalesUnit[]>([]);
  const [availableSalesUnits, setAvailableSalesUnits] = useState<List[]>([]);

  const createEmptySalesUnit = () => {
    const nextID = salesUnits.length > 0 ? salesUnits.length : 0;
    const storedID = localStorage.getItem(`unit_${nextID}`);
    setSalesUnits((prev) => {
      return [
        ...prev,
        {
          temp_id: storedID ? storedID : v4(),
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

  const removeSalesUnit = (index: number) => {
    const previousUnit = salesUnits[index];
    if (!/[a-zA-Z]/.test(previousUnit.temp_id)) {
      localStorage.setItem(`unit_${index}`, previousUnit.temp_id);
    }
    setSalesUnits((prev) => {
      return prev.filter((_, i) => i !== index);
    });
  };

  const setHead = (name: string, index: number, id: string) => {
    setSalesUnits((prev) => {
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
    if (availableSalesUnits.length === 0) return;

    setSalesUnits((prev) => {
      const updatedUnits = [...prev];
      const unit = updatedUnits[index];

      // Find the member in the current unit's members
      const existingMember = unit.unit_members.find(
        (member) => member.id === id
      );

      // Handle "action" (explicit removal)
      if (action && existingMember) {
        // Remove the member from the unit and add back to availableSalesUnits
        unit.unit_members = unit.unit_members.filter(
          (member) => member.id !== id
        );

        // Insert this member back into availableSalesUnits if it's not already there
        const availableMember = availableSalesUnits.find(
          (member) => member.id === id
        );
        if (!availableMember) {
          availableSalesUnits.push(existingMember);
        }
      } else {
        // Toggle add/remove logic when no explicit action is passed
        const isMemberInUnit = !!existingMember;

        // Remove member if they already exist, else add them
        unit.unit_members = isMemberInUnit
          ? unit.unit_members.filter((member) => member.id !== id) // Remove if exists
          : [
              ...unit.unit_members,
              availableSalesUnits.find((member) => member.id === id), // Add if not exists
            ];
      }

      updatedUnits[index] = { ...unit, unit_members: unit.unit_members };
      return updatedUnits;
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ID) return;

    const updatedCompany = {
      name: name,
      code: code.toUpperCase(),
      sales_units: [...salesUnits],
    };

    console.log(updatedCompany);
    const response = await updateCompany(ID, updatedCompany);
    console.log(response);
    if (response.acknowledged) {
      toast({
        description: `Company ${code.toUpperCase()} and its ${
          salesUnits.length
        } sales unit/s have been updated.`,
        variant: "success",
      });
    } else {
      toast({
        description: `${response.error || "Please contact the IT developer."}`,
        variant: "destructive",
      });
    }
  };

  // const companyNames = useMemo(() => {
  //   if (!companies) return [];

  //   if (companies.error) return [];

  //   const names = companies.map((company) => {
  //     return [
  //       company.name.replace(".", "").toLowerCase(),
  //       company.code.toLowerCase(),
  //     ];
  //   });
  //   return names.flat();
  // }, [companies]);

  const isReady = useMemo(() => {
    // Check if name or code is empty
    if (name === "" || code === "") return false;

    // Check if salesUnits is empty
    if (salesUnits.length === 0) return false;

    // Check if any unit has a value of 0

    const hasZeroValues = salesUnits.some((unit) =>
      Object.values(unit)
        .slice(0, 3)
        .some((value) => {
          if (typeof value === "object") {
            return Object.values(value).some((val) => val.length === 0);
          }
          return value.length === 0;
        })
    );
    if (hasZeroValues) return false;

    // All conditions pass, return true
    return true;
  }, [salesUnits, name, code]);

  // useEffect(() => {
  //   const setup = async () => {
  //     const response = await getResponseFromUserParamType(
  //       "available_sales_members"
  //     );

  //     if (Array.isArray(response)) {
  //       setAvailableSalesUnits(
  //         response.map((user) => {
  //           return {
  //             id: user.user_id,
  //             label: user.first_name + " " + user.last_name,
  //             value: user.first_name + " " + user.last_name,
  //             role: user.role_id,
  //           };
  //         })
  //       );
  //     }
  //   };
  //   setup();
  // }, []);

  useEffect(() => {
    if (!companies || !ID || !users) return;

    const current = companies.find((company) => company.ID === Number(ID));
    const salesTeam = users.filter((user) =>
      [3, 4, 5, 10].includes(user.role.role_id)
    );

    let tempAvailableUnits: List[] = [];

    if (current) {
      setCode(current.code);
      setName(current.name);

      const aeList: List[] = salesTeam.map((ae) => {
        return {
          id: String(ae.ID),
          label: ae.first_name + " " + ae.last_name,
          value: ae.first_name + " " + ae.last_name,
          role: ae.role.role_id,
        };
      });

      tempAvailableUnits = [...aeList];

      if (salesGroupCompanies) {
        const currentCompanySales = salesGroupCompanies.filter(
          (unit) => unit.company_id === Number(ID)
        );
        const currentSalesUnits: SalesUnit[] = currentCompanySales.map(
          (unit) => {
            return {
              temp_id: unit.sales_unit_id,
              unit_name: unit.sales_unit_name,
              unit_head: {
                id: unit.sales_unit_head?.user_id,
                name: unit.sales_unit_head?.full_name,
              },
              unit_members: unit.sales_unit_members.map((member) => {
                return {
                  id: member.user_id,
                  value: member.full_name,
                  label: member.full_name,
                  role: 5,
                };
              }),
            };
          }
        );
        const salesHeads: List[] = currentCompanySales.map((unit) => {
          return {
            id: String(unit.sales_unit_head?.user_id),
            label: unit.sales_unit_head?.full_name,
            value: unit.sales_unit_head?.full_name,
            role: 4,
          };
        });
        const salesMembers: List[] = currentCompanySales.flatMap((unit) => {
          const unit_members = unit.sales_unit_members;
          return unit_members.map((member) => {
            return {
              id: String(member.user_id),
              value: member.full_name,
              label: member.full_name,
              role: 5,
            };
          });
        });
        tempAvailableUnits = [
          ...tempAvailableUnits,
          ...salesHeads,
          ...salesMembers,
        ];
        console.log(
          Array.from(
            new Map(tempAvailableUnits.map((item) => [item.id, item])).values()
          )
        );
        setSalesUnits(currentSalesUnits);
      }
      setAvailableSalesUnits(
        Array.from(
          new Map(tempAvailableUnits.map((item) => [item.id, item])).values()
        )
      );
    }
  }, [ID, companies, salesGroupCompanies, users]);
  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>Edit Company | Sales Dashboard</title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">Edit Company</h1>
        <Button variant="link" type="button" asChild>
          <Link to="/companies">
            <ChevronLeft /> Back
          </Link>
        </Button>
      </header>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="flex items-center gap-2">
          <Label htmlFor="company_name">
            <Building strokeWidth={1} />
          </Label>
          <Input
            id="company_name"
            placeholder="Enter company name"
            value={name}
            onChange={(e) => {
              const { value } = e.target;

              setName(value);
              setCode(
                value
                  .split(" ")
                  .map((words) => words.substring(0, 1))
                  .join("")
              );

              // if (name !== value) {
              //   if (
              //     companyNames.includes(value.replace(".", "").toLowerCase())
              //   ) {
              //     setError(
              //       "The company you entered already exists in the system!"
              //     );
              //   } else {
              //     setError(null);
              //   }
              // } else {
              //   setError(null);
              // }
            }}
            className={classNames(
              "max-w-[500px] focus-visible:ring-0",
              error !== null
                ? "border-4 border-red-100 text-red-500 animate-buzz"
                : ""
            )}
          />
          <AnimatePresence>
            {error !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-100 text-white flex items-center gap-2 p-1 px-2 text-xs rounded-md animate-fade"
              >
                <CircleAlert size={12} />
                {error}
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
            className={classNames(
              "max-w-[500px] focus-visible:ring-0",
              error !== null
                ? "border-4 border-red-100 text-red-500 animate-buzz"
                : ""
            )}
          />
        </div>

        <ScrollArea className="h-[calc(100vh-24.5rem)] border rounded-md p-4">
          <fieldset
            className="transition-all opacity-100 disabled:opacity-50 disabled:select-none"
            disabled={name.trim().length === 0 || error !== null}
          >
            {salesUnits.length > 0 ? (
              <div className="flex flex-col gap-4">
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
                      onClick={createEmptySalesUnit}
                    >
                      <CirclePlus size={14} />
                      Add Sales Unit
                    </Button>
                  </motion.div>
                </AnimatePresence>
                <AnimatePresence>
                  {salesUnits.map((unit, index) => {
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
                          onClick={() => removeSalesUnit(index)}
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
                                setSalesUnits((prev) => {
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
                              list={availableSalesUnits.filter(
                                (unit) =>
                                  [4, 10].includes(Number(unit.role)) &&
                                  !salesUnits.some(
                                    (salesUnit) =>
                                      salesUnit.unit_head.id === unit.id
                                  )
                              )}
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
                              list={availableSalesUnits.filter(
                                (unit) =>
                                  [5, 10].includes(Number(unit.role)) &&
                                  !salesUnits.some((salesUnit) =>
                                    salesUnit.unit_members.some(
                                      (member) => member.id === unit.id
                                    )
                                  )
                              )}
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
              </div>
            ) : (
              <motion.div
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
                    onClick={createEmptySalesUnit}
                  >
                    <CirclePlus size={14} />
                    Add Sales Unit
                  </Button>
                  button.
                </div>
              </motion.div>
            )}
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

export default EditCompany;

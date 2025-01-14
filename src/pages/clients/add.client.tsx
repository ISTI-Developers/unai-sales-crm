import FormLabel from "@/components/formlabel";
import { MultiComboBox } from "@/components/multicombobox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fieldTypes } from "@/data/clients.keymap";
import { useToast } from "@/hooks/use-toast";
import { List } from "@/interfaces";
import { ClientForm, ClientWithContact } from "@/interfaces/client.interface";
import Fuse from "fuse.js";
import Page from "@/misc/Page";
import { useClient } from "@/providers/client.provider";
import { useCompany } from "@/providers/company.provider";
import { useUser } from "@/providers/users.provider";
import classNames from "classnames";
import { ChevronLeft } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
import { capitalize } from "@/lib/utils";
import { useMedium } from "@/providers/mediums.provider";

const AddClient = () => {
  const clientID = localStorage.getItem("client");
  const { id } = useParams();
  const { mediums, getMediumsOfCompany } = useMedium();
  const { toast } = useToast();
  const { users } = useUser();
  const navigate = useNavigate();
  const { salesGroupCompanies, companies } = useCompany();
  const {
    clientOptions,
    insertClient,
    updateClient,
    data: clients,
    getClients,
  } = useClient();

  const [client, setClient] = useState<ClientForm | null>(null);
  const [mediumOptions, setMediumOptions] = useState<List[]>([]);

  const updateMediums = (id: number) => {
    setClient((prev) => {
      const isSelected = prev.mediums.some(
        (medium) => medium?.id === String(id)
      );

      const updatedMediums = isSelected
        ? prev.mediums.filter((medium) => medium.id !== String(id))
        : [
            ...prev.mediums,
            mediumOptions.find((option) => option.id === String(id)),
          ];

      return {
        ...prev,
        mediums: updatedMediums,
      };
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!salesGroupCompanies || !clientOptions || !users || !companies) {
      console.log("not loaded");
      return;
    }
    const newClient = { ...client };
    const [industry, type, status, source] = clientOptions;

    const matchCompany = companies.find(
      (company) => company.name === newClient.company
    );
    const matchSU = salesGroupCompanies.find(
      (sg) => sg.sales_unit_name === newClient.sales_unit
    );
    const matchAE = users.find(
      (user) =>
        `${user.first_name} ${user.last_name}` === newClient.account_executive
    );
    const matchIndustry = industry.find(
      (ind) => ind.name === newClient.industry
    );
    const matchType = type.find((ind) => ind.name === newClient.type);
    const matchStatus = status.find((ind) => ind.name === newClient.status);
    const matchSource = source.find((ind) => ind.name === newClient.source);

    newClient.company = matchCompany?.ID || "";
    newClient.sales_unit = matchSU?.sales_unit_id || "";
    newClient.account_executive = matchAE?.ID || "";
    newClient.industry = matchIndustry?.misc_id || "";
    newClient.type = matchType?.misc_id || "";
    newClient.status = matchStatus?.misc_id || "";
    newClient.source = matchSource?.misc_id || "";
    newClient.mediums = newClient.mediums?.map((medium) => medium.id);

    let response = {
      acknowledged: false,
    };
    if (id) {
      response = await updateClient(newClient, clientID);
    } else {
      response = await insertClient(newClient);
    }
    console.log(response);

    if (response.acknowledged) {
      toast({
        description: `${
          id
            ? capitalize(id, "_") + " has been updated."
            : "A new client has been added."
        }`,
        variant: "success",
      });
      if (id) {
        localStorage.setItem("client", clientID);
        navigate(`../${id}`);
      } else {
        navigate("/clients", { replace: true });
      }
    } else {
      toast({
        description: `${response.error || "Please contact the IT developer."}`,
        variant: "destructive",
      });
    }
  };

  const suggestedClients = useMemo(() => {
    if (!clients || client === null) return [];

    const currentClients = clients.map((client) => ({
      client_id: client.client_id,
      name: client.name,
    }));
    const fuse = new Fuse(currentClients, {
      includeMatches: true,
      threshold: 0.4,
      keys: ["name"],
    });

    const results = fuse.search(client.name);

    if (results.length > 0) {
      return results.map((result) => {
        return {
          ...result.item,
          indices: result.matches?.map((match) => {
            return match.indices;
          }),
        };
      });
    } else {
      return [];
    }
  }, [client, clients]);

  const existingClient = useMemo(() => {
    if (!clients || client === null) return "";

    const currentClients = clients.map((client) => ({
      client_id: client.client_id,
      name: client.name,
    }));
    const fuse = new Fuse(currentClients, {
      threshold: 0,
      keys: ["name"],
    });

    const match = fuse.search(client.name);
    if (match.length !== 0) {
      return match[0].item.name;
    } else {
      return "";
    }
  }, [client, clients]);

  useEffect(() => {
    const setup = async () => {
      const response: ClientWithContact | null = await getClients(
        Number(clientID)
      );
      if (response) {
        setClient({
          name: response.name,
          industry: response.industry_name ?? "",
          brand: response.brand ?? "",
          company: response.company,
          sales_unit: response.sales_unit,
          account_executive: response.account_executive,
          status: response.status_name,
          mediums: response.mediums.map((medium) => {
            return {
              id: String(medium.medium_id),
              label: medium.name,
              value: medium.name,
            };
          }),
          contact_person: response.contact_person ?? "",
          designation: response.designation ?? "",
          contact_number: response.contact_number ?? "",
          email_address: response.email_address ?? "",
          address: response.address ?? "",
          type: response.type_name,
          source: response.source_name,
        });
      }
    };

    if (id) {
      setup();
    } else {
      setClient({
        name: "",
        industry: "",
        brand: "",
        company: "",
        sales_unit: "",
        account_executive: "",
        status: "",
        mediums: [],
        contact_person: "",
        designation: "",
        contact_number: "",
        email_address: "",
        address: "",
        type: "",
        source: "",
      });
    }
  }, [clientID, id]);

  useEffect(() => {
    if (!client?.company || !companies) return;

    const setup = async (companyID: number) => {
      const response = await getMediumsOfCompany(companyID);
      if (response) {
        setMediumOptions(
          response.map((medium) => {
            return {
              id: String(medium.ID),
              label: medium.name,
              value: medium.name,
            };
          })
        );
      }
    };

    if (client.company) {
      const company = companies.find((cp) => cp.name === client.company);

      if (company) {
        setup(company.ID);
      }
    }
  }, [client?.company, companies]);

  return (
    <Page className="flex flex-col gap-4 overflow-hidden">
      <Helmet>
        <title>
          {capitalize(id ?? "Add Client", "_")} | Clients | Sales CRM
        </title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">
          {capitalize(id ?? "Add Client", "_")}
        </h1>
        <Button variant="link" type="button" asChild>
          <Link to="/clients" onClick={() => localStorage.removeItem("client")}>
            <ChevronLeft /> Back
          </Link>
        </Button>
      </header>
      {client && (
        <form
          className="grid grid-cols-2 gap-4 overflow-y-auto"
          onSubmit={onSubmit}
          autoComplete="off"
        >
          <section className="rounded-md border p-4 w-full">
            <header className="font-bold pb-1 mb-1 border-b">
              Client Information
            </header>
            <div className="flex flex-col gap-4 pt-2">
              {Object.keys(client)
                .slice(0, 8)
                .map((key) => {
                  return (
                    <div
                      key={key}
                      className="grid grid-cols-[20%_80%] items-center"
                    >
                      <FormLabel id={key} label={key} />
                      {fieldTypes[key] === "text" ? (
                        <>
                          {key === "name" ? (
                            <div className="relative group">
                              <Input
                                id="client_name"
                                name="client_name"
                                value={String(client[key])}
                                className={classNames(
                                  "peer",
                                  existingClient && !clientID
                                    ? "border-red-100 border-4 bg-red-50 text-red-500"
                                    : ""
                                )}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  setClient((prev) => {
                                    return {
                                      ...prev,
                                      [key]: text,
                                    };
                                  });
                                }}
                              />
                              {suggestedClients.length !== 0 && (
                                <ul className="absolute left-0 w-full shadow bg-white z-10 rounded-b-md flex flex-col gap-2 opacity-0 pointer-events-none transition-all peer-focus:opacity-100 peer-focus:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto">
                                  {suggestedClients.map((suggestion) => {
                                    const indices = suggestion.indices;

                                    return (
                                      indices && (
                                        <li
                                          key={suggestion.name}
                                          className="hover:bg-slate-50 p-2 flex"
                                          onClick={() =>
                                            setClient((prev) => {
                                              return {
                                                ...prev,
                                                [key]: suggestion.name,
                                              };
                                            })
                                          }
                                        >
                                          {suggestion.name
                                            .split("")
                                            .map((char, index) => {
                                              const isBold = indices.some(
                                                (range) => {
                                                  return range.some(
                                                    ([start, end]) =>
                                                      index >= start &&
                                                      index <= end
                                                  );
                                                }
                                              );
                                              return (
                                                <p
                                                  className={
                                                    isBold
                                                      ? "font-bold text-red-100"
                                                      : "text-black text-opacity-90"
                                                  }
                                                >
                                                  {char === " " ? (
                                                    <>&nbsp;</>
                                                  ) : (
                                                    char
                                                  )}
                                                </p>
                                              );
                                            })}
                                        </li>
                                      )
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          ) : (
                            <Input
                              id={key}
                              name={key}
                              value={String(client[key])}
                              disabled={
                                !clientID && existingClient.length !== 0
                              }
                              onChange={(e) => {
                                setClient((prev) => {
                                  return {
                                    ...prev,
                                    [key]: e.target.value,
                                  };
                                });
                              }}
                            />
                          )}
                        </>
                      ) : fieldTypes[key] === "select" ? (
                        <SelectDropdown
                          client={client}
                          setClient={setClient}
                          id={key}
                          disabled={!clientID && existingClient.length !== 0}
                        />
                      ) : (
                        mediums && (
                          <MultiComboBox
                            title="mediums"
                            value={client[key]}
                            disabled={!clientID && existingClient.length !== 0}
                            list={mediumOptions}
                            setValue={updateMediums}
                          />
                        )
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
          <section className="rounded-md border p-4 w-full">
            <header className="font-bold pb-1 mb-1 border-b">
              Contact Person Information
            </header>
            <div className="flex flex-col gap-4 pt-2">
              {Object.keys(client)
                .slice(8)
                .map((key) => {
                  return (
                    <div
                      key={key}
                      className="grid grid-cols-[20%_80%] items-center"
                    >
                      <FormLabel id={key} label={key} />
                      {fieldTypes[key].match(/text|email/) ? (
                        <Input
                          type={fieldTypes[key]}
                          id={key}
                          name={key}
                          value={String(client[key])}
                          disabled={!clientID && existingClient.length !== 0}
                          onChange={(e) =>
                            setClient((prev) => {
                              return {
                                ...prev,
                                [key]: e.target.value,
                              };
                            })
                          }
                        />
                      ) : (
                        <SelectDropdown
                          client={client}
                          disabled={!clientID && existingClient.length !== 0}
                          setClient={setClient}
                          id={key}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
          <Button
            type="submit"
            variant="ghost"
            disabled={!clientID && existingClient.length !== 0}
            className="w-fit bg-main-100 hover:bg-main-700 text-white hover:text-white float-right flex gap-4 disabled:cursor-not-allowed col-[2/3] ml-auto"
          >
            {/* {loading && <LoaderCircle className="animate-spin" />} */}
            {id ? "Save" : "Submit"}
          </Button>
        </form>
      )}
    </Page>
  );
};

interface SelectDropdownProps {
  client: ClientForm;
  setClient: React.Dispatch<React.SetStateAction<ClientForm>>;
  id: keyof ClientForm;
  disabled: boolean;
}

const SelectDropdown = ({
  client,
  setClient,
  id,
  disabled,
}: SelectDropdownProps) => {
  const { users } = useUser();
  const { salesGroupCompanies, companies } = useCompany();
  const { clientOptions } = useClient();

  const options: List[] | [] = useMemo(() => {
    if (
      !client ||
      !clientOptions ||
      !users ||
      !salesGroupCompanies ||
      !companies
    )
      return [];

    switch (id) {
      case "company":
        return companies.map((company) => {
          return {
            id: company.ID,
            label: company.name,
            value: company.ID,
          };
        });
      case "sales_unit": {
        if (client.company === "") return [];

        const salesUnits = salesGroupCompanies.filter((su) => {
          return su.company_name === client.company;
        });
        if (salesUnits.length > 0) {
          return salesUnits.map(({ sales_unit_id, sales_unit_name }) => {
            return {
              id: sales_unit_id,
              label: sales_unit_name,
              value: sales_unit_id,
            };
          });
        }
        break;
      }
      case "account_executive": {
        if (client.sales_unit === "") return [];

        const salesUnit = salesGroupCompanies.find(
          (su) => su.sales_unit_name === client.sales_unit
        );
        if (salesUnit) {
          return users
            .filter((user) => {
              return (
                user.sales_unit !== null &&
                (user.role.role_id === 4 || user.role.role_id === 5) &&
                salesUnit.sales_unit_name === user.sales_unit.unit_name
              );
            })
            .sort((a, b) => a.role.role_id - b.role.role_id)
            .map(({ ID, first_name, last_name }) => {
              return {
                id: ID,
                label: first_name + " " + last_name,
                value: ID,
              };
            });
        }
        return [];
      }
      default: {
        const category = clientOptions.filter((option) =>
          option.some((opt) => opt.category === id)
        );

        if (Array.isArray(category)) {
          return category[0]
            .map(({ misc_id, name }) => {
              return {
                id: misc_id,
                label: name,
                value: misc_id,
              };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
        }
      }
    }
  }, [client, clientOptions, id, salesGroupCompanies, users, companies]);

  const statusMap: {
    [key: string]:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | null
      | undefined;
  } = {
    ACTIVE: "outline",
    HOT: "outline",
    POOL: "destructive",
    "ON/OFF": "secondary",
    "FOR ELECTIONS": "secondary",
  };

  const statusClasses: { [key: string]: string } = {
    ACTIVE: "bg-green-100 text-green-700 border-green-300",
    HOT: "bg-yellow-100 text-yellow-500 border-yellow-400",
    "ON/OFF": "bg-sky-100 text-sky-600 border-sky-400",
    "FOR ELECTIONS": "bg-sky-100 text-sky-600 border-sky-400",
  };

  return (
    options && (
      <Select
        value={String(client[id])}
        disabled={disabled}
        onValueChange={(value) =>
          setClient((prev) => {
            return {
              ...prev,
              [id]: value,
            };
          })
        }
      >
        <SelectTrigger>
          <SelectValue
            placeholder={`Select ${id.toString().replace(/_/g, " ")}`}
          />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            return (
              <SelectItem key={`${id}_${option.id}`} value={option.label}>
                {id === "status" ? (
                  <Badge
                    variant={statusMap[option.label]}
                    className={classNames(
                      statusClasses[option.label],
                      "uppercase"
                    )}
                  >
                    {option.label}
                  </Badge>
                ) : (
                  option.label
                )}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    )
  );
};
export default AddClient;

import ClientNameField from "@/components/clients/name.client";
import SelectField from "@/components/clients/select.client";
import FormLabel from "@/components/formlabel";
import { MultiComboBox } from "@/components/multicombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAllClientOptions } from "@/hooks/useClientOptions";
import { useClients, useCreateClient } from "@/hooks/useClients";
import {
  useCompanies,
  useCompanySalesUnits,
  useSalesUnits,
} from "@/hooks/useCompanies";
import { useMediums } from "@/hooks/useMediums";
import { useSalesUnitMembers, useUsers } from "@/hooks/useUsers";
import { List } from "@/interfaces";
import { ClientForm } from "@/interfaces/client.interface";
import Page from "@/misc/Page";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { FormEvent, ReactNode, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";

const AddClient = () => {
  const { isLoading } = useClients();
  const { industry: industries, source: sources, status: statuses, type: types } = useAllClientOptions();
  const { data: users } = useUsers();
  const { data: salesUnits } = useSalesUnits();
  const { data: companies } = useCompanies();
  const { data: mediums } = useMediums();
  const { mutate: insertClient, isPending } = useCreateClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [client, setClient] = useState<ClientForm | null>({
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
  const texts = [
    "contact_person",
    "designation",
    "contact_number",
    "email_address",
    "address",
  ];

  const dropdowns = [
    { id: "industry", type: "misc", data: industries },
    { id: "company", type: "company", data: companies },
    {
      id: "sales_unit",
      type: "salesUnit",
      data: useCompanySalesUnits(client?.company as string),
    },
    {
      id: "account_executive",
      type: "user",
      data: useSalesUnitMembers(client?.sales_unit as string),
    },
    { id: "status", type: "misc", data: statuses },
    { id: "type", type: "misc", data: types },
    { id: "source", type: "misc", data: sources },
  ];

  const updateMedium = (id: number) => {
    if (!mediums) return;

    setClient((prev) => {
      if (!prev) return prev;
      // Ensure mediums is always List[]
      const prevMediums = prev.mediums as List[];
      const isSelected = prevMediums.some((medium) => medium.id === String(id));

      const updatedMediums = isSelected
        ? prevMediums.filter((medium) => medium.id !== String(id))
        : [
          ...prevMediums,
          {
            id: String(id),
            label: mediums.find((option) => option.ID === id)?.name ?? "",
            value: mediums.find((option) => option.ID === id)?.name ?? "",
          },
        ];

      return {
        ...prev,
        mediums: updatedMediums,
      };
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !users ||
      !industries ||
      !sources ||
      !statuses ||
      !types ||
      !salesUnits ||
      !companies ||
      !mediums ||
      !client
    ) {
      return;
    }
    const matchCompany = companies.find(
      (company) => company.name === client.company
    );
    const matchSU = salesUnits.find(
      (sg) => sg.sales_unit_name === client.sales_unit
    );
    const matchAE = users.find(
      (user) =>
        `${user.first_name} ${user.last_name}` === client.account_executive
    );
    const matchIndustry = industries.find(
      (ind) => ind.name === client.industry
    );
    const matchType = types.find((ind) => ind.name === client.type);
    const matchStatus = statuses.find((ind) => ind.name === client.status);
    const matchSource = sources.find((ind) => ind.name === client.source);
    const mappedClient: ClientForm = {
      ...client,
      company: matchCompany?.ID || "",
      sales_unit: matchSU?.sales_unit_id || "",
      account_executive: matchAE?.ID || "",
      industry: matchIndustry?.misc_id || "",
      type: matchType?.misc_id || "",
      status: matchStatus?.misc_id || "",
      source: matchSource?.misc_id || "",
      mediums: client.mediums.map(
        (medium) => typeof medium !== "string" && medium.id
      ) as string[],
    };

    insertClient(mappedClient, {
      onSuccess: (data) => {
        if (data.acknowledged) {
          toast({
            description: "New Client has been added",
            variant: "success",
          });
          navigate("/clients", { replace: true });
        }
      },
      onError: (error) =>
        toast({
          description: `${typeof error === "object" && error !== null && "error" in error
            ? (error as { error?: string }).error
            : "Please contact the IT developer."
            }`,
          variant: "destructive",
        }),
    });
  };
  return (
    client && (
      <Page className="flex flex-col gap-4">
        <Helmet>
          <title>Add | Clients | Sales Platform</title>
        </Helmet>
        <header className="flex items-center justify-between border-b pb-1.5">
          <h1 className="text-blue-500 font-bold uppercase">Add Client</h1>
          <Button variant="link" type="button" asChild>
            <Link
              to="/clients"
              onClick={() => localStorage.removeItem("client")}
            >
              <ChevronLeft /> Back
            </Link>
          </Button>
        </header>
        <main>
          <form
            className="grid lg:grid-cols-2 gap-4"
            onSubmit={onSubmit}
            autoComplete="off"
          >
            <FormSection title="Client Information">
              <FormField id="name">
                <ClientNameField name={client.name} setClient={setClient} />
              </FormField>
              <FormField id="brand">
                <Input
                  id="brand"
                  value={client.brand}
                  disabled={isLoading}
                  onChange={(e) =>
                    setClient((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        brand: e.target.value,
                      };
                    })
                  }
                />
              </FormField>
              {dropdowns.slice(0, 5).map((field) => (
                <FormField key={field.id} id={field.id}>
                  <SelectField
                    client={client}
                    setClient={setClient}
                    field={field}
                  />
                </FormField>
              ))}
              <MediumField
                mediums={client.mediums as List[]}
                updateMedium={updateMedium}
              />
            </FormSection>
            <FormSection title="Contact Person Information">
              {texts.map((id) => {
                return (
                  <FormField id={id}>
                    <Input
                      id={id}
                      value={client[id] as string}
                      disabled={isLoading}
                      onChange={(e) =>
                        setClient((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            [id]: e.target.value,
                          };
                        })
                      }
                    />
                  </FormField>
                );
              })}
              {dropdowns.slice(5).map((field) => (
                <FormField key={field.id} id={field.id}>
                  <SelectField
                    client={client}
                    setClient={setClient}
                    field={field}
                  />
                </FormField>
              ))}
            </FormSection>
            <Button
              type="submit"
              variant="ghost"
              disabled={isPending}
              className="w-fit bg-main-100 hover:bg-main-700 text-white hover:text-white float-right flex gap-4 disabled:cursor-not-allowed lg:col-[2/3] ml-auto"
            >
              {isPending && <LoaderCircle className="animate-spin" />}
              Submit
            </Button>
          </form>
        </main>
      </Page>
    )
  );
};

const MediumField = ({
  mediums,
  updateMedium,
}: {
  mediums: List[];
  updateMedium: (id: number) => void;
}) => {
  const { data: options } = useMediums();
  return (
    <FormField id="mediums">
      <MultiComboBox
        title="mediums"
        value={mediums as List[]}
        list={
          options
            ? options.map((medium) => ({
              id: String(medium.ID),
              label: medium.name,
              value: medium.name,
            }))
            : []
        }
        setValue={(id) => updateMedium(Number(id))}
      />
    </FormField>
  );
};

const FormField = ({ id, children }: { id: string; children: ReactNode }) => {
  return (
    <div className="grid grid-cols-[1.25fr_4fr] items-center gap-2">
      <FormLabel id={id} label={id} />
      {children}
    </div>
  );
};

const FormSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <section className="rounded-md border p-4 w-full">
      <header className="font-bold pb-1 mb-1 border-b">{title}</header>
      <div className="flex flex-col gap-4 pt-2">{children}</div>
    </section>
  );
};

export default AddClient;

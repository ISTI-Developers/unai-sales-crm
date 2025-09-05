import FormLabel from '@/components/formlabel';
import { MultiComboBox } from '@/components/multicombobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAllClientOptions } from '@/hooks/useClientOptions';
import { useClient, useUpdateClient } from '@/hooks/useClients';
import { useCompanies, useCompanySalesUnits } from '@/hooks/useCompanies';
import { useMediums } from '@/hooks/useMediums';
import { List } from '@/interfaces';
import { ClientForm, ClientOptions } from '@/interfaces/client.interface';
import { MediumWithIDs } from '@/interfaces/mediums.interface';
import { SalesUnitMember } from '@/interfaces/user.interface';
import { capitalize } from '@/lib/utils';
import Page from '@/misc/Page';
import { useAuth } from '@/providers/auth.provider';
import { ChevronLeft, LoaderCircle } from 'lucide-react';
import { ChangeEvent, ChangeEventHandler, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';

type Option = { id: number; name: string }
const UpdateClient = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const ID = localStorage.getItem("client");

  const { data } = useClient(ID);
  const { data: companies, isLoading } = useCompanies();
  const { data: mediums } = useMediums();
  const salesUnits = useCompanySalesUnits(user?.company?.name);
  const clientOptions = useAllClientOptions();
  const { mutate: updateClient, isPending } = useUpdateClient(ID);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientForm | null>(null);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setClient(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [e.target.id]: e.target.value
      }
    })
  }
  const onSelectChange = (value: string, id: string) => {
    setClient(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [id as keyof typeof prev]: value
      }
    })
  }
  const onMultiSelectChange = (id: string) => {
    const selected = accountOptions.find(option => option.id === id);
    if (!selected) return;

    setClient(prev => {
      if (!prev) return prev;

      const exists = (prev.account_executive as List[]).some(
        exec => exec.id === selected.id
      );

      return {
        ...prev,
        account_executive: exists
          ? (prev.account_executive as List[]).filter(exec => exec.id !== selected.id) // remove
          : [...((prev.account_executive as List[]) ?? []), selected] // add
      };
    });
  };

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

  const getOptions = (id: string) => {
    const clientOption = clientOptions[id as keyof typeof clientOptions];

    if (clientOption) {
      return (clientOption as ClientOptions[]).map(item => {
        return {
          id: item.misc_id,
          name: item.name
        }
      })
    }

    return []
  }

  const companyOptions = useMemo(() => {
    if (!companies || isLoading) return [];

    return companies.map(company => {
      return {
        id: company.ID,
        name: company.name
      }
    })
  }, [companies, isLoading]);

  const salesOptions = useMemo(() => {
    if (!salesUnits || !client || client.company === "" || !companies) return [];

    const selectedCompany = companies.find(company => company.name === client.company);

    if (!selectedCompany) return [];
    const selectedSalesUnit = salesUnits.filter(unit => unit.company_id === selectedCompany.ID)

    if (!selectedSalesUnit) return [];

    return selectedSalesUnit.map(unit => {
      return {
        id: unit.sales_unit_id as number,
        name: unit.sales_unit_name
      }
    })
  }, [salesUnits, client, companies])

  const accountOptions = useMemo(() => {
    if (!client || !salesUnits) return [];

    // Collect ALL users from ALL sales units
    const allUsers = salesUnits.flatMap(unit => [
      {
        user_id: unit.sales_unit_head?.user_id,
        full_name: unit.sales_unit_head?.full_name,
        sales_unit_name: unit.sales_unit_name,
      },
      ...(unit.sales_unit_members as SalesUnitMember[]).map(member => ({
        user_id: member.user_id,
        full_name: member.full_name,
        sales_unit_name: unit.sales_unit_name,
      }))
    ]);

    // Split into selected vs others
    const selectedUsers = allUsers.filter(
      u => u.sales_unit_name === client.sales_unit
    );
    const otherUsers = allUsers.filter(
      u => u.sales_unit_name !== client.sales_unit
    );

    // Put selected unit's users first
    const orderedUsers = [...selectedUsers, ...otherUsers];

    // Map to dropdown option format
    return orderedUsers.map(user => ({
      id: String(user.user_id ?? ""),
      value: String(user.user_id ?? ""),
      label: user.full_name ?? "",
    }));
  }, [client, salesUnits]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!client) return;

    const data = {
      ...client,
      company: companyOptions.find(option => option.name === client.company)?.id,
      sales_unit: salesOptions.find(option => option.name === client.sales_unit)?.id,
      account_executive: (client.account_executive as List[]).map(account => account.id),
      industry: clientOptions.industry.find(item => item.name === client.industry)?.misc_id,
      type: clientOptions.type.find(item => item.name === client.type)?.misc_id,
      status: clientOptions.status.find(item => item.name === client.status)?.misc_id,
      source: clientOptions.source.find(item => item.name === client.source)?.misc_id,
      mediums: (client.mediums as List[]).map(medium => medium.id),
    }

    updateClient(data, {
      onSuccess: (data) => {
        if (data.acknowledged) {
          toast({
            description: `${capitalize(client.name)} has been updated.`,
            variant: "success",
          });
          localStorage.setItem("client", ID ?? "");
          navigate(`/clients/${id}`, { replace: true });
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
  }

  useEffect(() => {
    if (!data) return;

    setClient({
      name: data.name,
      industry: data.industry_name ?? "",
      brand: data.brand ?? "",
      company: data.company,
      sales_unit: data.sales_unit,
      account_executive: data.account_executives.map(item => {
        return {
          id: String(item.account_id),
          value: item.account_executive,
          label: item.account_executive,
        };
      }),
      status: data.status_name,
      mediums: data.mediums.map((medium: MediumWithIDs) => {
        return {
          id: String(medium.medium_id),
          label: medium.name,
          value: medium.name,
        };
      }),
      contact_person: (data.contact_person as string) ?? "",
      designation: (data.designation as string) ?? "",
      contact_number: (data.contact_number as string) ?? "",
      email_address: (data.email_address as string) ?? "",
      address: (data.address as string) ?? "",
      type: data.type_name as string,
      source: data.source_name as string,
    });
  }, [data]);

  const hasEditAccess = useMemo(() => {
    if (!user) return false;

    return user.role.role_id in [1, 3, 10, 11];
  }, [user]);

  return client && (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>Edit | Clients | Sales Platform</title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">Edit Client</h1>
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
        <form className='grid lg:grid-cols-2 gap-4' autoComplete='off' onSubmit={onSubmit}>
          <FormSection title='Client Information'>
            <InputField id='name' value={client['name']} disabled={false} onChange={onInputChange} />
            <InputField id='brand' value={client['brand']} disabled={false} onChange={onInputChange} />
            <SelectField id='industry' value={client['industry'] as string} disabled={false} onChange={onSelectChange} options={getOptions('industry')} />
            <SelectField id='company' value={client['company'] as string} disabled={true} onChange={onSelectChange} options={isLoading ? [] : companyOptions} />
            <SelectField id='sales_unit' value={client['sales_unit'] as string} disabled={!hasEditAccess} onChange={onSelectChange} options={salesOptions} />
            <AccountExecutiveField id='account_executive' options={accountOptions} value={client.account_executive as List[]} setValue={onMultiSelectChange} disabled={!hasEditAccess} />
            <SelectField id='status' value={client['status'] as string} disabled={!hasEditAccess} onChange={onSelectChange} options={getOptions('status')} />
            <MediumField
              mediums={client.mediums as List[]}
              updateMedium={updateMedium}
            />
          </FormSection>
          <FormSection title='Contact Information'>
            {Object.keys(client).slice(8, 13).map(field => {
              return <InputField id={field} value={client[field as keyof typeof client] as string} disabled={false} onChange={onInputChange} />
            })}
            <SelectField id='type' value={client['type'] as string} disabled={false} onChange={onSelectChange} options={getOptions('type')} />
            <SelectField id='source' value={client['source'] as string} disabled={false} onChange={onSelectChange} options={getOptions('source')} />
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
}

const AccountExecutiveField = ({ id, value, options, setValue, disabled }: { id: string, value: List[]; options: List[]; setValue: (id: string) => void; disabled?: boolean }) => {
  return <FormField id={id}>
    <MultiComboBox list={options} setValue={(id) => setValue(id)} title={id.replace("_", " ")} value={value} disabled={disabled} />
  </FormField>
}

const SelectField = ({ id, value, onChange, options, disabled }: { id: string; value: string; onChange: (value: string, id: string) => void; disabled: boolean, options: Option[] }) => {
  return <FormField id={id}>
    <Select
      value={value}
      disabled={disabled}
      required
      onValueChange={(value) => onChange(value, id)}>
      <SelectTrigger>
        <SelectValue placeholder={`Select ${id.replace(/_/g, " ")}`} />
      </SelectTrigger>
      <SelectContent>
        {options
          .filter((option) => option.id !== 0)
          .map((option) => {
            return (
              <SelectItem
                key={`${id}_${option.id}`}
                value={option.name}
                className="capitalize"
              >
                {option.name}
              </SelectItem>
            );
          })}
      </SelectContent>
    </Select>
  </FormField>
}

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
            ? options.filter(option => option.ID !== 0).map((medium) => ({
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

const InputField = ({ id, value, onChange, disabled }: { id: string; value: string; onChange: ChangeEventHandler<HTMLInputElement>; disabled: boolean }) => {
  return <FormField id={id}>
    <Input
      id={id}
      value={value}
      disabled={disabled}
      onChange={onChange}
    />
  </FormField>
}

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

export default UpdateClient
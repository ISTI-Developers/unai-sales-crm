import Page from "@/misc/Page";
import bulktemplate from "../../misc/bulktemplate.xlsx";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FileUpload from "@/components/clients/fileupload.clients";
import { memo, useMemo, useState } from "react";
import { ClientUpload } from "@/interfaces/client.interface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { capitalize, splitFullName } from "@/lib/utils";
import Row from "@/components/clients/row.clients";
import { useClient } from "@/providers/client.provider";
import { useUser } from "@/providers/users.provider";
import { useCompany } from "@/providers/company.provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRole } from "@/providers/role.provider";
import { List } from "@/interfaces";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import classNames from "classnames";

interface UserAccount {
  [key: string]: string;
  name: string;
  first_name: string;
  last_name: string;
  email_address: string;
  company: string;
  sales_unit: string;
  role: string;
}

const BulkAddClient = () => {
  const [data, setData] = useState<ClientUpload[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<UserAccount[]>([]);
  const [userForm, toggleUserForm] = useState<boolean>(false);
  const [processedClient, setProcessedClient] = useState<ClientUpload[] | null>(
    null
  );

  const { clientOptions, mediums, insertBatchClients } = useClient();
  const { users } = useUser();
  const { salesGroupCompanies, companies } = useCompany();

  const headers = useMemo(() => {
    if (!data) return [];

    return Object.keys(data[0]).map((key) => capitalize(key, "_"));
  }, [data]);

  const handleInputChange = (value: string, header: string, index: number) => {
    if (!data) return;

    const newData = structuredClone(data);

    newData[index] = {
      ...newData[index],
      [header]: value,
    };

    setData(newData);
  };

  const processClients = () => {
    if (
      !data ||
      !clientOptions ||
      !users ||
      !salesGroupCompanies ||
      !companies ||
      !mediums
    )
      return;

    const newData = structuredClone(data);

    const fullNames = users.map((user) => ({
      id: user.ID,
      name: `${user.first_name} ${user.last_name}`,
    }));

    newData.forEach((item) => {
      const ae = String(item.account_executive);
      const su = String(item.sales_unit).replace(/\s+/g, "");
      const company = String(item.company);
      const name = fullNames.find((name) =>
        name.name.toLowerCase().match(ae.toLowerCase())
      );
      const salesUnit = salesGroupCompanies.find((salesUnit) =>
        salesUnit.sales_unit_name.replace(/\s+/g, "").match(su)
      );
      const matchCompany = companies.find((comp) =>
        comp.name.toUpperCase().match(company.toUpperCase())
      );
      const [industryOptions, typeOptions, statusOptions, sourceOptions] =
        clientOptions;

      const matchedOptions = {
        industry:
          industryOptions.find((opt) => opt.name === item.industry)?.misc_id ??
          "",
        status:
          statusOptions.find((opt) => opt.name === item.status)?.misc_id ?? "",
        source:
          sourceOptions.find((opt) => opt.name === item.source)?.misc_id ?? "",
        type: typeOptions.find((opt) => opt.name === item.type)?.misc_id ?? "",
      };
      const matchMediums = mediums.filter((medium) => {
        if (item.mediums.length === 0) return false;

        const itemMediums = item.mediums.split(",");

        return itemMediums.some(
          (itemMedium) => itemMedium.trim() === medium.name
        );
      });

      item.sales_unit = salesUnit?.sales_unit_id ?? "";
      item.company = matchCompany?.ID ?? "";
      item.industry = matchedOptions.industry;
      item.status = matchedOptions.status;
      item.source = matchedOptions.source;
      item.type = matchedOptions.type;
      item.mediums = matchMediums.map((medium) => medium.ID);

      if (name) {
        item.account_executive = name.id;
      } else {
        const { first_name, last_name } = splitFullName(ae);
        setNames((prev) => [
          ...prev,
          {
            name: ae,
            first_name: first_name,
            last_name: last_name,
            email_address: "",
            company: "",
            sales_unit: "",
            role: "",
          },
        ]);
      }
    });

    setProcessedClient(newData);
  };

  const onClientSubmit = async () => {
    if (!processedClient) return;

    const response = await insertBatchClients(processedClient);
    console.log(response);
  };

  const onUserInfoChange = (value: string, accessor: string, index: number) => {
    setNames((prev) => {
      const updatedPrev = structuredClone(prev);

      updatedPrev[index] = {
        ...updatedPrev[index],
        [accessor]: value,
      };

      console.log(updatedPrev);
      return updatedPrev;
    });
  };

  const handleClose = (open: boolean) => {
    toggleUserForm(open);
    if (!open) {
      setNames([]);
    }
  };
  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>Add Multiple Clients | Clients | Sales CRM</title>
      </Helmet>
      <Dialog onOpenChange={handleClose} open={userForm}>
        <header className="flex items-center justify-between border-b pb-1.5">
          <h1 className="text-blue-500 font-bold uppercase">
            Add Multiple Clients
          </h1>
          <Button variant="link" type="button" asChild>
            <Link
              to="/clients"
              onClick={() => localStorage.removeItem("client")}
            >
              <ChevronLeft /> Back
            </Link>
          </Button>
        </header>
        <section className="bg-slate-50 rounded-md px-4">
          <Accordion type="single" collapsible defaultValue="guide">
            <AccordionItem value="guide" className="border-b-0">
              <AccordionTrigger>Batch Upload Guidelines</AccordionTrigger>
              <AccordionContent>
                <ol className="ml-4 list-decimal">
                  <li>
                    Download the{" "}
                    <a
                      href={bulktemplate}
                      className="underline text-main-400 font-bold"
                      target="_blank"
                      rel="noreferrer"
                      download={"Client Batch Upload Template"}
                    >
                      template attached
                    </a>{" "}
                    and fill in all required details. Required columns has a{" "}
                    <strong className="text-red-100">red asterisk (*)</strong>.
                  </li>
                  <li>Upload the completed file below.</li>
                  <li>
                    NOTE: This form only accepts up to{" "}
                    <strong>100 rows per upload</strong>.
                  </li>
                  <li>
                    Once uploaded, thoroughly review for any errors before
                    saving. Do not close the tab or the browser while the file
                    has not finished uploading yet.
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        <FileUpload setData={setData} setLoading={setLoading} />
        {data ? (
          <>
            <section
              key="datatable"
              className="relative max-h-[40vh] overflow-auto rounded-md border"
            >
              <Table>
                <TableHeader>
                  {headers.map((header) => (
                    <TableHead className="sticky top-0 bg-main-400 text-white shadow text-xs uppercase font-bold">
                      {header}
                    </TableHead>
                  ))}
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => {
                    const headers = Object.keys(item);
                    return (
                      <Row
                        key={item.client}
                        item={item}
                        item_index={index}
                        headers={headers}
                        handleInputChange={handleInputChange}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </section>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                onClick={processClients}
                className="w-fit bg-main-100 hover:bg-main-700 text-white hover:text-white ml-auto float-right flex gap-4 disabled:cursor-not-allowed"
              >
                {loading && <LoaderCircle className="animate-spin" />}
                Submit
              </Button>
            </DialogTrigger>
          </>
        ) : (
          <>{!data && loading ? "Loading..." : ""}</>
        )}
        <DialogContent
          className={classNames(names.length !== 0 ? "min-w-[50vw]" : "")}
        >
          <DialogHeader>
            <DialogTitle>
              {names.length !== 0
                ? "Complete Required Details"
                : "Add Multiple Clients"}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {names.length !== 0 ? (
              <>
                It looks like there are unregistered account executives. Before
                uploading these to the system, please complete the required
                details for the users listed below. If you cannot find their
                company and sales unit group, please create it first in the{" "}
                <Link to="/companies" className="text-blue-100 underline">
                  Companies
                </Link>
                page
              </>
            ) : (
              <>Are you sure you want to upload these clients?</>
            )}
          </DialogDescription>
          {names.length !== 0 && (
            <div className="relative max-h-[40vh] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  {[
                    "first_name",
                    "last_name",
                    "email_address",
                    "company",
                    "sales_unit",
                    "role",
                  ].map((header) => {
                    return (
                      <TableHead
                        key={header}
                        className="sticky top-0 bg-main-400 text-white shadow text-xs uppercase font-bold"
                      >
                        {capitalize(header, "_")}
                      </TableHead>
                    );
                  })}
                </TableHeader>
                <TableBody>
                  {names.map((user, index) => {
                    return (
                      <UserRow
                        user={user}
                        index={index}
                        onChange={onUserInfoChange}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                toggleUserForm(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onClientSubmit()}
              className="bg-main-100 hover:bg-main-400 text-white hover:text-white"
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* <Dialog>
        <DialogTrigger>Meee</DialogTrigger>
        <DialogContent>Hay</DialogContent>
      </Dialog> */}
    </Page>
  );
};

const UserRow = memo(
  ({
    user,
    index,
    onChange,
  }: {
    user: UserAccount;
    index: number;
    onChange: (value: string, accesor: string, index: number) => void;
  }) => {
    return (
      <TableRow>
        {Object.keys(user).map((detail) => {
          return (
            <UserCell
              key={detail}
              user={user}
              index={index}
              accessor={detail}
              onChange={onChange}
            />
          );
        })}
      </TableRow>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return prevProps.user === nextProps.user;
  }
);

const UserCell = ({
  user,
  accessor,
  onChange,
  index,
}: {
  user: UserAccount;
  accessor: string;
  index: number;
  onChange: (value: string, accessor: string, index: number) => void;
}) => {
  const { salesGroupCompanies, companies } = useCompany();
  const { roles } = useRole();
  const [rolesOptions, salesUnits, companyOptions]: List[][] = useMemo(() => {
    if (!roles || !salesGroupCompanies || !companies) return [[], [], []];

    return [
      roles
        .filter((role) => role.role_id > 2)
        .map((role) => {
          return {
            id: role.role_id,
            value: role.name,
            label: role.name,
          };
        }),
      salesGroupCompanies.map((su) => {
        return {
          id: su.sales_unit_id,
          value: su.sales_unit_name,
          label: su.sales_unit_name,
        };
      }),
      companies.map((company) => {
        return {
          id: company.ID,
          value: company.name,
          label: company.name,
        };
      }),
    ];
  }, [roles, salesGroupCompanies, companies]);

  return (
    accessor !== "name" && (
      <TableCell>
        {["company", "sales_unit", "role"].includes(accessor) ? (
          <Select value={user[accessor]}>
            <SelectTrigger>
              <SelectValue
                placeholder={`Select ${capitalize(accessor, "_")}`}
              />
            </SelectTrigger>
            <SelectContent>
              {accessor === "role"
                ? rolesOptions.map((option, index) => {
                    return (
                      <SelectItem
                        key={`${accessor}_${index}`}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    );
                  })
                : accessor === "sales_unit"
                ? salesUnits.map((option, index) => {
                    return (
                      <SelectItem
                        key={`${accessor}_${index}`}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    );
                  })
                : companyOptions.map((option, index) => {
                    return (
                      <SelectItem
                        key={`${accessor}_${index}`}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    );
                  })}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type="text"
            value={user[accessor]}
            className="w-max"
            onChange={(e) => {
              onChange(e.target.value, accessor, index);
            }}
          />
        )}
      </TableCell>
    )
  );
};
export default BulkAddClient;

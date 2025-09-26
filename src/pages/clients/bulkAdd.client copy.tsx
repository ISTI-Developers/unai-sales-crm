import Page from "@/misc/Page";
import bulktemplate from "../../misc/bulktemplate.xlsx";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FileUpload from "@/components/clients/fileupload.clients";
import { useMemo, useState } from "react";
import { ClientUpload } from "@/interfaces/client.interface";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
} from "@/components/ui/table";
import { capitalize, splitFullName } from "@/lib/utils";
import Row from "@/components/clients/row.clients";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Fuse from "fuse.js";
import { useToast } from "@/hooks/use-toast";
import { useBatchInsertClients } from "@/hooks/useClients";
import { useMediums } from "@/hooks/useMediums";
import { useAllClientOptions } from "@/hooks/useClientOptions";
import { useUsers } from "@/hooks/useUsers";
import { useCompanies, useSalesUnits } from "@/hooks/useCompanies";

const BulkAddClient = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [data, setData] = useState<ClientUpload[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [userForm, toggleUserForm] = useState<boolean>(false);
  const [processedClient, setProcessedClient] = useState<ClientUpload[] | null>(
    null
  );

  const { industry, source, status, type } = useAllClientOptions();
  const { data: users } = useUsers();
  const { data: salesUnits } = useSalesUnits();
  const { data: companies } = useCompanies();
  const { data: mediums } = useMediums();
  const { mutate: insertBatchClients } = useBatchInsertClients();

  const headers = useMemo(() => {
    if (!data || data.length === 0) return [];

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
      !users ||
      !salesUnits ||
      !companies ||
      !mediums ||
      !industries ||
      !sources ||
      !statuses ||
      !types
    )
      return;
    const newData = structuredClone(data);

    const fullNames = users.map((user) => ({
      id: user.ID,
      name: `${user.first_name} ${user.last_name}`,
    }));
    const fuse = new Fuse(fullNames, {
      includeMatches: true,
      threshold: 0.6,
      keys: ["name"],
    });

    newData.forEach((item) => {
      const ae = String(item.account_executive);
      const su = String(item.sales_unit).replace(/\s+/g, "");
      const company = String(item.company);
      const name = fuse.search(ae);
      const salesUnit = salesUnits.find((salesUnit) =>
        salesUnit.sales_unit_name.replace(/\s+/g, "").match(su)
      );
      const matchCompany = companies.find((comp) =>
        comp.name.toUpperCase().match(company.toUpperCase())
      );
      const matchedOptions = {
        industry:
          industries.find((opt) => opt.name === item.industry)?.misc_id ?? 0,
        status: statuses.find((opt) => opt.name === item.status)?.misc_id ?? 0,
        source: sources.find((opt) => opt.name === item.source)?.misc_id ?? 0,
        type: types.find((opt) => opt.name === item.type)?.misc_id ?? 0,
      };
      const matchMediums = mediums.filter((medium) => {
        if (item.mediums.length === 0) return false;

        const itemMediums = item.mediums.split(",");

        return itemMediums.some((itemMedium) => {
          return medium.name
            .toUpperCase()
            .match(itemMedium.trim().toUpperCase());
        });
      });

      const mediumIDs =
        matchMediums.length > 0 ? matchMediums.map((medium) => medium.ID) : [0];

      item.sales_unit = salesUnit?.sales_unit_id ?? "";
      item.company = matchCompany?.ID ?? "";
      item.industry = matchedOptions.industry;
      item.status = matchedOptions.status;
      item.source = matchedOptions.source;
      item.type = matchedOptions.type;
      item.mediums = mediumIDs;

      if (name.length > 0) {
        item.account_executive = name[0].item.id;
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

    insertBatchClients(processedClient, {
      onSuccess: () => {
        toggleUserForm(false);
        toast({
          description: `New Clients have been added.`,
          variant: "success",
        });
        navigate("/clients", { replace: true });
      },
      onError: (error) => {
        toast({
          description: `${error}`,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>Add Multiple Clients | Clients | Sales Platform</title>
      </Helmet>
      <Dialog onOpenChange={toggleUserForm} open={userForm}>
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
        <DialogContent className="min-w-[50vw]">
          <DialogHeader>
            <DialogTitle>Add Multiple Clients</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to upload these clients?
          </DialogDescription>
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
    </Page>
  );
};
export default BulkAddClient;

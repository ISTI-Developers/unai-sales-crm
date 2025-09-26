import FileUpload from "@/components/clients/fileupload.clients";
import ClientUploadNotes from "@/components/clients/notes.clientUpload";
import Row from "@/components/clients/row.clients";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableHead, TableHeader } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useAllClientOptions } from "@/hooks/useClientOptions";
import { useBatchInsertClients } from "@/hooks/useClients";
import { useCompanies, useSalesUnits } from "@/hooks/useCompanies";
import { useMediums } from "@/hooks/useMediums";
import { useUsers } from "@/hooks/useUsers";
import { ClientUpload } from "@/interfaces/client.interface";
import { findMatch } from "@/lib/fetch";
import { capitalize } from "@/lib/utils";
import Page from "@/misc/Page";
import Fuse from "fuse.js";
import { ChevronLeft, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";

const BulkAddClient = () => {

  const [data, setData] = useState<ClientUpload[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [userForm, toggleUserForm] = useState<boolean>(false);
  const [processedClient, setProcessedClient] = useState<ClientUpload[] | null>(
    null
  );

  const navigate = useNavigate();

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
      !industry ||
      !source ||
      !status ||
      !type
    ) { return; }

    const clients = structuredClone(data);

    const fullNames = users.map((user) => ({
      id: user.ID,
      name: `${user.first_name} ${user.last_name}`,
    }));
    const fuse = new Fuse(fullNames, {
      includeMatches: true,
      threshold: 0.4,
      keys: ["name"],
    });

    const mappedClients = clients.map(client => {
      const account = client.account_executive as string;
      const unit = String(client.sales_unit).replace(/\s+/g, "")
      const company = String(client.company);

      const unitItem = findMatch(salesUnits, "sales_unit_name", unit, (s) => s.replace(/\s+/g, ""))
      const companyItem = findMatch(companies, "name", company, (s) => s.toUpperCase());
      const industryItem = findMatch(industry, "name", String(client.industry))
      const statusItem = findMatch(status, "name", String(client.status))
      const sourceItem = findMatch(source, "name", String(client.source))
      const typeItem = findMatch(type, "name", String(client.type))

      const accounts = account.split(",").map(acc => acc.trim());

      const matchUsers = accounts.flatMap(acc => {
        const results = fuse.search(acc);
        return results.map(result => result.item); // result.item is from fullNames
      });

      const matchMediums = mediums.filter((medium) => {
        if (!client.mediums) return false;

        const itemMediums = client.mediums
          .split(",")
          .map((m) => m.trim().toUpperCase());

        return itemMediums.some((itemMedium) =>
          medium.name.toUpperCase().includes(itemMedium)
        );
      });

      const mediumIDs =
        matchMediums.length > 0 ? matchMediums.map((medium) => medium.ID) : [0];

      return {
        ...client,
        sales_unit: unitItem.sales_unit_id as number,
        company: companyItem.ID,
        industry: industryItem.misc_id,
        status: statusItem.misc_id,
        source: sourceItem.misc_id,
        type: typeItem.misc_id,
        mediums: JSON.stringify(mediumIDs),
        account_executive: JSON.stringify(matchUsers ? matchUsers.map(user => user.id) : [0])
      }
    })

    setProcessedClient(mappedClients);
  }

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
      <ClientUploadNotes />
      <Dialog onOpenChange={toggleUserForm} open={userForm}>
        <FileUpload setData={setData} setLoading={setLoading} />
        {data ? <>
          <section
            key="datatable"
            className="relative max-h-[50vh] overflow-auto rounded-md border"
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
                      key={`${item.client}-${index}`}
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
        </> : <>{!data && loading ? "Loading..." : ""}</>}
        <DialogContent>
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

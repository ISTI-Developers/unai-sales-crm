import ClientHistory from "@/components/clients/history.clients";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { ClientWithContact } from "@/interfaces/client.interface";
import { capitalize, cn, colors } from "@/lib/utils";
import Page from "@/misc/Page";
import { useClient } from "@/providers/client.provider";
import { ChevronLeft } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const ManageClient = () => {
  const clientID = localStorage.getItem("client");
  const { getClients } = useClient();
  const [client, setClient] = useState<ClientWithContact | null>(null);

  useEffect(() => {
    const setup = async () => {
      const response = await getClients(Number(clientID));
      if (!Array.isArray(response)) {
        // console.log(response);
        setClient(response);
      }
    };

    if (clientID) {
      //fetch client from database
      setup();
    }
  }, [clientID]);

  const mediums = useMemo(() => {
    if (!client) return <></>;

    return (
      <div className="flex flex-wrap gap-1.5">
        {client.mediums.map((medium) => {
          const index = medium.medium_id % colors.length;

          const color = colors[index] ?? "#233345";
          return (
            <Badge
              key={medium.cm_id}
              variant="outline"
              className="text-white"
              style={{ backgroundColor: color }}
            >
              {medium.name}
            </Badge>
          );
        })}
      </div>
    );
  }, [client]);

  const industry = useMemo(() => {
    if (!client) return <>N/A</>;

    if (client.industry) {
      const color = colors[client.industry - 1] ?? "#233345";
      return (
        <div>
          <Badge
            variant="outline"
            className="text-white"
            style={{ backgroundColor: color }}
          >
            {client.industry_name}
          </Badge>
        </div>
      );
    }
    return <>N/A</>;
  }, [client]);

  const status = useMemo(() => {
    if (!client) return <>N/A</>;

    const name = client.status_name.toLowerCase();
    const statusMap: {
      [key: string]:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | null
        | undefined;
    } = {
      active: "outline",
      hot: "outline",
      pool: "destructive",
      "on/off": "secondary",
      "for elections": "secondary",
    };

    const statusClasses: { [key: string]: string } = {
      active: "bg-green-100 text-green-700 border-green-300",
      hot: "bg-yellow-100 text-yellow-500 border-yellow-400",
      "on/off": "bg-sky-100 text-sky-600 border-sky-400",
      "for elections": "bg-sky-100 text-sky-600 border-sky-400",
    };

    return (
      <div>
        <Badge
          variant={statusMap[name]}
          className={cn(statusClasses[name], "uppercase")}
        >
          {client.status_name}
        </Badge>
      </div>
    );
  }, [client]);

  const testHistory = [
    {
      date: "2024-10-01T10:10:20Z",
      action: "Transferred ownership from Marjorie Dizon to Earle Jan Capitan",
      author: "Vincent Kyle Riñoza",
    },
    {
      date: "2024-08-01T10:10:20Z",
      action: "Updated status from HOT to POOL",
      author: "System",
    },
    {
      date: "2024-07-23T07:21:39Z",
      action: "Removed contact person",
      author: "Some sales admin",
    },
    {
      date: "2024-07-10T03:43:06Z",
      action: "Client Acquired",
      author: "Some sales admin",
    },
  ];
  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>{capitalize(client?.name ?? "")} | Clients | Sales CRM</title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">
          {capitalize(client?.name ?? "")}
        </h1>
        <Button variant="link" type="button" asChild>
          <Link to="/clients" onClick={() => localStorage.removeItem("client")}>
            <ChevronLeft /> Back
          </Link>
        </Button>
      </header>

      <Dialog>
        {client && (
          <main className="grid grid-cols-2 gap-4">
            <Container title="Client Information">
              <Field
                id="brand"
                label="brand"
                value={
                  client.brand
                    ? client.brand.length !== 0
                      ? client.brand
                      : "N/A"
                    : "N/A"
                }
              />
              <Field id="industry" label="industry" value={industry} />
              <Field id="mediums" label="medium" value={mediums} />
              <Field id="status" label="status" value={status} />
            </Container>
            <Container title="Sales Information">
              <Field
                id="account_executive"
                label="account_executive"
                value={client.account_executive}
              />
              <Field
                id="sales_unit"
                label="sales_unit"
                value={client.sales_unit}
              />
              <Field id="company" label="company" value={client.company} />
            </Container>
            <Container
              title="Contact Person Information"
              className="col-span-2"
            >
              <div className="grid grid-cols-2 grid-rows-4 gap-4 gap-x-12 grid-flow-col">
                {[
                  "contact_person",
                  "designation",
                  "email_address",
                  "contact_number",
                  "address",
                  "type",
                  "source",
                ].map((field, index) => {
                  const value = index > 4 ? field + "_name" : field;
                  return (
                    <Field
                      key={field}
                      id={field}
                      label={field}
                      value={client[value] ? client[value] : "N/A"}
                    />
                  );
                })}
              </div>
            </Container>
            <Container title="history" className="col-span-2">
              <ClientHistory
                clientIDs={[client.client_id, client.client_account_id]}
              />
            </Container>
            <Button
              asChild
              type="button"
              onClick={() =>
                localStorage.setItem("client", String(client.client_id))
              }
              className="w-fit col-end-3 ml-auto bg-main-400 text-white hover:bg-main-700 hover:text-white"
            >
              <Link to={`./edit`}>Edit</Link>
            </Button>
          </main>
        )}
      </Dialog>
    </Page>
  );
};

export const Container = ({
  title,
  children,
  className,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) => {
  return (
    <section
      className={cn("rounded-md border p-1 px-2 pb-3.5 shadow-sm", className)}
    >
      <header className="font-bold border-b pl-2 py-2 capitalize flex justify-between items-center">
        {title}
        {title === "history" && (
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-red-300 text-white hover:bg-red-500 hover:text-white"
            >
              View full history
            </Button>
          </DialogTrigger>
        )}
      </header>
      <div className="flex flex-col gap-4 pt-2 px-2">{children}</div>
    </section>
  );
};

const Field = ({
  id,
  label,
  value,
}: {
  id: string;
  label: string;
  value: ReactNode;
}) => {
  return (
    <div className="grid grid-cols-[30%_70%] gap-4 items-center">
      <Label htmlFor={id} className="capitalize font-semibold">
        {capitalize(label, "_")}
      </Label>
      {value}
    </div>
  );
};

export default ManageClient;

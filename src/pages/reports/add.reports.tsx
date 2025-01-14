import { ComboBox } from "@/components/combobox";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { List } from "@/interfaces";
import { UserClients } from "@/interfaces/client.interface";
import { capitalize } from "@/lib/utils";
import Page from "@/misc/Page";
import { useClient } from "@/providers/client.provider";
import { format, getWeekOfMonth } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const AddReport = () => {
  const { getClientsByUser } = useClient();
  const user = localStorage.getItem("currentUser");
  const storedClient = localStorage.getItem("storedClient");

  const [clients, setClients] = useState<List[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectectedClient, setSelectedClient] = useState<List | null>(null);
  const activityRef = useRef(null);

  const onClientSelection = (id: string) => {
    const client = clients.find((client) => client.id === id);
    if (client) {
      setSelectedClient(client);
    }
  };

  useEffect(() => {
    if (!user) return;
    const userID = JSON.parse(user).ID;
    const setup = async () => {
      const response: UserClients[] = await getClientsByUser(userID);

      console.log(response);
      if (response.length > 0) {
        setClients(
          response.map((item) => {
            return {
              id: String(item.client_id),
              value: item.name,
              label: item.name,
            };
          })
        );
        if (storedClient) {
          console.log(storedClient);
          const client: List = JSON.parse(storedClient);
          setSelectedClient(client);
        }
      }
    };
    setup();
  }, [user, storedClient]);

  return (
    <Page className="flex flex-col gap-4 overflow-hidden">
      <Helmet>
        <title>New Report | Reports | Sales CRM</title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">New Report</h1>
        <Button variant="link" type="button" asChild>
          <Link
            to="/reports"
            onClick={() => localStorage.removeItem("reports")}
          >
            <ChevronLeft /> Back
          </Link>
        </Button>
      </header>
      <main>
        <form className="w-full max-w-[800px] flex flex-col gap-4 pb-4">
          <ReportField id="date">
            <div className="flex items-center gap-4">
              <DatePicker date={date} onDateChange={setDate} disabled />
              {date && (
                <p className="text-sm text-gray-500">{`Week ${getWeekOfMonth(
                  date
                )} of ${format(date, "MMMM")}`}</p>
              )}
            </div>
          </ReportField>
          <ReportField id="client">
            <ComboBox
              list={clients}
              setValue={onClientSelection}
              title="clients"
              value={selectectedClient?.label ?? ""}
            />
          </ReportField>
          <ReportField id="activity">
            <Textarea
              ref={activityRef}
              placeholder="Write your accomplishments for this week..."
            />
          </ReportField>
        </form>
      </main>
    </Page>
  );
};

const ReportField = ({ id, children }: { id: string; children: ReactNode }) => {
  return (
    <div className="grid grid-cols-[20%_80%] items-center">
      <Label htmlFor={id}>{capitalize(id, "_")}</Label>
      {children}
    </div>
  );
};

export default AddReport;

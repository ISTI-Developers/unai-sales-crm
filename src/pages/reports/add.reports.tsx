import { ComboBox } from "@/components/combobox";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateWeeks } from "@/data/reports.columns";
import { useToast } from "@/hooks/use-toast";
import { List } from "@/interfaces";
import { UserClients } from "@/interfaces/client.interface";
import { User } from "@/interfaces/user.interface";
import { capitalize } from "@/lib/utils";
import Page from "@/misc/Page";
import { useClient } from "@/providers/client.provider";
import { useReports } from "@/providers/reports.provider";
import { getISOWeek } from "date-fns";
import { ChevronLeft } from "lucide-react";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";

const AddReport = ({ selected }) => {
  const { getClientsByUser } = useClient();
  const { insertReport } = useReports();
  const user = localStorage.getItem("currentUser");
  const storedClient = localStorage.getItem("storedClient");
  const { toast } = useToast();
  const navigate = useNavigate();

  const [clients, setClients] = useState<List[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectectedClient, setSelectedClient] = useState<List | null>(null);
  const activityRef = useRef<HTMLTextAreaElement>(null);

  const onClientSelection = (id: string) => {
    const client = clients.find((client) => client.id === id);
    if (client) {
      setSelectedClient(client);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectectedClient || !activityRef.current || !user) {
      toast({
        title: "Error",
        description: "Please fill out the form completely.",
        variant: "destructive",
      });
      return;
    }
    const account: User = JSON.parse(user);
    const report = activityRef.current.value;
    const dateSubmitted = date ?? new Date();
    const response = await insertReport(
      Number(selectectedClient.id),
      account.sales_unit?.sales_unit_id ?? 0,
      Number(account.ID),
      dateSubmitted.toISOString(),
      report
    );
    // console.log(response);
    if (typeof response === "object") {
      if ("acknowledged" in response && response.acknowledged) {
        toast({
          description: `Role update success!`,
          variant: "success",
        });
        navigate("/reports");
      } else {
        toast({
          title: "Role Update Error",
          description: `ERROR: ${
            response.error ||
            "An error has occured. Send a ticket to the developer."
          }`,
          variant: "destructive",
        });
      }
    }
  };

  const currentWeek = useMemo(() => {
    const weeks = generateWeeks();
    const yearWeek = getISOWeek(date ?? new Date());
    return weeks[yearWeek - 1];
  }, [date]);

  useEffect(() => {
    if (!user) return;
    const userID = JSON.parse(user).ID;
    const setup = async () => {
      const response: UserClients[] = await getClientsByUser(userID);

      if (response.length > 0) {
        setClients(
          response.map((item) => {
            const hasDate = item.has_report;
            const hasReport = hasDate
              ? getISOWeek(new Date(item.has_report)) === getISOWeek(new Date())
              : false;
            return {
              id: String(item.client_id),
              value: item.name,
              label: item.name,
              disabled: hasReport,
            };
          })
        );
        if (storedClient) {
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
        <form onSubmit={onSubmit}>
          <div className="w-full max-w-[800px] flex flex-col gap-4 pb-4">
            <ReportField id="date">
              <div className="flex items-center gap-4">
                <DatePicker date={date} onDateChange={setDate} disabled />
                <p className="text-sm">{date && currentWeek}</p>
              </div>
            </ReportField>
            {JSON.stringify(selectectedClient)}
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
          </div>
          <Button
            type="submit"
            variant="ghost"
            className="w-fit bg-main-400 hover:bg-main-700 text-white hover:text-white float-right flex gap-4 disabled:cursor-not-allowed col-[2/3] ml-auto"
          >
            {/* {loading && <LoaderCircle className="animate-spin" />} */}
            Submit
          </Button>
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

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/providers/auth.provider";
import { capitalize } from "@/lib/utils";
import { DatePicker } from "../ui/datepicker";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { BookingTable } from "@/interfaces/sites.interface";
import { Booking, useCreateBooking } from "@/hooks/useBookings";
import { toast } from "@/hooks/use-toast";
import { useSite } from "@/hooks/useSites";
import { addDays, differenceInDays } from "date-fns";
import { List } from "@/interfaces";
import { MultiComboBox } from "../multicombobox";
import { v4 } from "uuid";
import { Loader2 } from "lucide-react";
import InputNumber from "../ui/number-input";
import { Notification, sendNotification } from "@/hooks/useNotifications";

const CreateBookingDialog = ({
  onOpenChange,
  site,
  remainingDays,
}: {
  site: BookingTable;
  remainingDays?: number;
  onOpenChange: (open: boolean) => void;
}) => {
  const { user } = useAuth();
  const { data: users } = useUsers();
  const { data, isLoading, fetchStatus } = useUsers();
  const { mutate: createBooking } = useCreateBooking(site.site);
  const { data: site_info } = useSite(site.site);
  const [send, onSend] = useState(false);

  const [booking, setBooking] = useState({
    srp: String(site_info?.price ?? 0),
    booking_status: remainingDays && remainingDays > 60 ? "RENEWAL" : "NEW",
    client: remainingDays && remainingDays > 60 ? site.product ? `${site.client}(${site.product})` : "" : "",
    account_executive: [] as List[],
    start: new Date(site.date_from ?? new Date()),
    end: new Date(),
    monthly_rate: "0",
    remarks: "",
  });
  const salesUnits = useMemo<List[]>(() => {
    if (!data || isLoading || !user || fetchStatus !== "idle") return [];
    return data
      .filter(
        (item) =>
          item.company?.ID === user.company?.ID && item.sales_unit !== null
      )
      ?.map((user) => {
        return {
          id: String(user.ID),
          value: capitalize(`${user.first_name} ${user.last_name}`),
          label: capitalize(`${user.first_name} ${user.last_name}`),
        };
      });
  }, [data, user, isLoading, fetchStatus]);

  const options = useMemo(() => {
    return [...salesUnits, { id: v4(), value: "Other (JV Partner)", label: "Other (JV Partner)" }, { id: v4(), value: "Others (In-house account)", label: "Others (In-house account)" }];
  }, [salesUnits]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBooking((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSend(true);
    createBooking(
      {
        ...booking,
        site_rental: String(site.site_rental ?? 0),
        old_client: site.product ? `${site.client}(${site.product})` : "---",
      },
      {
        onSuccess: async (data, variables) => {
          if (data?.acknowledged) {

            // if (import.meta.env.MODE === "development") {

            let body = `Site ${site.site} has a new booking.`;

            if (variables.booking_status === "CANCELLED") {
              body = `Site ${site.site}'s booking has been cancelled.`
            } else if (variables.booking_status === "QUEUEING") {
              body = `A reservation for site ${site.site} has been made.`
            } else if (variables.booking_status === "RENEWAL") {
              body = `Site ${site.site}'s booking has been renewed.`
            } else if (variables.booking_status === "PRE-TERMINATION") {
              body = `Site ${site.site} has been pre-terminated.`;
            }

            if (import.meta.env.MODE === "development"){
              body = `IT TESTING: ${body}`;
            }

            const response = await notifyBooking(body, data.id!);
            if (response) {
              toast({
                variant: "success",
                title: "Booking created!",
                description: "Successfully created a booking!",
              });
            }
            // }
          } else {
            toast({
              variant: "success",
              title: "Booking created!",
              description: "Successfully created a booking!",
            });
          }
          onSend(false);
          onOpenChange(false);
        },
      }
    );
  };

  const notifyBooking = async (body: string, id: number) => {
    if (!users) return;
    const notification: Notification = {
      title: "Site Bookings Alert!",
      recipients: [...salesUnits.map(u => Number(u.id)), ...users.filter(user => user.role.role_id === 13).map(user => Number(user.ID)), 1],
      body: body,
      tag: "booking",
      data: {
        url: `/booking?t=bookings&b=${id}`,
      },
    }

    return await sendNotification(notification);
  }

  const canSubmit = useMemo(() => {
    return booking.client.length > 0 && booking.account_executive.length > 0 && differenceInDays(booking.end, booking.start) > 1;
  }, [booking])
  useEffect(() => {
    let endDate: string | Date | undefined = site.end_date;
    const bookings = site.bookings;

    if (bookings.length > 0) {
      const activeBooking = bookings.filter(b => b.booking_status !== "CANCELLED");

      const ongoingBooking = activeBooking.reduce((latest, current) =>
        new Date(current.date_to) > new Date(latest.date_to) ? current : latest, {} as Booking
      );
      if (Object.keys(ongoingBooking).length > 0) {
        endDate = addDays(new Date(ongoingBooking.date_to), 1);
      }
    }
    if (site.adjusted_end_date) {
      endDate = addDays(new Date(site.adjusted_end_date), 1);
    }
    if (endDate && !(bookings.length || site.adjusted_end_date)) {
      endDate = addDays(new Date(endDate), 1);
    }

    console.log(endDate);
    setBooking(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        end: (endDate as Date) ?? new Date()
      }
    })
  }, [site])

  useEffect(() => {
    const statusesStartsFromEndDate = ["NEW", "RENEWAL", "QUEUEING", "SPECIAL EXECUTION"];
    if (statusesStartsFromEndDate.includes(booking.booking_status)) {
      setBooking(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          start: prev.end,
        }
      })
    } else {
      setBooking(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          start: new Date(site.date_from ?? new Date()),
        }
      })
    }

  }, [site.date_from, booking.booking_status])

  return (
    <DialogContent aria-describedby={undefined}>
      <DialogHeader>
        <DialogTitle>Create Booking for {site.site}</DialogTitle>
      </DialogHeader>
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormGroup>
          <Label htmlFor="srp">SRP</Label>
          <InputNumber id="srp"
            value={booking.srp}
            required
            onChange={onChange}
            disabled={send} />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="booking_status">Booking Status</Label>
          <Select
            disabled={send}
            onOpenChange={(open) => {
              if (!open) {
                document.body.style.pointerEvents = "auto";
              }
            }}
            value={booking.booking_status}
            onValueChange={(value) =>
              setBooking((prev) => ({
                ...prev,
                booking_status: value,
                client: value === "RENEWAL" ? site.product ? `${site.client}(${site.product})` : "" : prev.client,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select booking status" />
            </SelectTrigger>
            <SelectContent>
              {(remainingDays && remainingDays > 60
                ? ["RENEWAL", "QUEUEING", "PRE-TERMINATION", "CHANGE OF CONTRACT PERIOD/DURATION"]
                : [
                  "NEW",
                  "RENEWAL",
                  "QUEUEING",
                  "RELOCATION",
                  "PRE-TERMINATION",
                  "SPECIAL EXECUTION",
                  "CHANGE OF CONTRACT PERIOD/DURATION",
                ]
              ).map((opt) => (
                <SelectItem className="hover:bg-slate-50" value={opt} key={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="client">Client</Label>
          <Input
            disabled={send}
            id="client"
            value={booking.client}
            required
            onChange={onChange}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="ae">Account Executive</Label>
          <MultiComboBox
            disabled={send}
            title="account executive"
            list={options}
            value={booking.account_executive}
            setValue={(id) => {
              setBooking((prev) => {
                const current = prev.account_executive ?? [];
                const exists = current.some((item) => item.id === id);

                if (exists) {
                  return {
                    ...prev,
                    account_executive: current.filter((item) => item.id !== id),
                  };
                }

                const found = options.find((item) => item.id === id);

                return found
                  ? {
                    ...prev,
                    account_executive: [...current, found],
                  }
                  : prev;
              });
            }}
          />
        </FormGroup>
        <FormGroup>
          <Label className="mr-auto">Duration</Label>
          <div className="flex justify-evenly items-center gap-4">
            <DatePicker
              disabled={send || booking.booking_status === "PRE-TERMINATION"}
              date={booking.start}
              min={booking.start}
              onDateChange={(value) => {
                if (!value) return;
                setBooking((prev) => ({
                  ...prev,
                  start: value,
                  end: value > prev.end ? value : prev.end,
                }));
              }}
            />
            <span>to</span>
            <DatePicker
              disabled={send}
              date={booking.end}
              min={booking.start}
              onDateChange={(value) => {
                if (!value) return;
                setBooking((prev) => ({
                  ...prev,
                  end: value,
                }));
              }}
            />
          </div>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="monthly_rate">Monthly Rate</Label>
          <InputNumber
            disabled={send}
            id="monthly_rate"
            value={booking.monthly_rate}
            onChange={onChange}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={booking.remarks}
            disabled={send}
            onChange={(e) =>
              setBooking((prev) => ({
                ...prev,
                [e.target.id]: e.target.value,
              }))
            }
          />
        </FormGroup>
        <DialogFooter>
          <Button
            disabled={send}
            type="reset"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            type="submit"
            disabled={send || !canSubmit}
            className={
              "bg-main-100 hover:bg-main-700 text-white hover:text-white"
            }
          >
            {send && <Loader2 className="animate-spin" />}
            Continue
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

const FormGroup = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col gap-1">{children}</div>;
};
export default CreateBookingDialog;

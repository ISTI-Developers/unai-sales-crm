import FormLabel from "@/components/formlabel";
import { MultiComboBox } from "@/components/multicombobox";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import InputNumber from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBookings, useCreateBookingWithNoSite, usePreBookings, useUpdatePreSiteBooking } from "@/hooks/useBookings";
import { useAccess } from "@/hooks/useClients";
import { useSiteCities } from "@/hooks/useSites";
import { useUsers } from "@/hooks/useUsers";
import { List } from "@/interfaces";
import { capitalize } from "@/lib/utils";
import Page from "@/misc/Page";
import { useAuth } from "@/providers/auth.provider";
import { ChevronLeft, Loader2 } from "lucide-react";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { v4 } from "uuid";

const AddNewBooking = () => {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const { data: others } = usePreBookings();
  const { data: rows } = useBookings()
  const { user } = useAuth();
  const { data, isLoading, fetchStatus } = useUsers();
  const { data: areas } = useSiteCities();
  const { access: add } = useAccess("booking.add");
  const { mutate } = useCreateBookingWithNoSite();
  const { mutate: update } = useUpdatePreSiteBooking()
  const navigate = useNavigate();

  const [bookingID, setBookingID] = useState<number>()
  const [booking, setBooking] = useState({
    area: "",
    address: "",
    facing: "",
    size: "",
    srp: 0,
    site_rental: 0,
    booking_status: "NEW",
    client: "",
    account_executive: [] as List[],
    start: new Date(),
    end: new Date(),
    monthly_rate: "0",
    remarks: "",
  });
  const [send, onSend] = useState(false);

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
    return [...salesUnits, { id: v4(), value: "Others", label: "Others" }];
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
    if (pathname.includes("edit") && params.has("id")) {
      update({ ...booking, booking_id: bookingID!, id: Number(params.get("id")) }, {
        onSuccess: () => {
          onSend(false);
          navigate("/booking?t=other", { replace: true });
        },
      });
    } else {
      mutate(booking, {
        onSuccess: () => {
          onSend(false);
          navigate("/booking?t=other", { replace: true });
        },
      });
    }
  };

  useEffect(() => {
    if ((!params.get("id") && pathname.includes("edit")) || !others || !rows) return;
    const ID = params.get("id") as string;

    const otherData = others.find(o => o.ID === Number(ID));
    if (!otherData) return;

    const bookingData = rows.find(r => r.ID === otherData.booking_id);
    if (!bookingData) return;

    const aes = bookingData.account_executive.split(",");
    const aeOptions = options.filter(opt => aes.some(ae => ae.includes(opt.value)));

    setBooking({
      area: otherData.area,
      address: otherData.address,
      facing: otherData.facing,
      size: otherData.size,
      srp: bookingData.srp,
      site_rental: bookingData.site_rental,
      booking_status: bookingData.booking_status,
      client: bookingData.client,
      account_executive: aeOptions,
      start: new Date(bookingData.date_from),
      end: new Date(bookingData.date_to),
      monthly_rate: String(bookingData.monthly_rate),
      remarks: bookingData.remarks
    })

    setBookingID(bookingData.ID)

  }, [rows, others, params, pathname, options])


  if (!add) {
    return <Navigate to="/booking?t=other" replace />;
  }
  if (!params.get("id") && pathname.includes("edit")) {
    return <Navigate to="/booking?t=other" replace />;
  }

  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>{pathname.includes("edit") ? "Edit" : "Add"} | Bookings | Sales Platform</title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">{pathname.includes("edit") ? "Edit" : "Add"} Booking</h1>
        <Button variant="link" type="button" asChild>
          <Link to="/booking">
            <ChevronLeft /> Back
          </Link>
        </Button>
      </header>
      <form onSubmit={onSubmit} autoComplete="off" className="grid gap-4">
        <FormSection title="Site Information">
          <FormField id="area">
            <Select
              disabled={send}
              value={booking.area}
              onValueChange={(value) =>
                setBooking((prev) => ({
                  ...prev,
                  area: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {areas &&
                  areas.map((opt) => (
                    <SelectItem value={opt.city_name} key={opt.city_id}>
                      {opt.city_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="address">
            <Input
              id="address"
              value={booking.address}
              required
              onChange={onChange}
              disabled={send}
            />
          </FormField>
          <FormField id="facing">
            <Input
              id="facing"
              value={booking.facing}
              required
              onChange={onChange}
              disabled={send}
            />
          </FormField>
          <FormField id="size" label="size (H x W)">
            <Input
              id="size"
              value={booking.size}
              placeholder="Please include the unit, eg. 100ft x 50ft"
              required
              onChange={onChange}
              disabled={send}
            />
          </FormField>
          <FormField id="Site Rental">
            <InputNumber
              id="site_rental"
              value={booking.site_rental}
              required
              onChange={onChange}
              disabled={send || pathname.includes("edit")}
            />
          </FormField>
        </FormSection>
        <FormSection title="Booking Information">
          <FormField id="SRP">
            <InputNumber
              id="srp"
              value={booking.srp}
              required
              onChange={onChange}
              disabled={send || pathname.includes("edit")}
            />
          </FormField>
          <FormField id="booking_status">
            <Select
              disabled={send}
              value={booking.booking_status}
              onValueChange={(value) =>
                setBooking((prev) => ({
                  ...prev,
                  booking_status: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select booking status" />
              </SelectTrigger>
              <SelectContent>
                {["NEW", "QUEUEING", "RENEWAL", "SPECIAL EXECUTION"].map((opt) => (
                  <SelectItem
                    className="hover:bg-slate-50"
                    value={opt}
                    key={opt}
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="client">
            <Input
              disabled={send}
              id="client"
              value={booking.client}
              required
              onChange={onChange}
            />
          </FormField>
          <FormField id="account_executive">
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
                      account_executive: current.filter(
                        (item) => item.id !== id
                      ),
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
          </FormField>
          <FormField id="Duration">
            <div className="flex justify-evenly items-center gap-4">
              <DatePicker
                disabled={send}
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
          </FormField>
          <FormField id="monthly_rate">
            <InputNumber
              disabled={send}
              id="monthly_rate"
              value={booking.monthly_rate}
              onChange={onChange}
            />
          </FormField>
          <FormField id="remarks">
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
          </FormField>
        </FormSection>
        <Button
          variant="ghost"
          type="submit"
          disabled={send}
          className={
            "bg-main-100 hover:bg-main-700 text-white hover:text-white w-fit ml-auto"
          }
        >
          {send && <Loader2 className="animate-spin" />}
          Proceed
        </Button>
      </form>
    </Page>
  );
};

const FormField = ({
  id,
  label,
  children,
}: {
  id: string;
  label?: string;
  children: ReactNode;
}) => {
  return (
    <div className="grid grid-cols-[1.25fr_4fr] items-center gap-2">
      <FormLabel id={id} label={label ?? id} />
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

export default AddNewBooking;

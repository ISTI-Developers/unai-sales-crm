import FormLabel from "@/components/formlabel";
import { MultiComboBox } from "@/components/multicombobox";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datepicker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBookingWithNoSite } from "@/hooks/useBookings";
import { useAccess } from "@/hooks/useClients";
import { useSiteCities } from "@/hooks/useSites";
import { useUsers } from "@/hooks/useUsers";
import { List } from "@/interfaces";
import { capitalize } from "@/lib/utils";
import Page from "@/misc/Page";
import { useAuth } from "@/providers/auth.provider";
import { ChevronLeft, Loader2 } from "lucide-react";
import { ChangeEvent, FormEvent, ReactNode, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { v4 } from "uuid";

const AddNewBooking = () => {
  const { user } = useAuth();
  const { data, isLoading, fetchStatus } = useUsers();
  const { data: areas } = useSiteCities();
  const { access: add } = useAccess("booking.add");
  const { mutate } = useCreateBookingWithNoSite();
  const navigate = useNavigate();

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
    mutate(booking, {
      onSuccess: () => {
        onSend(false);
        navigate("/booking", { replace: true });
      },
    });
  };

  if (!add) {
    return <Navigate to="/booking" replace />;
  }
  return (
    <Page className="flex flex-col gap-4">
      <Helmet>
        <title>Add | Bookings | Sales Platform</title>
      </Helmet>
      <header className="flex items-center justify-between border-b pb-1.5">
        <h1 className="text-blue-500 font-bold uppercase">Add Booking</h1>
        <Button variant="link" type="button" asChild>
          <Link to="/booking">
            <ChevronLeft /> Back
          </Link>
        </Button>
      </header>
      <main>
        <form action=""></form>
      </main>
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
            <Input
              id="site_rental"
              value={booking.site_rental}
              required
              onChange={onChange}
              disabled={send}
            />
          </FormField>
        </FormSection>
        <FormSection title="Booking Information">
          <FormField id="SRP">
            <Input
              id="srp"
              value={booking.srp}
              required
              onChange={onChange}
              disabled={send}
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
                {["NEW", "QUEUEING", "SPECIAL EXECUTION"].map((opt) => (
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
            <Input
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
      {/* <main>
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
      </main> */}
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

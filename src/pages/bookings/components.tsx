import { MultiComboBox } from "@/components/multicombobox";
import SiteCombobox from "@/components/site-combobox";
import { DatePicker } from "@/components/ui/datepicker";
import { Label } from "@/components/ui/label";
import InputNumber from "@/components/ui/number-input";
import useAvailableSites from "@/hooks/useAvailableSites";
import { useUsers } from "@/hooks/useUsers";
import { List } from "@/interfaces";
import { TaggedBooking } from "@/interfaces/bookings.interface";
import { capitalize } from "@/lib/utils";
import { useAuth } from "@/providers/auth.provider";
import { format } from "date-fns";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

const OTHER_JV_ID = "other-jv-partner";
const OTHER_IN_HOUSE_ID = "other-in-house";

export const SalesUnitPicker = ({
    booking,
    setBooking,
}: {
    booking: TaggedBooking;
    setBooking: Dispatch<SetStateAction<TaggedBooking>>;
}) => {
    const { user } = useAuth();
    const { data: users = [], isLoading } = useUsers();

    const [accounts, setAccounts] = useState<List[]>([]);

    const accountExecutives = useMemo<List[]>(() => {
        if (isLoading || !user?.company?.ID) return [];

        const aes: List[] = users
            .filter(
                (item) =>
                    item.company?.ID === user.company?.ID &&
                    item.sales_unit !== null
            )
            .map((item) => {
                const name = capitalize(
                    `${item.first_name} ${item.last_name}`
                );

                return {
                    id: String(item.ID),
                    value: name,
                    label: name,
                };
            });

        return [
            ...aes,
            {
                id: OTHER_JV_ID,
                value: "Other (JV Partner)",
                label: "Other (JV Partner)",
            },
            {
                id: OTHER_IN_HOUSE_ID,
                value: "Others (In-house account)",
                label: "Others (In-house account)",
            },
        ];
    }, [users, isLoading, user?.company?.ID]);

    /**
     * Synchronize selected accounts from booking.account_executive.
     *
     * Example:
     * "John Doe, Jane Doe"
     * =>
     * [
     *   { id: "1", label: "John Doe", ... },
     *   { id: "2", label: "Jane Doe", ... }
     * ]
     */
    useEffect(() => {
        if (!accountExecutives.length) {
            setAccounts([]);
            return;
        }

        const selectedNames = (booking.account_executive ?? "")
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean);

        const selected = accountExecutives.filter((account) =>
            selectedNames.includes(account.label)
        );

        setAccounts(selected);
    }, [booking.account_executive, accountExecutives]);

    const handleAccountChange = (id: string) => {
        setAccounts((current) => {
            const exists = current.some((item) => item.id === id);

            const nextAccounts = exists
                ? current.filter((item) => item.id !== id)
                : (() => {
                    const found = accountExecutives.find(
                        (item) => item.id === id
                    );

                    return found ? [...current, found] : current;
                })();

            /**
             * IMPORTANT:
             * Use nextAccounts here instead of `accounts`
             * because React state updates are asynchronous.
             */
            setBooking((prev) => ({
                ...prev,
                account_executive: nextAccounts
                    .map((account) => account.label)
                    .join(", "),
            }));

            return nextAccounts;
        });
    };

    return (
        <div>
            <Label htmlFor="ae" className="text-xs">
                Account Executive
            </Label>

            <MultiComboBox
                title="account executive"
                list={accountExecutives}
                value={accounts}
                setValue={handleAccountChange}
            />
        </div>
    );
};
export const DateEffectivityForm = ({ booking, setBooking }: { booking: TaggedBooking; setBooking: Dispatch<SetStateAction<TaggedBooking>> }) => {
    return <div>
        <Label>Pre-termination Effectivity Date</Label>
        <DatePicker
            date={new Date(booking.effectivity_date ?? booking.date_to)}
            min={new Date(booking.date_from)}
            onDateChange={(value) => {
                if (!value) return;
                setBooking((prev) => ({
                    ...prev,
                    effectivity_date: format(value, "yyyy-MM-dd"),
                }));
            }}
        />
    </div>
}
export const SitePicker = ({ booking, setBooking }: { booking: TaggedBooking; setBooking: Dispatch<SetStateAction<TaggedBooking>> }) => {
    const data = useAvailableSites();
    const site = useMemo(() => {
        return data.find(item => item.site_code === booking.site_code);
    }, [data, booking.site_code])

    const onSelect = (value: string) => {
        const selectedSite = data.find(item => item.site_code === value)!;

        setBooking(prev => ({
            ...prev,
            site_code: selectedSite.site_code,
            srp: selectedSite.srp,
            site_rental: selectedSite.site_rental,
        }))
    }
    return site && <div>
        <Label>Site Selection</Label>
        <SiteCombobox value={site.site_code} onValueSelect={onSelect} />
    </div>
}
export const ContractRateForm = ({ booking, setBooking, disabled }: { booking: TaggedBooking; setBooking: Dispatch<SetStateAction<TaggedBooking>>; disabled?: boolean }) => {
    return <div>
        <Label>Monthly Rate</Label>
        <InputNumber disabled={disabled} value={booking.monthly_rate} onChange={(e) => setBooking(prev => ({
            ...prev,
            monthly_rate: Number(e.target.value)
        }))} />
    </div>
}
export const ChangeOfContractForm = ({ booking, setBooking, min }: { booking: TaggedBooking; setBooking: Dispatch<SetStateAction<TaggedBooking>>; min?: Date }) => {
    return <div>
        <Label>Term Duration</Label>
        <div className="flex gap-4 items-center">
            <DatePicker
                date={new Date(booking.date_from)}
                min={min}
                onDateChange={(value) => {
                    if (!value) return;
                    setBooking((prev) => ({
                        ...prev,
                        date_from: format(value, "yyyy-MM-dd"),
                    }));
                }}
            />
            <span>to</span>
            <DatePicker
                date={new Date(booking.date_to)}
                min={min ?? new Date(booking.date_from)}
                onDateChange={(value) => {
                    if (!value) return;
                    setBooking((prev) => ({
                        ...prev,
                        date_to: format(value, "yyyy-MM-dd"),
                    }));
                }}
            />
        </div>
    </div>
}
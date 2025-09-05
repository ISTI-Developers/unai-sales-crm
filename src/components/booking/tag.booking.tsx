import { useAvailableSites, useLatestSites, useSites } from "@/hooks/useSites";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useMemo, useState } from "react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { useBookings, useTagPreSite } from "@/hooks/useBookings";
const TagBooking = ({ id }: { id: number }) => {
  const { data, isLoading } = useLatestSites();
  const { data: bookedSites } = useAvailableSites();
  const { data: bookings } = useBookings();
  const { mutate } = useTagPreSite();
  const { data: sites } = useSites();
  const [site, setSite] = useState("");

  const options = useMemo(() => {
    if (!data || isLoading || !sites || !bookedSites || !bookings) return [];

    const results = data
      .filter(
        (item) => !bookedSites.some((book) => book.site === item.site_code)
      )
      .filter(
        (item) => !bookings.some((book) => book.site_code === item.site_code)
      )
      .map((item) => {
        const site = sites.find((s) => s.site_code === item.site_code);
        return {
          ...item,
          existing: Boolean(site),
        };
      });
    return results;
  }, [data, isLoading, sites, bookedSites, bookings]);

  const onSubmit = async () => {
    mutate(
      { booking_id: id, site_code: site },
      {
        onSuccess: (data) => {
          console.log(data);
          setSite("");
        },
      }
    );
  };
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Tag Booking</AlertDialogTitle>
        <AlertDialogDescription>
          Tag this booking to a newly created site or sites without contract
          created.
        </AlertDialogDescription>
        <div>
          <Label htmlFor="options">Site: </Label>
          <Select
            value={site}
            onValueChange={setSite}
            disabled={options.length === 0}
          >
            <SelectTrigger>
              {options.length === 0
                ? "No sites available at the moment"
                : site.length === 0
                ? "Select Site"
                : site}
            </SelectTrigger>
            {options.length > 0 && (
              <SelectContent>
                {options.map((option) => {
                  return (
                    <SelectItem
                      key={option.site_code}
                      value={option.site_code}
                      className="hover:bg-slate-50"
                    >
                      <p>{option.site_code}</p>
                      <p className="text-[0.65rem]">
                        {option.address} ({option.facing})
                      </p>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            )}
          </Select>
        </div>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => setSite("")}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction disabled={options.length === 0} onClick={onSubmit}>
          Continue
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default TagBooking;

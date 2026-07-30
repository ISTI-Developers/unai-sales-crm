import { AddOn, BookingTerm, PackageRate, Packages, RateBasis } from "@/misc/deckTemplate";

export const syncPackages = (bookingTerms: BookingTerm[], existingPackages: Packages): Packages =>
    Object.fromEntries(
        bookingTerms.map(term => [
            term.duration,
            existingPackages[term.duration] ?? {
                value: 0,
                type: "FLAT",
            },
        ])
    );

export const getDefaultAddOnRate = (addOnKey: string, duration: number): PackageRate => {
    if (addOnKey === "installation_dismantling") {
        const defaults: Record<number, number> = {
            3: 1,
            6: 2,
            12: 4,
        };

        return {
            value: defaults[duration] ?? 0,
            type: "FREE",
        };
    }

    return {
        value: 1,
        type: "FREE",
    };
};
export const syncAddOns = (bookingTerms: BookingTerm[], addOns: AddOn[]): AddOn[] =>
    addOns.map(addOn => ({
        ...addOn,
        rates: Object.fromEntries(
            bookingTerms.map(term => [
                term.duration,
                addOn.rates[term.duration] ??
                getDefaultAddOnRate(addOn.key, term.duration),
            ])
        ) as Packages,
    }));
export const createAddOn = (
    key: string,
    label: string,
    bookingTerms: BookingTerm[],
    rateBasis: RateBasis
): AddOn => ({
    key,
    label,
    rates:
        rateBasis === "SINGLE"
            ? {
                1: {
                    value: 0,
                    type: "FREE",
                },
            }
            : Object.fromEntries(
                bookingTerms.map(term => [
                    term.duration,
                    getDefaultAddOnRate(key, term.duration),
                ])
            ) as Packages,
});

export function createMapURL({
    latitude,
    longitude,
}: {
    latitude: string;
    longitude: string;
}) {
    const params = new URLSearchParams({
        center: `${latitude},${longitude}`,
        zoom: "16",
        size: "350x350",
        key: import.meta.env.VITE_GCP_API,
    });

    params.append(
        "markers",
        `icon:https://salespf.unmg.com.ph/billboard_64.png|${latitude},${longitude}`
    );

    return `${import.meta.env.VITE_BASE_MAP_URL}?${params.toString()}`;
}
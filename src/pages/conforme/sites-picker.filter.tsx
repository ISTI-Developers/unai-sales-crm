import { SiteAvailability } from "@/interfaces/sites.interface";
import { FilterFn } from "@tanstack/react-table";

export const siteGlobalFilter: FilterFn<SiteAvailability> = (row, _columnId, filterValue) => {
    const query = String(filterValue ?? "").trim().toLowerCase();

    if (!query) return true;

    const { site_code, address, city, client } = row.original;

    // Detect site-code format
    const SITE_CODE_PATTERN = /\b\d[a-z0-9]{6}\d{3}-\d[a-z]{2}\d{2}\b/;

    const isSiteCodeSearch = SITE_CODE_PATTERN.test(query);

    if (isSiteCodeSearch) {
        const siteCodes = query.split(/\s+/);

        return siteCodes.includes(site_code.toLowerCase());
    }

    return [site_code, address, city, client ?? ""].some((field) =>
        field.toLowerCase().includes(query)
    );
};
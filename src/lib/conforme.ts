import { CartDetails } from "@/interfaces/requests.interface";
import {
  getDurationInDays,
  getMonthlyDuration,
  getSiteInstallationCost,
  getSiteMaterial,
  getTotalChargeablesBySite,
  getTotalDaily,
  getTotalGivenRateBySite,
  getTotalSiteSRPBySite,
} from "./utils";
import { Site } from "@/interfaces/sites.interface";

const getSelectedSites = (details: CartDetails) => {
  return [
    ...details.sites.map((item) => ({ ...item, type: "static" as const })),
    ...details.leds.map((item) => ({ ...item, type: "led" as const })),
  ];
};
export function getTotalSRP(details: CartDetails, sites: Site[]) {
  const selectedSites = getSelectedSites(details);
  return selectedSites.reduce((acc, item) => {
    if (item.type === "static") {
      const difference = getMonthlyDuration(item.from, item.to);
      const site = sites.find((s) => s.ID === item.ID);
      acc +=
        getTotalSiteSRPBySite(
          site!,
          item.installation,
          item.material,
          difference,
        ) + item.add_on_total;
    } else if (item.type === "led") {
      const days = getDurationInDays(item.from, item.to);

      const srp = Number(item.details.price);
      const spotsRate = Number(item.srp);
      const packageRate = Number(item.package_rate);
      const spotsCount = Number(item.spots_count);

      const hasPackageRate = packageRate > 0;
      const isFree = item.is_free;

      const spots = hasPackageRate
        ? Math.floor(packageRate / days / spotsRate)
        : spotsCount;

      let srpTotal = srp * spots * days;
      if (isFree) {
        srpTotal = hasPackageRate ? packageRate : spotsRate * spots * days;
      }
      acc += srpTotal;
    }
    return acc;
  }, 0);
}

export function getTotalRentalCost(details: CartDetails) {
  const selectedSites = getSelectedSites(details);

  return selectedSites.reduce((acc, item) => {
    const packageRate = Number(item.package_rate);
    if (item.type === "static") {
      const difference = getMonthlyDuration(item.from, item.to);
      acc += packageRate * difference;
    } else {
      if (item.is_free) {
        acc += 0;
      } else {
        if (packageRate > 0) {
          acc += packageRate;
        } else {
          const contractRate = item.spots_count * item.srp;
          acc += getTotalDaily(
            contractRate,
            new Date(item.to),
            new Date(item.from),
          );
        }
      }
    }
    return acc;
  }, 0);
}

export function getTotalContractAmount(details: CartDetails, sites: Site[]) {
  const selectedSites = getSelectedSites(details);

  return selectedSites.reduce((acc, item) => {
    const packageRate = Number(item.package_rate);
    if (item.type === "static") {
      const difference = getMonthlyDuration(item.from, item.to);
      const site = sites.find((s) => s.ID === item.ID);
      acc += getTotalGivenRateBySite(
        packageRate * difference,
        site!,
        item.installation,
        item.material,
      );
    } else {
      if (item.is_free) {
        acc += 0;
      } else {
        if (packageRate > 0) {
          acc += packageRate;
        } else {
          const contractRate = item.spots_count * item.srp;
          acc += getTotalDaily(
            contractRate,
            new Date(item.to),
            new Date(item.from),
          );
        }
      }
    }
    return acc;
  }, 0);
}

export function getTotalBillableAddOns(details: CartDetails, sites: Site[]) {
  const selectedSites = getSelectedSites(details);

  return selectedSites.reduce((acc, item) => {
    if (item.type === "static") {
      const site = sites.find((s) => s.ID === item.ID);
      acc += getTotalChargeablesBySite(item.installation, item.material, site);
    }
    return acc;
  }, 0);
}
export function getTotalGlobalFreeAddOns(details: CartDetails) {
  return details.add_ons.reduce((acc, item) => {
    if (item.is_free) {
      acc += item.total;
    }
    return acc;
  }, 0);
}
export function getTotalGlobalPaidAddOns(details: CartDetails) {
  return details.add_ons.reduce((acc, item) => {
    if (!item.is_free) {
      acc += item.total;
    }
    return acc;
  }, 0);
}

export function getFreeSiteAddOns(details: CartDetails, sites: Site[]) {
  const selectedSites = getSelectedSites(details);
  return selectedSites.reduce((acc, item) => {
    if (item.type === "led") {
      return acc;
    } else {
      if (item.package_rate === 0) {
        const site = sites.find((s) => s.ID === item.ID);
        const difference = getMonthlyDuration(item.from, item.to);
        acc += getTotalSiteSRPBySite(
          site!,
          item.installation,
          item.material,
          difference,
        );
      }
    }
    return acc;
  }, 0);
}

export function getSiteInclusions(details: CartDetails, sites: Site[]) {
  return details.sites.reduce((acc, item) => {
    const { installation, material } = item;
    const site = sites.find((s) => s.ID === item.ID);

    if (!site) return 0;
    const installationAmt =
      getSiteInstallationCost(site.size, site.region) * installation.free;
    const materialAmt =
      getSiteMaterial(site.size, site.site_code) * material.free;
    return (acc += installationAmt + materialAmt);
  }, 0);
}

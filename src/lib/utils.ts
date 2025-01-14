import { clsx, type ClassValue } from "clsx";
import {
  differenceInHours,
  differenceInMinutes,
  format,
  isToday,
} from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(text: string, separator: string = " "): string {
  const textStrip = text.split(separator);
  const newTextStrip = [];
  for (const strip of textStrip) {
    newTextStrip.push(strip.substring(0, 1).toUpperCase() + strip.slice(1));
  }

  return newTextStrip.join(" ");
}

export function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

export function splitFullName(fullName: string) {
  // Trim any extra spaces
  fullName = fullName.trim();

  // Find the last space in the string
  const lastSpaceIndex = fullName.lastIndexOf(" ");

  // If no space is found, assume the full name is either just first or last name
  if (lastSpaceIndex === -1) {
    return {
      first_name: fullName,
      last_name: "",
    };
  }

  // Split the name into first and last names
  const firstName = fullName.slice(0, lastSpaceIndex).trim();
  const lastName = fullName.slice(lastSpaceIndex + 1).trim();

  return {
    first_name: firstName,
    last_name: lastName,
  };
}

export const today = (date: string) => {
  return isToday(new Date(date))
    ? "Today"
    : format(new Date(date), "MMMM dd, yyyy");
};

export const getLogTime = (date: string) => {
  const currentDate = new Date();
  const logDate = new Date(date);

  const minsPassed = differenceInMinutes(currentDate, logDate);

  if (minsPassed < 60) {
    return `${minsPassed} mins ago`;
  } else {
    const hoursPassed = differenceInHours(currentDate, logDate);
    if (hoursPassed < 12) {
      return `${hoursPassed} hours ago`;
    } else {
      return format(logDate, "hh:mm a");
    }
  }
};
export const colors = [
  "#756f65",
  "#7cb613",
  "#413267",
  "#4d9366",
  "#9c019a",
  "#8e8b98",
  "#872b32",
  "#4eb16b",
  "#7f40fd",
  "#38710b",
  "#610050",
  "#898220",
  "#589b7e",
  "#9bf420",
  "#96360a",
  "#4eeab3",
  "#50c378",
  "#a20473",
  "#767bab",
  "#73af1e",
  "#3d2459",
  "#5364ac",
  "#30ced0",
  "#7b89be",
  "#335ca9",
  "#32eae7",
  "#762162",
  "#44abbf",
  "#73388f",
  "#48bb94",
  "#56c1b8",
  "#513a7b",
  "#8d8668",
  "#3fc780",
  "#8de66a",
  "#452c02",
  "#a258fc",
  "#75aabc",
  "#59fff4",
  "#81a3ab",
  "#5560b8",
  "#7b1722",
  "#607c30",
  "#74ea67",
  "#5ebe59",
  "#9a3f2e",
  "#4e2bb2",
  "#4d73d4",
  "#70fe84",
  "#37de6d",
];

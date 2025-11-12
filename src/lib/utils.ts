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
export function generatePassword(): string {
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const allChars = uppercaseChars + lowercaseChars + numbers;

  let password = "";

  // Ensure at least one uppercase letter, one lowercase letter, and one number
  password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
  password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  // Fill the remaining characters with random choices from all available characters
  for (let i = 3; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to ensure randomness
  password = password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return password;
}
export interface Coordinate {
  lat: number;
  lng: number;
}
export const haversineDistance = (coords1: Coordinate, coords2: Coordinate) => {
  const toRad = (x: number) => (x * Math.PI) / 180;

  const R = 6371e3; // Earth's radius in meters
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLng = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};
export const customOrder = ["HOT", "ACTIVE", "ON/OFF", "FOR ELECTIONS", "POOL"];

export const pastelColors = [
  "#fecaca",
  "#f87171",
  "#dc2626",
  "#991b1b",
  "#450a0a",
  "#fde68a",
  "#fbbf24",
  "#d97706",
  "#92400e",
  "#451a03",
  "#d9f99d",
  "#a3e635",
  "#65a30d",
  "#3f6212",
  "#1a2e05",
  "#a7f3d0",
  "#34d399",
  "#059669",
  "#065f46",
  "#022c22",
];
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
  "#4e729a",
  "#971a23",
  "#3a3541",
  "#233345",
  "#34d399",
  "#71717a",
  "#2563eb",
  "#475569",
  "#3a3541",
  "#09090b",
  "#000000",
  "#015064",
];

export const vibrantColors = [
  // 🔴 Reds / Pinks
  "#ef4444", // vibrant red
  "#f43f5e", // rose
  "#ec4899", // pink

  // 🟠 Oranges
  "#f97316", // orange
  "#fb923c", // tangerine
  "#f59e0b", // amber

  // 🟡 Yellows
  "#eab308", // yellow
  "#fde047", // bright yellow

  // 🟢 Greens
  "#22c55e", // green
  "#16a34a", // emerald
  "#34d399", // vibrant teal-green

  // 💧 Teals / Aquas
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky blue

  // 🔵 Blues
  "#2563eb", // bright blue
  "#3b82f6", // vivid indigo-blue
  "#1d4ed8", // saturated blue

  // 🟣 Purples
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia

  // ⚫ Optional deep contrast (keep minimal)
  "#09090b", // black
  "#233345", // black
];

export const chartColors = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#a855f7", // purple-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
  "#78716c", // stone-500
  "#6b7280", // gray-500
  "#64748b", // slate-500
  "#7f1d1d", // red-900
  "#7c2d12", // orange-900
  "#78350f", // amber-900
  "#713f12", // yellow-900
  "#365314", // lime-900
  "#14532d", // green-900
  "#064e3b", // emerald-900
  "#134e4a", // teal-900
  "#164e63", // cyan-900
  "#0c4a6e", // sky-900
  "#1e3a8a", // blue-900
  "#312e81", // indigo-900
  "#4c1d95", // violet-900
  "#581c87", // purple-900
  "#701a75", // fuchsia-900
  "#831843", // pink-900
  "#881337", // rose-900
  "#1c1917", // stone-900
  "#111827", // gray-900
  "#0f172a", // slate-900
].reverse();

import { addDays, addWeeks, format, getISOWeek, parse } from "date-fns";
export function formatAmount(
  amount: string | number,
  options?: Intl.NumberFormatOptions
) {
  return Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 4,
    ...options,
  }).format(Number(amount));
}

export function formatNumber(num: string | number) {
  return Intl.NumberFormat("en-PH", {
    style: "decimal",
    maximumFractionDigits: 4,
  }).format(num);
}

export function formatTermDetails(
  dateFrom: string | Date,
  dateTo: string | Date,
  rate: number | string
) {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  const sameMonth = from.getMonth() === to.getMonth();
  const sameYear = from.getFullYear() === to.getFullYear();

  let datePart = "";

  if (sameMonth && sameYear) {
    // June 1 to 30, 2025
    datePart = `${format(from, "MMMM d")} to ${format(to, "d, yyyy")}`;
  } else if (!sameMonth && sameYear) {
    // June 18 - Aug 19, 2025
    datePart = `${format(from, "MMM d")} - ${format(to, "MMM d, yyyy")}`;
  } else {
    // June 18, 2024 - Aug 19, 2025
    datePart = `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
  }

  return `${datePart} @ ${formatAmount(rate)}`;
}
export const loadImageAsBase64 = async (filePath: string) => {
  const response = await fetch(filePath);
  const blob = await response.blob();
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        res(reader.result.split(",")[1]);
      } else {
        rej(new Error("Failed to read file as base64 string."));
      }
    };
    reader.onerror = rej;
    reader.readAsDataURL(blob);
  });
};

export const applyPriceAdjustment = (
  price: number,
  adjustment: {
    amount: number;
    type: "percent" | "flat";
    operation?: "add" | "subtract";
  }
): number => {
  let adjustedAmount = Number(adjustment.amount);

  if (adjustment.type === "percent") {
    adjustedAmount = (price * adjustedAmount) / 100;
  }

  return adjustment.operation
    ? adjustment.operation === "add"
      ? price + adjustedAmount
      : price - adjustedAmount
    : price - adjustedAmount;
};

export const Inches = (number: number) => number / 2.54;

export function cropImageFromURL(
  imageURL: string,
  cropLeft: number,
  cropRight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = function () {
      // Get original image dimensions
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Calculate the new width after cropping the left and right sides
      const cropX = cropLeft; // Pixels to crop from the left side
      const cropWidth = imgWidth - cropLeft - cropRight; // New width after cropping both sides
      const cropHeight = imgHeight; // Keep the original height

      // Ensure valid cropping dimensions
      if (cropWidth <= 0) {
        reject(new Error("Crop dimensions result in zero or negative width."));
        return;
      }

      // Create a canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set the canvas size to the new width and original height
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Draw the image onto the canvas, cropping the left and right sides
      if (ctx) {
        ctx.drawImage(
          img,
          cropX,
          0,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        // Convert the cropped image to a Data URL
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL); // Resolve the Promise with the Data URL
      } else {
        reject(new Error("Failed to get 2D context from canvas."));
      }
    };

    img.onerror = function () {
      reject(new Error(`Failed to load image: ${imageURL}`));
    };

    img.src = imageURL;
    // img.crossOrigin = "anonymous"; // Ensure cross-origin compatibility for external images
  });
}
export const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

/**
 * Get the ISO week from a given format like 'Jan Wk1'
 * @param monthWeekStr - Month-week format (e.g. Jan Wk1)
 * @param year - Number of year
 * @returns
 */

export function getISOWeekFromMonthWeek(
  monthWeekStr: string,
  year = new Date().getFullYear()
): number | null {
  const [monthStr, wkStr] = monthWeekStr.trim().split(/\s+/);
  const weekNum = parseInt(wkStr.replace(/Wk/i, ""), 10);

  const baseDate = parse(`01 ${monthStr} ${year}`, "dd MMM yyyy", new Date());
  if (isNaN(baseDate.getTime()) || isNaN(weekNum)) return null;

  // 🔁 Find first Monday of the month
  const startDay = baseDate.getDay();
  const daysUntilMonday = (8 - startDay) % 7;
  const firstMonday = addDays(baseDate, daysUntilMonday);

  // ⏩ Move forward (weekNum - 1) weeks from first Monday
  const targetDate = addWeeks(firstMonday, weekNum - 1);

  return getISOWeek(targetDate);
}
/**
 * Generate a random Date from a given ISO month-week like "Jul Wk2"
 * @param year - Full year (e.g. 2025)
 * @param week - Number of week of the month
 * @returns Date or null
 */
export function getFridayFromISOWeek(year: number, week: number): Date | null {
  // ISO week 1 = Monday of week containing Jan 4
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // Sunday=0 → 7
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

  // Get Monday of the given ISO week
  const monday = new Date(mondayOfWeek1);
  monday.setUTCDate(mondayOfWeek1.getUTCDate() + (week - 1) * 7);

  // Friday of that week
  const friday = new Date(monday);
  friday.setUTCDate(monday.getUTCDate() + 4);

  return friday;
}

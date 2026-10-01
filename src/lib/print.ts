import { appliesToPayment, Conforme } from "@/interfaces/requests.interface";
import { User } from "@/interfaces/user.interface";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import "/fonts/Aptos.ttf";
import "/fonts/Aptos-Italic.ttf";
import "/fonts/Aptos-SemiBold.ttf";
import "/fonts/Aptos-SemiBold-Italic.ttf";
import "/fonts/Aptos-Bold.ttf";
import "/fonts/Aptos-Bold-Italic.ttf";
import { formatAmount } from "./format";
import {
  capitalize,
  getDefaultInstallations,
  getDurationInDays,
  getMonthlyDuration,
  getSiteInstallationCost,
  getSiteMaterial,
  getTotalMonthly,
  ordinal,
} from "./utils";
import { TermsAndConditions } from "@/data/conforme-tnc";
import { PrintButtonOptions } from "@/pages/conforme/print- button";

type FreeAddOns = {
  label: string;
  free: number;
  value: number;
  total: number;
};
type PaidAddOns = Omit<FreeAddOns, "free"> & {
  paid: number;
};
type SiteItem = Conforme["sites"][number] & {
  type: "SITE";
};

type LEDItem = Conforme["leds"][number] & {
  type: "LED";
};

type AddOnItem = Conforme["add_ons"][number] & {
  type: "ADD_ON";
};

type FreeAddOnItem = FreeAddOns & {
  type: "FREE_ADD_ON";
};

type PaidAddOnItem = PaidAddOns & {
  type: "PAID_ADD_ON";
};

type ConformeItem =
  | SiteItem
  | LEDItem
  | AddOnItem
  | FreeAddOnItem
  | PaidAddOnItem;

/*
 * A4
 */
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;

/*
 * Layout
 *
 * 0.5 inch = 12.7mm
 */
const MARGIN = 12.7;

const HEADER_HEIGHT = 25;
const FOOTER_HEIGHT = 25;

const CONTENT = {
  left: MARGIN,
  right: PAGE_WIDTH - MARGIN,

  top: 10 + MARGIN,
  bottom: PAGE_HEIGHT - 10 - MARGIN,

  width: PAGE_WIDTH - MARGIN * 2,
};
/**
 * Defaults
 */
const defs = {
  HEADER: {
    DEFAULT: ["ITEMS", "DETAILS", "DIMENSIONS", "CONTRACT PERIOD", "ITEM COST"],
    WITH_RATE_CARD: [
      "ITEMS",
      "DETAILS",
      "DIMENSIONS",
      "CONTRACT PERIOD",
      "STANDARD COST",
      "ITEM COST",
    ],
    WITH_RATE_CARD_MERGED: [
      "ITEMS",
      "DETAILS",
      "DIMENSIONS",
      "CONTRACT PERIOD",
      "STANDARD COST",
      "RENTAL COST",
    ],
    WITH_TOTAL_COST: [
      "ITEMS",
      "DETAILS",
      "DIMENSIONS",
      "CONTRACT PERIOD",
      "ITEM COST",
      "TOTAL COST",
    ],
    WITH_MERGED_COST: [
      "ITEMS",
      "DETAILS",
      "DIMENSIONS",
      "CONTRACT PERIOD",
      "ITEM COST",
      "RENTAL COST",
    ],
  },
  HEADER_SET: {
    item_cost: ["item cost"],

    standard_rental: ["standard cost", "rental cost"],

    standard_item: ["standard cost", "item cost"],

    item_total: ["item cost", "total cost"],

    item_rental: ["item cost", "rental cost"],
  },
  COLUMN_STYLES: {
    DEFAULT: {
      0: { cellWidth: 38 },
      1: { cellWidth: 51 },
      2: { cellWidth: 35 },
      3: { cellWidth: 38 },
      4: { cellWidth: 22.5 },
    },
    WITH_RATE_CARD: {
      0: { cellWidth: 38 },
      1: { cellWidth: 41.5 },
      2: { cellWidth: 21 },
      3: { cellWidth: 32.5 },
      4: { cellWidth: 26.5 },
      5: { cellWidth: 25 },
    },
  },
  BODY: {
    DEFAULT: {
      SITE: ["SITE", "address", "size", "duration", "monthly_rental"],
      LED: ["LED", "address", "size", "duration", "contract_rate"],
      ADD_ON: ["ADD_ON", "", "", "", "contract_rate"],
      FREE_ADD_ON: ["FREE_ADD_ON", "", "", "", "contract_rate"],
      PAID_ADD_ON: ["PAID_ADD_ON", "", "", "", "contract_rate"],
    },
    WITH_RATE_CARD: {
      SITE: [
        "SITE",
        "address",
        "size",
        "duration",
        "monthly_rental",
        "package_cost",
      ],
      LED: [
        "LED",
        "address",
        "size",
        "duration",
        "contract_rate",
        "package_cost",
      ],
      ADD_ON: ["ADD_ON", "", "", "", "contract_rate", "package_cost"],
      FREE_ADD_ON: ["FREE_ADD_ON", "", "", "", "contract_rate", "package_cost"],
      PAID_ADD_ON: ["PAID_ADD_ON", "", "", "", "contract_rate", "package_cost"],
    },
  },
  TOTALS: {},
};
/*
 * PDF Layout
 */
class PDFLayout {
  private y: number;

  constructor() {
    this.y = CONTENT.top;
  }

  get currentY() {
    return this.y;
  }

  setY(y: number) {
    this.y = y;
  }

  move(amount: number) {
    this.y += amount;
  }
}

/*
 * Generate Conforme
 */
const decoratedPages = new Set<number>();

export async function generateConforme(
  request_no: string,
  conforme: Conforme,
  options: PrintButtonOptions,
  user?: User,
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  /*
   * Metadata
   */
  doc.addFont("/fonts/Aptos.ttf", "aptos", "normal");
  doc.addFont("/fonts/Aptos-SemiBold.ttf", "aptos", "bold");
  doc.addFont("/fonts/Aptos-Italic.ttf", "aptos", "italic");
  doc.addFont("/fonts/Aptos-SemiBold-Italic.ttf", "aptos", "bold-italic");
  doc.addFont("/fonts/Aptos-Bold.ttf", "aptos", "black");
  doc.addFont("/fonts/Aptos-Bold-Italic.ttf", "aptos", "black-italic");
  doc.setProperties({
    title: "Billboard Lease Agreement",
    author: "United Neon Advertising, Inc.",
    creator: `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim(),
    keywords: `CE#${request_no}`,
  });
  toggleFont(doc);
  const layout = new PDFLayout();

  // HEADER
  doc.setFontSize(9);

  doc.text(format(new Date(), "PPP"), CONTENT.right, layout.currentY, {
    align: "right",
  });
  layout.move(4);

  // LESSEE INFORMATION
  toggleFont(doc, "bold");
  doc.text(`01 LESSEE INFORMATION`, CONTENT.left, layout.currentY);
  layout.move(1);
  doc.line(CONTENT.left, layout.currentY, CONTENT.right, layout.currentY);
  toggleFont(doc);
  addTable(
    doc,
    layout,
    {
      body: [
        [
          {
            content: "BUSINESS NAME\n" + conforme.business_name.trim(),
          },
          {
            content: "PRODUCT/BRAND\n" + conforme.product,
          },
        ],
        [
          {
            content: "BUSINESS ADDRESS\n" + conforme.business_address,
          },
          {
            content:
              "INVOICE BILLING DELIVERY ADDRESS\n" + conforme.billing_address,
          },
        ],
        [
          {
            content: "AUTHORIZED SIGNATORY\n" + conforme.authorized_signatory,
          },
          {
            content: "POSITION\n" + conforme.position,
          },
        ],
      ],

      theme: "plain",

      columnStyles: {
        0: {
          cellWidth: 82.5,
        },
        1: {
          cellWidth: 82.5,
        },
      },

      styles: {
        cellPadding: {
          top: 1,
          right: 3,
          bottom: 1.5,
          left: 3,
        },
        valign: "top",
        fontSize: 8,
        lineWidth: 0,
      },

      willDrawCell: (hookData) => {
        if (hookData.section === "body") {
          hookData.cell.text = [];
        }
      },

      didDrawCell: (hookData) => {
        if (hookData.section !== "body") return;

        const raw = hookData.cell.raw as { content: string };
        const [label, ...valueParts] = raw.content.split("\n");
        const value = valueParts.join("\n");

        const padding = 2;
        const x = hookData.cell.x + padding;
        const y = hookData.cell.y;
        const width = hookData.cell.width - padding * 2;

        // Label
        toggleFont(doc);
        doc.setFontSize(8);
        doc.text(label, x, y + 5);

        // Value
        toggleFont(doc, "bold");
        doc.setFontSize(9);

        const lines = doc.splitTextToSize(value, width);

        doc.text(lines, x, y + 8);
        toggleFont(doc);
      },
    },
    false,
    request_no,
  );
  layout.move(6);

  // SITE SPECIFICATIONS
  toggleFont(doc, "bold");
  doc.text(`02 SPECIFICATIONS`, CONTENT.left, layout.currentY);
  toggleFont(doc);
  doc.setFontSize(7);
  layout.move(2.25);
  const freeMaterialAddOns: FreeAddOns = conforme.sites.reduce(
    (acc, item) => {
      if (item.material.free > 0) {
        const cost = getSiteMaterial(item.size, item.site_code);
        acc.free += item.material.free;
        acc.value += cost;
      }

      return acc;
    },
    {
      label: "MATERIAL PRINTING",
      free: 0,
      value: 0,
      total: 0,
    },
  );
  const paidMaterialAddOns: PaidAddOns = conforme.sites.reduce(
    (acc, item) => {
      if (item.material.paid > 0) {
        const srp = getSiteMaterial(item.size, item.site_code);
        const cost = getSiteMaterial(
          item.size,
          item.site_code,
          item.material.cost,
        );
        acc.paid += item.material.paid;
        acc.value += srp;
        acc.total += cost;
      }

      return acc;
    },
    {
      label: "MATERIAL PRINTING",
      paid: 0,
      value: 0,
      total: 0,
    },
  );

  const items: ConformeItem[] = [
    ...conforme.sites.map((s) => ({ ...s, type: "SITE" as const })),
    ...conforme.leds.map((s) => ({ ...s, type: "LED" as const })),
  ];
  const body = items.map((item) => {
    const definitions = options.displayRateCard
      ? defs.BODY.WITH_RATE_CARD
      : defs.BODY.DEFAULT;

    switch (item.type) {
      case "SITE":
        return definitions.SITE;

      case "LED":
        return definitions.LED;

      case "ADD_ON":
        return definitions.ADD_ON;

      case "FREE_ADD_ON":
        return defs.BODY.DEFAULT.FREE_ADD_ON;

      case "PAID_ADD_ON":
        return defs.BODY.DEFAULT.PAID_ADD_ON;
    }
  });
  if (paidMaterialAddOns.paid > 0) {
    const paidMaterial = !options.displayRateCard
      ? defs.BODY.DEFAULT.PAID_ADD_ON
      : defs.BODY.WITH_RATE_CARD.PAID_ADD_ON;
    body.push(paidMaterial);
    items.push({ ...paidMaterialAddOns, type: "PAID_ADD_ON" as const });
  }
  if (conforme.add_ons.length > 0) {
    const addOnTemplate = !options.displayRateCard
      ? defs.BODY.DEFAULT.ADD_ON
      : defs.BODY.WITH_RATE_CARD.ADD_ON;
    body.push(...conforme.add_ons.map(() => addOnTemplate));
    items.push(
      ...conforme.add_ons.map((s) => ({ ...s, type: "ADD_ON" as const })),
    );
  }
  if (freeMaterialAddOns.free > 0) {
    const freeMaterial = !options.displayRateCard
      ? defs.BODY.DEFAULT.FREE_ADD_ON
      : defs.BODY.WITH_RATE_CARD.FREE_ADD_ON;
    body.push(freeMaterial);
    items.push({ ...freeMaterialAddOns, type: "FREE_ADD_ON" as const });
  }

  const siteInstallations = getFreeInstallations(conforme);

  let tableTop = 0;
  let tableBottom = 0;

  let endColumn = defs.HEADER_SET.item_cost;
  let head = defs.HEADER.DEFAULT;

  if (options.displayTotalCost) {
    endColumn = defs.HEADER_SET.item_total;
    head = defs.HEADER.WITH_TOTAL_COST;
  } else if (options.displayRateCard || options.mergePackageCost) {
    if (options.displayRateCard && options.mergePackageCost) {
      endColumn = defs.HEADER_SET.standard_rental;
      head = defs.HEADER.WITH_RATE_CARD_MERGED;
    } else if (options.displayRateCard) {
      endColumn = defs.HEADER_SET.standard_item;
      head = defs.HEADER.WITH_RATE_CARD;
    } else {
      endColumn = defs.HEADER_SET.item_rental;
      head = defs.HEADER.WITH_MERGED_COST;
    }
  }
  const columns = [
    "site",
    "details",
    "dimensions",
    "contract period",
    ...endColumn,
  ];

  addTable(
    doc,
    layout,
    {
      theme: "plain",
      head: [head],
      body: body,
      styles: {
        font: "aptos",
        fontSize: 6,
        cellPadding: 0,
      },

      columnStyles:
        options.displayRateCard ||
        options.displayTotalCost ||
        options.mergePackageCost
          ? defs.COLUMN_STYLES.WITH_RATE_CARD
          : defs.COLUMN_STYLES.DEFAULT,

      headStyles: {
        minCellHeight: 7,
        fillColor: [0, 146, 224],
        textColor: [255, 255, 255],
        font: "aptos",
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 0,
      },

      didParseCell: (data) => {
        if (data.section === "head") {
          data.cell.text = [];
          return;
        }

        if (data.section === "body") {
          data.cell.text = [];

          const rawRow = data.row.raw as string[];
          const rowType = rawRow[0] as "SITE" | "LED" | "ADD_ON";

          data.cell.styles.minCellHeight =
            rowType === "SITE" ? 29 : rowType === "LED" ? 12 : 9.5;

          const column = columns[data.column.index];

          if (column === "rental cost") {
            if (data.row.index === 0) {
              data.cell.rowSpan = body.length;
            } else {
              data.cell.text = [];
            }
          }
        }
      },

      didDrawCell: (data) => {
        if (data.section === "head" && data.row.index === 0) {
          tableTop = data.cell.y;
        }

        if (data.section === "body") {
          tableBottom = data.cell.y + data.cell.height;
        }
        if (data.section === "head") {
          const headersArray = head;

          const headers = headersArray.map((head, index) => {
            return {
              title: head,
              align:
                index === 0
                  ? ("left" as const)
                  : index === headersArray.length - 1
                    ? ("right" as const)
                    : ("center" as const),
              subheader:
                head === "DIMENSIONS"
                  ? "(H x W)"
                  : index === headersArray.length - 1
                    ? "(Discounts applied)"
                    : "",
            };
          });

          const header = headers[data.column.index];

          const padding = 2;

          let x: number;

          if (header.align === "right") {
            x = data.cell.x + data.cell.width - padding;
          } else {
            x = data.cell.x + data.cell.width / 2;
          }

          // MAIN HEADER
          doc.setFont("aptos", "black");
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);

          const headerY = data.cell.y + (header.subheader !== "" ? 3.5 : 4.2);
          doc.text(header.title, x, headerY, {
            align: header.align,
          });

          // SUBHEADER
          if (header.subheader) {
            doc.setFont("aptos", "normal");
            doc.setFontSize(6);
            doc.setTextColor(220, 235, 245);

            doc.text(header.subheader, x, data.cell.y + 5.5, {
              align: header.align,
            });
          }
          return;
        }
        if (
          data.section === "body" &&
          columns[data.column.index] === "rental cost" &&
          data.row.index === 0
        ) {
          const x = data.cell.x;

          doc.setDrawColor(158, 158, 158);
          doc.setLineWidth(0.1);

          doc.line(x, data.cell.y, x, data.cell.y + data.cell.height);
        }
        if (data.section !== "body") return;
        const colIndex = data.column.index;
        const row = data.row.index;
        if (colIndex === 0 && row < data.table.body.length - 1) {
          const lineY = data.cell.y + data.cell.height;
          const tableLeft = data.cell.x;

          const rentalCostIndex = columns.indexOf("rental cost");

          const lineRight =
            rentalCostIndex >= 0
              ? tableLeft +
                data.table.columns
                  .slice(0, rentalCostIndex)
                  .reduce((sum, column) => sum + column.width, 0)
              : tableLeft +
                data.table.columns.reduce(
                  (sum, column) => sum + column.width,
                  0,
                );

          doc.setDrawColor(158, 158, 158);
          doc.setLineWidth(0.1);

          doc.line(tableLeft, lineY, lineRight, lineY);
        }

        let rentalCost = 0;
        const item = items[row];

        if (options.mergePackageCost) {
          rentalCost = items.reduce((acc, item) => {
            if (item.type === "SITE") {
              acc += item.monthly_rate;
            } else if (item.type === "LED") {
              const duration = getDurationInDays(item.start, item.end);
              const spots = item.spots_count;
              const package_rate = item.package_rate;
              if (package_rate !== 0) {
                acc += (package_rate / duration) * 30;
              } else {
                acc += spots * item.spots_price * 30;
              }
            }
            return acc;
          }, 0);
        }

        const x = data.cell.x;
        const y = data.cell.y;
        const width = data.cell.width;
        const height = data.cell.height;
        const isAddOn =
          item.type === "ADD_ON" ||
          item.type === "FREE_ADD_ON" ||
          item.type === "PAID_ADD_ON";

        const padding = 2;

        const col = columns[colIndex];
        switch (col) {
          case "site": {
            doc.setFontSize(7);
            toggleFont(doc, "bold");
            if (item.type === "SITE") {
              renderColumnWithImage(
                doc,
                item.image!,
                item.site_code,
                x,
                y,
                width,
                padding,
              );
            } else if (item.type === "FREE_ADD_ON") {
              const free = item.free;
              const label = item.label;
              const text = `${free}x ${label}`;
              const lines = doc.splitTextToSize(text, width - padding * 2);
              const lineHeight = 3;

              const textHeight = lines.length * lineHeight;

              const textY = y + (height - textHeight) / 2 + lineHeight - 0.5;

              doc.text(lines, x + padding, textY, {
                align: "left",
              });
            } else if (item.type === "PAID_ADD_ON") {
              const paid = item.paid;
              const text = `${paid}x MATERIAL PRINTING`;
              const lines = doc.splitTextToSize(text, width - padding * 2);
              const lineHeight = 3;

              const textHeight = lines.length * lineHeight;

              const textY = y + (height - textHeight) / 2 + lineHeight - 0.5;

              doc.text(lines, x + padding, textY, {
                align: "left",
              });
            } else {
              const text =
                item.type === "LED"
                  ? item.site_code
                  : `${item.qty}x ${item.name.toUpperCase()}`;

              const lines = doc.splitTextToSize(text, width - padding * 2);
              const lineHeight = 3;

              const textHeight = lines.length * lineHeight;

              const textY = y + (height - textHeight) / 2 + lineHeight - 0.5;

              doc.text(lines, x + padding, textY, {
                align: "left",
              });
            }
            break;
          }
          case "details": {
            if (isAddOn) return;

            const padding = 2;
            const x = data.cell.x + padding;
            const maxWidth = data.cell.width - padding * 2;

            toggleFont(doc);
            doc.setFontSize(7);

            const value1 = doc.splitTextToSize(item.address ?? "", maxWidth);

            const isLED = item.type === "LED";

            const value2 = isLED
              ? []
              : doc.splitTextToSize(item.board_facing ?? "", maxWidth);

            let addtValue = `*w/ FREE ${siteInstallations.get(item.site_code)}x INSTALLATION & DISMANTLING`;

            if (isLED) {
              const duration = getDurationInDays(item.start, item.end);
              addtValue = `${formatAmount(item.spots_count * duration, {
                style: "decimal",
              })} spots total (${item.spots_count} spots/day)`;
            }

            const value3 = doc.splitTextToSize(addtValue, maxWidth);

            const lineHeight = 2.5;
            const gap = 1.5;

            const value1Height = value1.length * lineHeight;
            const value2Height = value2.length * lineHeight;
            const value3Height = value3.length * lineHeight;

            const totalHeight = isLED
              ? value1Height + gap + value3Height
              : value1Height + gap + value2Height + gap + value3Height;

            let y =
              data.cell.y + (data.cell.height - totalHeight) / 2 + lineHeight;

            // Address
            doc.setFontSize(7);
            toggleFont(doc, "normal");
            doc.text(value1, x, y);

            y += value1Height + gap;

            // Board facing — non-LED only
            if (!isLED) {
              doc.setFontSize(6);
              toggleFont(doc, "italic");
              doc.text(value2, x, y);

              y += value2Height + gap;
            }

            // Additional information
            doc.setFontSize(7);
            toggleFont(doc, "bold");
            doc.text(value3, x, y);

            break;
          }
          case "dimensions": {
            if (isAddOn) return;

            toggleFont(doc);
            doc.setFontSize(8);

            doc.text(
              item.size,
              data.cell.x + data.cell.width / 2,
              data.cell.y + data.cell.height / 2,
              {
                align: "center",
                baseline: "middle",
              },
            );

            break;
          }
          case "contract period": {
            if (isAddOn) return;

            const padding = 2;
            const x = data.cell.x + padding;
            const maxWidth = data.cell.width - padding * 2;

            toggleFont(doc);
            doc.setFontSize(8);

            const value1 = `${format(new Date(item.start), "PP")} - ${format(new Date(item.end), "PP")}`;

            let duration: string;

            if (item.type === "SITE") {
              const months = getMonthlyDuration(item.start, item.end);

              duration = `${months} mo${months > 1 ? "s" : ""}.`;
            } else {
              const days = getDurationInDays(item.start, item.end);

              duration =
                days % 30 === 0
                  ? `${days / 30} mo${days / 30 > 1 ? "s" : ""}.`
                  : `${days} days`;
            }

            const value2 = duration;

            const lines1 = doc.splitTextToSize(value1 ?? "", maxWidth);
            const lines2 = doc.splitTextToSize(value2, maxWidth);

            const lineHeight = 2;
            const gap = 1;

            const height1 = lines1.length * lineHeight;
            const height2 = lines2.length * lineHeight;
            const totalHeight = height1 + gap + height2;

            // Center the entire block
            let y =
              data.cell.y + (data.cell.height - totalHeight) / 2 + lineHeight;

            // Center first value horizontally
            doc.text(lines1, x + maxWidth / 2, y, {
              align: "center",
            });

            y += height1 + gap + 1;

            // Center second value horizontally
            doc.text(lines2, x + maxWidth / 2, y, {
              align: "center",
            });

            break;
          }
          case "standard cost": {
            if (item.type !== "LED" && item.type !== "SITE") return;
            toggleFont(doc);
            doc.setFontSize(8);

            let text = "0";
            if (item.type === "SITE") {
              text = `${formatAmount(
                item.offered_rate > 0 ? item.offered_rate : item.monthly_rate,
              )}/mo.`;
            } else {
              if (!item.is_free) {
                if (item.package_rate) {
                  text = formatAmount(item.package_rate);
                } else {
                  const { spots_count, spots_price } = item;

                  const days = getDurationInDays(item.start, item.end);

                  text = `${formatAmount(spots_count * spots_price * days)}`;
                }
              }
            }

            const padding = 2;

            doc.text(
              text,
              data.cell.x + data.cell.width - padding,
              data.cell.y + data.cell.height / 2,
              {
                align: "right",
                baseline: "middle",
              },
            );

            break;
          }
          case "item cost": {
            toggleFont(doc);
            doc.setFontSize(8);

            let text = "0";

            if (item.type === "ADD_ON") {
              if (!item.is_free) {
                text = formatAmount(item.total);
              } else {
                text = formatAmount(0);
              }
            } else if (item.type === "PAID_ADD_ON") {
              text = formatAmount(item.total);
            } else if (item.type === "FREE_ADD_ON") {
              // if (options.displayTotalCost || options.mergePackageCost) {
              //   text = formatAmount(item.value);
              // } else {
              //   text = formatAmount(0);
              // }
              text = formatAmount(0);
            } else if (item.type === "SITE") {
              if (item.monthly_rate !== 0) {
                text = formatAmount(item.monthly_rate);
              }
            } else {
              if (!item.is_free) {
                if (item.package_rate) {
                  text = formatAmount(item.package_rate);
                } else {
                  const { spots_count, spots_price } = item;

                  const days = getDurationInDays(item.start, item.end);

                  text = formatAmount(spots_count * spots_price * days);
                }
              }
            }

            const displayText = item.type === "SITE" ? `${text}/mo.` : text;

            const padding = 2;

            doc.text(
              displayText,
              data.cell.x + data.cell.width - padding,
              data.cell.y + data.cell.height / 2,
              {
                align: "right",
                baseline: "middle",
              },
            );

            break;
          }
          case "rental cost": {
            toggleFont(doc);
            doc.setFontSize(7.5);

            const displayText = `${formatAmount(rentalCost)}/mo.`;

            const padding = 2;

            doc.text(
              displayText,
              data.cell.x + data.cell.width - padding,
              data.cell.y + data.cell.height / 2,
              {
                align: "right",
                baseline: "middle",
              },
            );

            break;
          }
          case "total cost": {
            toggleFont(doc);
            doc.setFontSize(8);

            let text = "0";

            if (item.type === "ADD_ON") {
              if (!item.is_free) {
                text = formatAmount(item.total);
              } else {
                text = "FREE";
              }
            } else if (item.type === "PAID_ADD_ON") {
              text = formatAmount(item.total);
            } else if (item.type === "FREE_ADD_ON") {
              text = "FREE";
            } else if (item.type === "SITE") {
              const duration = getMonthlyDuration(item.start, item.end);
              text = formatAmount(item.monthly_rate * duration);
            } else {
              if (item.package_rate) {
                text = formatAmount(item.package_rate);
              } else {
                const { spots_count, spots_price } = item;

                const days = getDurationInDays(item.start, item.end);

                text = formatAmount(spots_count * spots_price * days);
              }
            }

            const displayText = text;

            const padding = 2;

            doc.text(
              displayText,
              data.cell.x + data.cell.width - padding,
              data.cell.y + data.cell.height / 2,
              {
                align: "right",
                baseline: "middle",
              },
            );

            break;
          }
        }
      },
    },
    false,
    request_no,
  );
  doc.setDrawColor(158, 158, 158);
  doc.setLineWidth(0.1);

  doc.rect(MARGIN, tableTop, CONTENT.width, tableBottom - tableTop);
  layout.move(2.5);
  const parts = [
    { text: "NOTE: All amounts are ", bold: false },
    { text: "VAT exclusive", bold: true },
    { text: " unless otherwise stated as ", bold: false },
    { text: "VAT inclusive (VAT Inc.)", bold: true },
  ];

  const x = MARGIN;
  const y = layout.currentY;

  let currentX = x;

  for (const part of parts) {
    toggleFont(doc, part.bold ? "black-italic" : "italic");

    doc.text(part.text, currentX, y);

    currentX += doc.getTextWidth(part.text);
  }
  const rentalCost = getSubTotal(conforme);
  const productionCost = getTotalProductionCost(conforme);
  const subTotal = rentalCost + productionCost;
  const vat = getVat(subTotal);
  const grandTotal = options.removeVAT ? subTotal : subTotal + vat;
  addTable(
    doc,
    layout,
    {
      body: [
        ["RENTAL COST", formatAmount(rentalCost)],
        ["PRODUCTION COST", formatAmount(productionCost)],
        ["VAT", options.removeVAT ? "Exempt" : formatAmount(vat)],
        ["GRAND TOTAL (VAT Inclusive)", formatAmount(grandTotal)],
      ],

      tableWidth: 62.5,

      columnStyles: {
        0: {
          cellWidth: 40,
          halign: "right",
        },
        1: {
          cellWidth: 22.5,
          halign: "right",
        },
      },

      theme: "plain",

      styles: {
        font: "aptos",
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 0.5,
        halign: "right",
        valign: "middle",
      },

      didParseCell: (data) => {
        if (
          data.section === "body" &&
          data.row.index === 3 &&
          data.column.index === 0
        ) {
          data.cell.text = [];
        }
      },

      didDrawCell: (data) => {
        if (
          data.section === "body" &&
          data.row.index === 3 &&
          data.column.index === 0
        ) {
          const padding = 1;
          const x = data.cell.x + data.cell.width - padding;
          const y = data.cell.y + data.cell.height / 2;

          const boldText = "GRAND TOTAL";
          const normalText = " (VAT Inclusive)";

          // Measure the normal-weight part
          toggleFont(doc);
          doc.setFontSize(8);
          const normalWidth = doc.getTextWidth(normalText);

          // Bold part
          toggleFont(doc, "bold");
          doc.setFontSize(8);
          doc.text(boldText, x - normalWidth, y, {
            align: "right",
            baseline: "middle",
          });

          // Normal part
          toggleFont(doc);
          doc.setFontSize(8);
          doc.text(normalText, x, y, {
            align: "right",
            baseline: "middle",
          });
        }
      },
    },
    true,
    request_no,
  );
  layout.move(4);
  doc.setFontSize(7);
  toggleFont(doc, "bold");
  doc.text(`03 TERMS & CONDITIONS`, CONTENT.left, layout.currentY);
  layout.move(1);
  doc.line(CONTENT.left, layout.currentY, CONTENT.right, layout.currentY);
  layout.move(2);
  toggleFont(doc);
  const paymentTerms = getPaymentTermTexts(conforme);

  const initialTerms = paymentTerms.slice(0, 7);
  const otherTerms = paymentTerms.slice(7);

  doc.setFontSize(7);
  addTable(
    doc,
    layout,
    {
      body: initialTerms.map((term) => [`•  ${term.text}`]),

      tableWidth: CONTENT.width,

      columnStyles: {
        0: {
          cellWidth: CONTENT.width,
          halign: "left",
        },
      },

      theme: "plain",

      styles: {
        font: "aptos",
        fontSize: 8,
        cellPadding: {
          top: 0.5,
          right: 1,
          bottom: 0.5,
          left: 2,
        },
        valign: "top",
        halign: "left",
        overflow: "linebreak",
      },

      didParseCell: (data) => {
        if (data.section !== "body") return;

        const term = initialTerms[data.row.index];

        if (!term) return;

        data.cell.styles.halign = "justify";
        data.cell.styles.cellPadding = {
          top: 0.5,
          right: 1,
          bottom: 0.5,
          left: term.indent,
        };

        if (term.isItalic) {
          data.cell.styles.fontStyle = "italic";
        } else if (term.isBold) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    },
    false,
    request_no,
  );
  layout.move(1);
  const productionTerms = generateAdditionalItems(conforme);
  addTable(
    doc,
    layout,
    {
      body: productionTerms.map((term) => [`•  ${term}`]),

      tableWidth: CONTENT.width,

      columnStyles: {
        0: {
          cellWidth: CONTENT.width,
          halign: "left",
        },
      },

      theme: "plain",

      styles: {
        font: "aptos",
        fontSize: 8,
        cellPadding: {
          top: 0.5,
          right: 1,
          bottom: 0.5,
          left: 2,
        },
        valign: "top",
        halign: "left",
        overflow: "linebreak",
      },

      didParseCell: (data) => {
        if (data.section !== "body") return;

        const term = productionTerms[data.row.index];

        if (!term) return;

        data.cell.styles.halign = "justify";
        data.cell.styles.cellPadding = {
          top: 0.5,
          right: 1,
          bottom: 0.5,
          left: 2,
        };
      },
    },
    false,
    request_no,
  );
  layout.move(1);
  addTable(
    doc,
    layout,
    {
      body: otherTerms.map((term) => [`• ${term.text}`]),

      tableWidth: CONTENT.width,

      columnStyles: {
        0: {
          cellWidth: CONTENT.width,
          halign: "left",
        },
      },

      theme: "plain",

      styles: {
        font: "aptos",
        fontSize: 8,
        cellPadding: {
          top: 0.5,
          right: 1,
          bottom: 0.5,
          left: 2,
        },
        valign: "top",
        halign: "left",
        overflow: "linebreak",
      },

      didParseCell: (data) => {
        if (data.section !== "body") return;

        const term = otherTerms[data.row.index];

        if (!term) return;

        data.cell.styles.halign = "justify";
        data.cell.styles.cellPadding = {
          top: 0.5,
          right: 1,
          bottom: 0.5,
          left: term.indent,
        };

        if (term.isBold && term.isItalic) {
          data.cell.styles.fontStyle = "bolditalic";
        } else if (term.isItalic) {
          data.cell.styles.fontStyle = "italic";
        } else if (term.isBold) {
          data.cell.styles.fontStyle = "bold";
        }
      },
    },
    false,
    request_no,
  );
  layout.move(8);

  const internal = [
    ...conforme.internal_signatory,
    {
      name: "Michael San Mendoza",
      title: "Sales Department Head",
    },
  ];

  const external = conforme.external_signatory;

  const rowCount = Math.max(internal.length, external.length);

  const signatoryBody = [
    [
      "Should you find the above provisions agreeable, kindly signify your conformity on the space provided below.",
      "",
    ],
    ["UNITED NEON ADVERTISING, INC.", conforme.business_name.toUpperCase()],
    ...Array.from({ length: rowCount }, () => ["", ""]),
  ];
  // SIGNATORIES
  addTable(
    doc,
    layout,
    {
      body: signatoryBody,

      tableWidth: CONTENT.width,

      columnStyles: {
        0: {
          cellWidth: CONTENT.width / 2,
          halign: "left",
        },
        1: {
          cellWidth: CONTENT.width / 2,
          halign: "left",
        },
      },

      theme: "plain",

      styles: {
        font: "aptos",
        fontSize: 8,
        fontStyle: "normal",
        cellPadding: {
          top: 1,
          right: 0,
          bottom: 1,
          left: 0,
        },
        lineWidth: 0,
        valign: "top",
        halign: "left",
        overflow: "linebreak",
      },

      didParseCell: (data) => {
        if (data.section !== "body") return;

        const row = data.row.index;

        // CONFORMITY TEXT
        if (row === 0) {
          if (data.column.index === 0) {
            data.cell.colSpan = 2;
            data.cell.styles.minCellHeight = 5;
          } else {
            data.cell.text = [];
          }

          return;
        }

        // SIGNATORY HEADER
        if (row === 1) {
          data.cell.styles.font = "aptos";
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fontSize = 8;
          data.cell.styles.minCellHeight = 5;
          return;
        }

        // SIGNATORY BODY
        data.cell.text = [];
        data.cell.styles.minCellHeight = 20;
      },

      didDrawCell: (data) => {
        if (data.section !== "body") return;

        const row = data.row.index;

        // Skip conformity text and header
        if (row < 2) return;

        const signatoryIndex = row - 2;

        const signatory =
          data.column.index === 0
            ? internal[signatoryIndex]
            : external[signatoryIndex];

        if (!signatory) return;

        const x = data.cell.x;
        const y = data.cell.y + 20;

        // Name
        toggleFont(doc, "bold");
        doc.setFontSize(8);

        doc.text(signatory.name.toUpperCase(), x, y);

        // Title
        toggleFont(doc);
        doc.setFontSize(7);

        doc.text(capitalize(signatory.title, " "), x, y + 3);
      },
    },
    false,
    request_no,
    true,
  );

  if (import.meta.env.DEV) {
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl, "_blank");
  } else {
    /*
     * Save
     */
    doc.save(`CE#${request_no}.pdf`);
  }

  decoratedPages.clear();
}

/*
 * AutoTable helper
 */
function addTable(
  doc: jsPDF,
  layout: PDFLayout,
  options: UserOptions,
  rightAlign?: boolean,
  CENo?: string,
  keepTogether: boolean = false,
) {
  autoTable(doc, {
    ...options,

    /*
     * Start where the previous content/table ended
     */
    startY: layout.currentY - 1,

    margin: {
      left: rightAlign ? CONTENT.right - 64.5 : MARGIN,
      right: MARGIN,
      top: MARGIN + 8,
      bottom: MARGIN + 12,
    },

    tableWidth: CONTENT.width,
    ...(keepTogether && {
      pageBreak: "avoid" as const,
    }),

    willDrawPage: () => {
      const pageNumber = doc.getCurrentPageInfo().pageNumber;

      if (decoratedPages.has(pageNumber)) return;

      decoratedPages.add(pageNumber);

      addHeader(doc);
      addFooter(doc);

      doc.setFontSize(8);
      toggleFont(doc, "normal");

      doc.text(`CE#${CENo} | ${pageNumber}`, CONTENT.right, PAGE_HEIGHT - 8, {
        align: "right",
      });
    },
  });

  /*
   * AutoTable exposes the final Y position.
   */
  if (doc.lastAutoTable) {
    layout.setY(doc.lastAutoTable.finalY);
  }
}

function addHeader(doc: jsPDF) {
  doc.addImage("/header.png", "PNG", 0, 0, PAGE_WIDTH, HEADER_HEIGHT);
}

function addFooter(doc: jsPDF) {
  doc.addImage(
    "/footer.png",
    "PNG",
    0,
    PAGE_HEIGHT - FOOTER_HEIGHT,
    PAGE_WIDTH,
    FOOTER_HEIGHT,
  );
}

function toggleFont(doc: jsPDF, weight: string = "normal") {
  doc.setFont("Aptos", weight);
}

function renderColumnWithImage(
  doc: jsPDF,
  image: string,
  site_code: string,
  x: number,
  y: number,
  w: number,
  p: number,
) {
  const imageSize = Math.max(w - p, 22);

  const imageX = x + (w - imageSize) / 2;
  const imageY = y + p;

  doc.setFontSize(7);
  doc.addImage(image, "JPEG", imageX, imageY, imageSize, imageSize * (9 / 16));
  toggleFont(doc, "black");
  doc.text(site_code, x + w / 2, imageY + imageSize * (9 / 16) + 3, {
    align: "center",
    maxWidth: w - p,
  });
}

interface PDFPaymentTerm {
  text: string;
  isBold: boolean;
  isItalic: boolean;
  indent: number;
}
function getPaymentTermTexts(conforme: Conforme): PDFPaymentTerm[] {
  const result: PDFPaymentTerm[] = [];
  const terms = conforme.terms;
  // Monthly payment
  const { payment_method, startDate } = terms.monthly_payment;

  result.push({
    text: `Payment Terms:`,
    isBold: true,
    isItalic: false,
    indent: 2,
  });
  result.push({
    text: `Monthly payment starts on the ${ordinal(
      startDate,
    )} day before the commencement of the billboard via ${
      payment_method === "PDC" ? "post-dated cheques" : "bank transfer"
    }.`,
    isBold: false,
    isItalic: false,
    indent: 6,
  });

  // Contract payment terms
  Object.entries(terms.contract_terms).forEach(([month, rules]) => {
    const parts: string[] = [`For ${month}-month contract: `];

    rules.forEach((item) => {
      if (item.type === "ADVANCE") {
        parts.push(
          `${item.months} month${item.months > 1 ? "s" : ""} advance payment applicable to the ${
            appliesToPayment[item.applies_to]
          } ${
            item.months !== 1 ? item.months : ""
          } month${item.months > 1 ? "s" : ""} of the contract${
            rules.some((r) => r.type === "DEPOSIT") ? " and " : "."
          }`,
        );
      }

      if (item.type === "DEPOSIT") {
        parts.push(
          `${item.months} month${item.months > 1 ? "s" : ""} deposit applicable to the ${
            appliesToPayment[item.applies_to]
          } ${
            item.months !== 1 ? item.months : ""
          } month${item.months > 1 ? "s" : ""} of the contract.`,
        );
      }
    });

    if (Number(month) > 1) {
      parts.push(" Remaining balances will be paid on a monthly basis.");
    }

    result.push({
      text: parts.join(""),
      isBold: false,
      isItalic: false,
      indent: 6,
    });
  });
  // Other terms
  const otherPaymentTerms = terms.other_terms.slice(0, 7);
  const remainingTerms = terms.other_terms.slice(7);
  otherPaymentTerms.forEach((term: TermsAndConditions) => {
    if (!term.use) return;

    let text = term.content;

    if (term.value !== undefined) {
      text = text.replace("[value]", formatAmount(term.value));
    }

    if (term.label) {
      text = `${term.label}: ${text}`;
    }

    result.push({
      text,
      isBold: term.isBold,
      isItalic: term.isItalic ?? false,
      indent: term.indented ? 6 : 2,
    });
  });
  remainingTerms.forEach((term: TermsAndConditions) => {
    if (!term.use) return;

    let text = term.content;

    if (term.value !== undefined) {
      text = text.replace("[value]", formatAmount(term.value));
    }

    if (term.label) {
      text = `${term.label}: ${text}`;
    }

    result.push({
      text,
      isBold: term.isBold,
      isItalic: term.isItalic ?? false,
      indent: 2,
    });
  });

  return result;
}

function getFreeInstallations(conforme: Conforme) {
  const installations = new Map<string, number>();

  conforme.sites.forEach((site) => {
    const duration = getMonthlyDuration(site.start, site.end);
    const installationQty =
      getDefaultInstallations(duration) + site.installation.free;
    installations.set(
      site.site_code,
      Math.max(installations.get(site.site_code) ?? 0, installationQty),
    );
  });

  return installations;
}
function generateAdditionalItems(conforme: Conforme): string[] {
  const terms = new Set<string>();
  const { material_printing, installation_and_dismantling } =
    conforme.production;

  if (material_printing.format === "fixed") {
    const materialCost = material_printing.value as number;
    terms.add(
      `Additional material printing requested by the Client shall be charged at ${formatAmount(material_printing.internal ? 25 : materialCost)}/sq. ft. + VAT per site.`,
    );
  } else {
    const materialCost = material_printing.value as {
      metro_manila: number;
      provincial: number;
    };
    terms.add(
      `Additional material printing requested by the Client shall be charged at ${formatAmount(material_printing.internal ? 23 : materialCost.metro_manila)}/sq. ft. + VAT per site for Metro Manila, and  ${formatAmount(material_printing.internal ? 25 : materialCost.provincial)}/sq. ft. + VAT per site for outside Metro Manila, including NLEX and SLEX.`,
    );
  }

  const installationRate = conforme.sites.reduce((acc, item) => {
    const installationCost = getSiteInstallationCost(item.size, item.region);
    acc = installationCost > acc ? installationCost : acc;
    return acc;
  }, 0);
  terms.add(
    `Additional installation and dismantling requested by the Client shall be charged at ${formatAmount(installation_and_dismantling.internal ? installationRate : installation_and_dismantling.value)} + VAT per site.`,
  );

  return [...terms];
}
// function getMonthlyRate(conforme: Conforme) {
//   const siteMonthly = conforme.sites.reduce((acc, item) => {
//     acc += item.monthly_rate;
//     return acc;
//   }, 0);
//   const ledMonthly = conforme.leds.reduce((acc, item) => {
//     if (item.is_free) return acc;
//     let packageRate = item.package_rate;
//     const duration = getDurationInDays(item.start, item.end);

//     if (packageRate > 0) {
//       acc += packageRate;
//     } else {
//       const spots_count = item.spots_count;
//       const spots_price = item.spots_price;
//       packageRate = spots_count * spots_price * duration;
//     }

//     if (duration % 30 === 0) {
//       acc += packageRate / (duration / 30);
//     } else {
//       acc += packageRate;
//     }
//     return acc;
//   }, 0);
//   return siteMonthly + ledMonthly;
// }

function getTotalAddOns(conforme: Conforme) {
  return conforme.add_ons.reduce((acc, item) => {
    if (item.is_free) return acc;
    acc += item.total;
    return acc;
  }, 0);
}

function getTotalProductionCost(conforme: Conforme) {
  const { installation, material } = conforme.sites.reduce(
    (acc, item) => {
      const { installation, material } = item;
      if (installation.paid === 0 && material.paid === 0) return acc;

      const cost =
        installation.cost > 0
          ? installation.cost
          : getSiteInstallationCost(item.size, item.region);
      acc.installation += cost * installation.paid;

      const materialCost = getSiteMaterial(
        item.size,
        item.site_code,
        material.cost,
      );
      acc.material += materialCost * material.paid;
      return acc;
    },
    { installation: 0, material: 0 },
  );

  return installation + material;
}

function getSubTotal(conforme: Conforme) {
  const siteMonthly = conforme.sites.reduce((acc, item) => {
    const monthlyTotal = getTotalMonthly(
      item.monthly_rate,
      item.end,
      item.start,
    );

    acc += monthlyTotal;
    return acc;
  }, 0);
  const ledTotal = conforme.leds.reduce((acc, item) => {
    const duration = getDurationInDays(item.start, item.end);
    if (item.is_free) return acc;

    if (item.package_rate > 0) {
      acc += item.package_rate;
      return acc;
    }
    const spots = item.spots_count;
    const price = item.spots_price;

    acc += spots * price * duration;

    // acc += monthlyTotal;
    return acc;
  }, 0);
  return siteMonthly + ledTotal + getTotalAddOns(conforme);
}

function getVat(subTotal: number) {
  return subTotal * 0.12;
}

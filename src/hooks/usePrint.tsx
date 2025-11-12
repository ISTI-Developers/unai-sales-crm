import { useDeck } from "@/providers/deck.provider";
import PptxGenJS from "pptxgenjs";
import bg from "@/assets/finalbg.png";
import mockup from "@/assets/mockup.png";
import {
  applyPriceAdjustment,
  formatAmount,
  Inches,
} from "@/lib/format";
import { capitalize } from "@/lib/utils";
import { format, isBefore } from "date-fns";
import { catchError } from "@/providers/api";

export const useGeneratePowerpoint = () => {
  const {
    selectedSites: sites,
    options,
    selectedOptions: config,
    toAll: applyToAll,
    maps,
    setPrintStatus,
    setGenerateStatus
  } = useDeck();

  const start = new Date().getTime();

  const margin = 0.4;

  function downloadPptxFromArrayBuffer(buffer: string | ArrayBuffer | Blob | Uint8Array<ArrayBufferLike>, fileName = "presentation.pptx") {
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  const print = async () => {
    if (sites.length === 0) return;
    if (maps.length === 0) return;

    try {
      console.log("Start:", start)
      setGenerateStatus(true)
      const presentation = new PptxGenJS();

      presentation.defineLayout({
        name: "Widescreen",
        width: Inches(33.858),
        height: Inches(19.05),
      });
      presentation.layout = "Widescreen";

      for (const site of sites) {
        const slide = presentation.addSlide();
        slide.background = { path: bg };
        const siteConfig = config.find(
          (item) => item.site_code === site.site_code
        );
        const image = siteConfig?.images;
        const landmarks = siteConfig?.landmarks;

        const { price } = site;
        let tempPrice = Number(price);

        if (Object.keys(options).length !== 0) {
          const adjustments = options.price_adjustment;
          const exchange = options.currency_exchange;
          if (adjustments) {
            const globalAdjustment =
              applyToAll && adjustments.length === 1 ? adjustments[0] : null;
            const siteAdjustment = !applyToAll
              ? adjustments.find((item) =>
                item.apply_to.some((a) => a.value === site.site_code)
              )
              : null;

            const adjustmentToApply = globalAdjustment || siteAdjustment;

            if (adjustmentToApply) {
              tempPrice = applyPriceAdjustment(tempPrice, {
                amount: adjustmentToApply.amount,
                type: adjustmentToApply.type as "percent" | "flat",
                operation: adjustmentToApply.operation as "add" | "subtract",
              });
            }
          }

          if (exchange && exchange.equivalent) {
            tempPrice = tempPrice / Number(exchange.equivalent);
          }
        }

        const area = `Billboard Site in ${capitalize(site.city)}`;
        const headerHeight = Inches(1.93);
        const detailsSection = Inches(21.48);
        const contentSection = headerHeight + Inches(0.8);

        const availability = site.availability
          ? isBefore(new Date(site.availability), new Date()) ? "OPEN" : format(new Date(site.availability), "MMM d, yyyy")
          : "OPEN";

        slide.addText(area, {
          w: Inches(33.33),
          h: headerHeight,
          x: 0,
          y: 0,
          fontFace: "Aptos",
          fontSize: 18,
          bold: true,
          align: "right",
          color: "FFFFFF",
        });
        slide.addText("AVAILABILITY: ", {
          w: 3,
          h: margin,
          x: detailsSection,
          y: contentSection - Inches(0.2),
          color: "76899E",
          fontFace: "Aptos",
          fontSize: 11,
        });
        slide.addText(availability, {
          w: 3,
          h: margin,
          x: detailsSection + Inches(2.6),
          y: contentSection - Inches(0.25),
          color: "d22735",
          fontFace: "Century Gothic",
          bold: true,
          fontSize: 12,
        });

        const imageURL = image ? image.url : mockup;

        slide.addImage({
          data: imageURL,
          x: Inches(0.8),
          y: ((Inches(19.05) - Inches(1.93)) / 4) + Inches(0.275),
          w: Inches(20.09),
          h: Inches(11.9),
        });

        const colWidth = Inches(5.9);
        const lineHeight = Inches(0.4);
        const textHeight = Inches(0.55);
        const detailHeight = lineHeight + textHeight;

        slide.addText("SITE CODE:", {
          w: colWidth,
          h: textHeight,
          x: detailsSection,
          y: contentSection + textHeight,
          align: "left",
          color: "76899E",
          fontFace: "Aptos",
          fontSize: 8,
        });
        slide.addText(site.site_code, {
          w: colWidth,
          h: textHeight,
          x: detailsSection,
          y: contentSection + detailHeight,
          align: "left",
          color: "1E2C3C",
          bold: true,
          fontFace: "Century Gothic",
          fontSize: 10,
        });
        slide.addText("SIZE (H x W):", {
          w: colWidth,
          h: textHeight,
          x: detailsSection + colWidth,
          y: contentSection + textHeight,
          align: "left",
          color: "76899E",
          fontFace: "Aptos",
          fontSize: 8,
        });
        slide.addText(site.size, {
          w: colWidth,
          h: textHeight,
          x: detailsSection + colWidth,
          y: contentSection + detailHeight,
          align: "left",
          color: "1E2C3C",
          bold: true,
          fontFace: "Century Gothic",
          fontSize: 10,
        });

        slide.addText("FACING:", {
          w: colWidth,
          h: textHeight,
          x: detailsSection,
          y: contentSection + textHeight + detailHeight,
          align: "left",
          color: "76899E",
          fontFace: "Aptos",
          fontSize: 8,
        });
        slide.addText(capitalize(site.board_facing), {
          w: colWidth * 2,
          h: textHeight,
          x: detailsSection,
          y: contentSection + textHeight + detailHeight + lineHeight,
          align: "left",
          color: "1E2C3C",
          bold: true,
          fontFace: "Century Gothic",
          fontSize: 10,
        });

        slide.addText("BOUND:", {
          w: colWidth,
          h: textHeight,
          x: detailsSection,
          y: contentSection + textHeight + detailHeight * 2,
          align: "left",
          color: "76899E",
          fontFace: "Aptos",
          fontSize: 8,
        });
        slide.addText(capitalize(site.bound ?? "") || "N/A", {
          w: colWidth * 2,
          h: textHeight,
          x: detailsSection,
          y: contentSection + textHeight + detailHeight * 2 + lineHeight,
          align: "left",
          color: "1E2C3C",
          bold: true,
          fontFace: "Century Gothic",
          fontSize: 10,
        });
        slide.addText("TRAFFIC COUNT:", {
          w: colWidth,
          h: textHeight,
          x: detailsSection,
          y: contentSection + textHeight + detailHeight * 3,
          align: "left",
          color: "76899E",
          fontFace: "Aptos",
          fontSize: 8,
        });

        slide.addText(Intl.NumberFormat("en-PH", {
          style: "decimal"
        }).format(site.traffic_count ?? 0), {
          w: colWidth * 2,
          h: textHeight,
          x: detailsSection,
          y: contentSection + textHeight + detailHeight * 3 + lineHeight,
          align: "left",
          color: "1E2C3C",
          bold: true,
          fontFace: "Century Gothic",
          fontSize: 10,
        });
        slide.addText("POPULATION:", {
          w: colWidth,
          h: textHeight,
          x: detailsSection + colWidth,
          y: contentSection + textHeight + detailHeight * 3,
          align: "left",
          color: "76899E",
          fontFace: "Aptos",
          fontSize: 8,
        });
        slide.addText(Intl.NumberFormat("en-PH", {
          style: "decimal"
        }).format(site.vicinity_population ?? 0), {
          w: colWidth * 2,
          h: textHeight,
          x: detailsSection + colWidth,
          y: contentSection + textHeight + detailHeight * 3 + lineHeight,
          align: "left",
          color: "1E2C3C",
          bold: true,
          fontFace: "Century Gothic",
          fontSize: 10,
        });
        slide.addText("ADDRESS:", {
          w: colWidth * 2,
          h: textHeight,
          x: detailsSection,
          y: contentSection + textHeight + detailHeight * 4,
          align: "left",
          color: "76899E",
          fontFace: "Aptos",
          fontSize: 8,
        });
        const addressHeight =
          site.address.length > 140
            ? textHeight * 2 + lineHeight
            : site.address.length > 74
              ? textHeight + lineHeight
              : textHeight;

        slide.addText(capitalize(site.address), {
          w: colWidth * 2,
          h: addressHeight,
          x: detailsSection,
          y: contentSection + textHeight + detailHeight * 4 + lineHeight,
          align: "left",
          valign: "top",
          color: "1E2C3C",
          bold: true,
          fontFace: "Century Gothic",
          fontSize: 9,
        });

        const afterAddressPosition =
          contentSection + detailHeight * 4 + lineHeight + addressHeight;

        if (landmarks) {
          const landmarkArray = landmarks.map(
            (landmark) => landmark.display_name
          );
          slide.addText("LANDMARKS:", {
            w: colWidth,
            h: textHeight,
            x: detailsSection,
            y: afterAddressPosition + lineHeight + Inches(0.05),
            align: "left",
            color: "76899E",
            fontFace: "Aptos",
            fontSize: 8,
          });
          if (landmarkArray.length > 0) {
            const landmarkHeight =
              landmarkArray.join(" • ").length > 65
                ? textHeight + lineHeight
                : lineHeight;
            slide.addText(landmarkArray.join(" | "), {
              w: colWidth * 2,
              h: landmarkHeight,
              x: detailsSection,
              y: afterAddressPosition + Inches(0.1) + lineHeight * 2,
              align: "left",
              color: "1E2C3C",
              fontFace: "Century Gothic",
              fontSize: 9,
            });
          }
        }
        const landmarksLength = landmarks
          ? landmarks.map((lm) => lm.display_name).join(" | ").length
          : 0;
        const ratesPosition =
          afterAddressPosition +
          detailHeight +
          (landmarksLength != 0
            ? landmarksLength > 65
              ? textHeight + lineHeight
              : lineHeight
            : 0);

        if (options.rate_generator) {
          const rates = options.rate_generator;
          const rateRows = rates.map((rate) => {
            const { discount, type, duration } = rate;
            tempPrice =
              discount === 0
                ? tempPrice
                : applyPriceAdjustment(tempPrice, {
                  amount: discount,
                  type: type as "percent" | "flat",
                });
            return [
              {
                text: `${duration} Months`,
                options: {
                  align: "center" as PptxGenJS.HAlign,
                  fontFace: "Aptos",
                  fontSize: 10,
                  fill: { color: "FFFFFF" },
                  color: "1E2C3C",
                },
              },
              {
                text: `${formatAmount(tempPrice, {
                  currency: options.currency_exchange?.currency ?? "PHP",
                })} + VAT`,
                options: {
                  align: "center" as PptxGenJS.HAlign,
                  fontFace: "Century Gothic",
                  fontSize: 10,
                  fill: { color: "FFFFFF" },
                  color: "1E2C3C",
                },
              },
            ];
          });
          const rows = [
            [
              {
                text: "DURATION",
                options: {
                  align: "center" as PptxGenJS.HAlign,
                  fontFace: "Aptos",
                  bold: true,
                  fontSize: 11,
                  fill: { color: "F2F2F2" },
                  color: "1E2C3C",
                },
              },
              {
                text: "MONTHLY RATE",
                options: {
                  align: "center" as PptxGenJS.HAlign,
                  fontFace: "Aptos",
                  bold: true,
                  fontSize: 11,
                  fill: { color: "F2F2F2" },
                  color: "1E2C3C",
                },
              },
            ],
            ...rateRows,
          ];
          slide.addTable(rows, {
            w: Inches(11.55),
            h: 1.08,
            x: detailsSection,
            y: ratesPosition + Inches(0.2),
            rowH: 0.27,
            border: { color: "F2F2F2", pt: 1 },
          });
        } else {
          slide.addText("MONTHLY RATE: ", {
            w: colWidth,
            h: textHeight,
            x: detailsSection,
            y: ratesPosition + Inches(0.2),
            align: "left",
            bold: true,
            color: "1E2C3C",
            fontFace: "Aptos",
            fontSize: 10,
          });
          slide.addText(
            formatAmount(tempPrice, {
              currency: options.currency_exchange?.currency ?? "PHP",
            }) + " + VAT",
            {
              w: colWidth * 1.5,
              h: textHeight + Inches(0.2),
              x: detailsSection + Inches(3),
              y: ratesPosition,
              align: "left",
              valign: "top",
              color: "1E2C3C",
              bold: true,
              fontFace: "Century Gothic",
              fontSize: 14,
            }
          );
        }
        const hasMonthlyRateDuration = options.rate_generator;
        const mapSize = hasMonthlyRateDuration ? Inches(5.54) : Inches(7.5);

        slide.addImage({
          data: maps.find((map) => map.site_code === site.site_code)?.map,
          x: detailsSection + Inches(0.2),
          y: ratesPosition + detailHeight + (hasMonthlyRateDuration ? 1 : 0),
          w: mapSize,
          h: mapSize,
        });

        if (site.ideal_view) {
          slide.addText("View Google Map", {
            hyperlink: {
              url: site.ideal_view ?? "",
            },
            w: mapSize,
            h: Inches(0.68),
            x: detailsSection + Inches(0.2),
            y:
              ratesPosition +
              detailHeight +
              mapSize -
              Inches(0.8) +
              (hasMonthlyRateDuration ? 1 : Inches(0.1)),
            align: "center",
            color: "25589D",
            fontFace: "Aptos",
            fontSize: 11,
            isTextBox: true,
            fill: { color: "#F2F2F2" },
          });
        }
        setPrintStatus(prev => ([...prev, 0]));
        await new Promise(requestAnimationFrame)
      }

      try {
        const response = await presentation.write({ outputType: "arraybuffer", compression: false })
        downloadPptxFromArrayBuffer(response, "Sales Deck")
        console.log(response, "Success!")
        console.log("End:", new Date().getTime() - start)
      } catch (e) {
        console.log(e)
      } finally {
        setGenerateStatus(false)
        setPrintStatus([])

      }
    } catch (e) {
      catchError(e);
    }
  };

  return { print };
};

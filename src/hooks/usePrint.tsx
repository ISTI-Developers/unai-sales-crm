import { useDeck } from "@/providers/deck.provider"
import { toast } from "./use-toast";
import { catchError } from "@/providers/api";
import PptxGenJS from "pptxgenjs";
import { applyPriceAdjustment, downloadPptxFromArrayBuffer, formatAmount, formatNumber, Inches } from "@/lib/format";
import { capitalize } from "@/lib/utils";
import { format, isBefore } from "date-fns";
import { DeckSite } from "@/interfaces/deck.interface";
import { getSiteLandmarks } from "./useSites";
import mockup from "@/assets/mockup.png";

export const useGeneratePowerpoint = () => {
    const { title, selectedSites, selectedOptions } = useDeck();
    const start = new Date().getTime();
    const margin = 0.3;
    const width = Inches(33.858);
    const height = Inches(20.31);
    const headerHeight = Inches(2.02);
    const detailsSection = Inches(21.48);
    const colWidth = (width - detailsSection);
    const halfColWidth = (width - detailsSection) / 2;
    const textHeight = 0.2;
    const details2ndColumnSection = detailsSection + halfColWidth;
    const contentSection = headerHeight + 0.2;

    const applyOptions = (site: DeckSite, price: string, baseRate: number) => {
        if (Object.keys(selectedOptions).length !== 0) {
            const adjustments = selectedOptions.price_adjustment;
            const exchange = selectedOptions.currency_exchange;

            if (adjustments) {
                const applyAll = adjustments.some(adj => adj.apply_to === "ALL");
                let adjustment = null;

                if (applyAll) {
                    adjustment = adjustments[0];
                } else {
                    adjustment = adjustments.filter(adj => adj.apply_to !== "ALL").find(conf => {
                        if (conf.apply_to.type === "sites") {
                            return conf.apply_to.list.includes(site.site_code);
                        } else {
                            return Number(price) >= conf.apply_to.range.from && Number(price) <= conf.apply_to.range.to;
                        }
                    })
                }

                if (adjustment) {
                    baseRate = applyPriceAdjustment(baseRate, {
                        amount: adjustment.amount,
                        type: adjustment.type,
                        operation: adjustment.operation,
                    });
                }
            }

            if (exchange && exchange.equivalent) {
                baseRate = baseRate / Number(exchange.equivalent);
            }

        }
        return baseRate;
    }

    const addText = (slide: PptxGenJS.Slide, text: string, options: PptxGenJS.TextPropsOptions) => {
        return slide.addText(text, {
            fontSize: 8,
            fontFace: "Aptos",
            color: "76899E",
            align: 'left',
            h: margin,
            ...options,
        })
    }
    function measureLinesCanvas(text: string, widthIn: number, fontSize: number, fontFamily = 'Century Gothic') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return 1;
        ctx.font = `${fontSize}pt ${fontFamily}`;

        const maxWidthPx = widthIn * 96; // PPT ≈ 96 DPI

        const words = text.split(' ');
        const lines = [];
        let line = '';

        for (const word of words) {
            const testLine = line ? `${line} ${word}` : word;
            const { width } = ctx.measureText(testLine);

            if (width <= maxWidthPx) {
                line = testLine;
            } else {
                lines.push(line);
                line = word;
            }
        }

        if (line) lines.push(line);

        return lines.length;
    }

    const print = async () => {
        if (!selectedSites.length) {
            toast({ title: "Please select atleast one site.", variant: "warning" })
            return;
        }

        try {
            const presentation = new PptxGenJS();

            presentation.defineLayout({
                name: "Widescreen",
                width: width,
                height: height,
            });
            presentation.layout = "Widescreen";

            for (const site of selectedSites) {
                const slide = presentation.addSlide();
                //SLIDE CONFIGURATIONS
                slide.background = { path: "/finalbg.png" }

                const landmarks = await getSiteLandmarks({ latitude: site.latitude, longitude: site.longitude })
                const { price } = site;
                let baseRate = Number(price);
                const area = `Billboard Site in ${capitalize(site.city)}`;
                const availability = site.availability
                    ? isBefore(new Date(site.availability), new Date()) ? "OPEN" : format(new Date(site.availability), "MMM d, yyyy")
                    : "OPEN";

                baseRate = applyOptions(site, price, baseRate);
                const IMAGE_WIDTH = Inches(20.09);
                const IMAGE_HEIGHT = Inches(10.6194);

                slide.addImage({
                    data: site.url ?? mockup,
                    x: Inches(0.8),
                    y: ((height - Inches(1.93)) / 4) + Inches(1),
                    w: IMAGE_WIDTH,
                    h: IMAGE_HEIGHT,
                    sizing: {
                        type: "crop",
                        w: IMAGE_WIDTH,
                        h: IMAGE_HEIGHT,
                    }
                });

                addText(slide, area, {
                    w: width - 0.2,
                    h: headerHeight,
                    x: 0,
                    y: 0,
                    fontSize: 18,
                    bold: true,
                    align: "right",
                    color: "FFFFFF",
                });

                addText(slide, "AVAILABILITY:", {
                    w: Inches(2.34),
                    h: margin,
                    x: detailsSection,
                    y: contentSection,
                });

                addText(slide, availability, {
                    w: Inches(4.23),
                    x: detailsSection + Inches(2.34) - 0.15,
                    y: contentSection,
                    color: "d22735",
                    fontFace: "Century Gothic",
                    bold: true,
                    fontSize: 12,
                });
                addText(slide, "ROFR:", {
                    w: Inches(2.34),
                    x: details2ndColumnSection,
                    y: contentSection,
                });

                addText(slide, 'TBA', {
                    w: Inches(4.23),
                    x: details2ndColumnSection + Inches(1.39) - 0.15,
                    y: contentSection,
                    color: "1E2C3C",
                    bold: true,
                    fontFace: "Century Gothic",
                    fontSize: 10,
                });
                addText(slide, "SITE CODE:", {
                    w: halfColWidth,
                    h: textHeight,
                    x: detailsSection,
                    y: contentSection + textHeight,
                    align: "left",
                    color: "76899E",
                    fontFace: "Aptos",
                    fontSize: 8,
                });
                addText(slide, site.site_code, {
                    w: halfColWidth,
                    h: textHeight,
                    x: detailsSection,
                    y: contentSection + (textHeight * 1.75),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontFace: "Century Gothic",
                    fontSize: 10,
                });
                addText(slide, "SIZE (H x W):", {
                    w: halfColWidth,
                    h: textHeight,
                    x: details2ndColumnSection,
                    y: contentSection + textHeight,
                    align: "left",
                    color: "76899E",
                    fontFace: "Aptos",
                    fontSize: 8,
                });
                addText(slide, site.size, {
                    w: halfColWidth,
                    h: textHeight,
                    x: details2ndColumnSection,
                    y: contentSection + (textHeight * 1.75),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontFace: "Century Gothic",
                    fontSize: 10,
                });
                addText(slide, "ADDRESS:", {
                    w: colWidth,
                    h: textHeight,
                    x: detailsSection,
                    y: contentSection + (textHeight * 2.75),
                    align: "left",
                    color: "76899E",
                    fontFace: "Aptos",
                    fontSize: 8,
                });

                const addressLines = measureLinesCanvas(site.address, colWidth - 0.3, 8);
                const addressLineHeight = (addressLines * 14 * 1.2) / 72;
                const addressPosition = contentSection + (addressLines > 1 ? textHeight * 0.8 : textHeight * 2.2) + addressLineHeight

                addText(slide, site.address, {
                    w: colWidth,
                    h: addressLineHeight,
                    x: detailsSection,
                    y: addressPosition,
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontFace: "Century Gothic",
                    fontSize: 8,
                });

                const facingPosition = addressLines > 1 ? addressPosition * 1.21 : addressPosition * 1.1
                addText(slide, "FACING:", {
                    w: colWidth,
                    h: textHeight,
                    x: detailsSection,
                    y: facingPosition,
                    align: "left",
                    color: "76899E",
                    fontFace: "Aptos",
                    fontSize: 8,
                });

                addText(slide, site.board_facing, {
                    w: colWidth,
                    h: textHeight,
                    x: detailsSection,
                    y: facingPosition + (textHeight * 0.75),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontFace: "Century Gothic",
                    fontSize: 10,
                });
                const boundPosition = addressLines > 1 ? facingPosition * 1.17 : facingPosition * 1.165
                addText(slide, "BOUND:", {
                    w: colWidth,
                    h: textHeight,
                    x: detailsSection,
                    y: boundPosition,
                    align: "left",
                    color: "76899E",
                    fontFace: "Aptos",
                    fontSize: 8,
                });

                addText(slide, site.bound, {
                    w: colWidth,
                    h: textHeight,
                    x: detailsSection,
                    y: boundPosition + (textHeight * 0.75),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontFace: "Century Gothic",
                    fontSize: 10,
                });

                const countYPosition = boundPosition * 1.145
                addText(slide, "TRAFFIC COUNT:", {
                    w: halfColWidth,
                    h: textHeight,
                    x: detailsSection,
                    y: countYPosition,
                    align: "left",
                    color: "76899E",
                    fontFace: "Aptos",
                    fontSize: 8,
                });

                addText(slide, formatNumber(site.traffic_count), {
                    w: halfColWidth,
                    h: textHeight,
                    x: detailsSection,
                    y: countYPosition + (textHeight * 0.75),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontFace: "Century Gothic",
                    fontSize: 10,
                });
                addText(slide, "POPULATION:", {
                    w: halfColWidth,
                    h: textHeight,
                    x: details2ndColumnSection,
                    y: countYPosition,
                    align: "left",
                    color: "76899E",
                    fontFace: "Aptos",
                    fontSize: 8,
                });

                addText(slide, formatNumber(site.vicinity_population), {
                    w: halfColWidth,
                    h: textHeight,
                    x: details2ndColumnSection,
                    y: countYPosition + (textHeight * 0.75),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontFace: "Century Gothic",
                    fontSize: 10,
                });
                let landmarkPosition = countYPosition;
                let landmarkLines = 1
                if (landmarks.length > 0) {
                    const mappedLandmarks = landmarks.map(lm => lm.display_name).slice(0, 5).join(" • ");
                    landmarkLines = measureLinesCanvas(mappedLandmarks, colWidth, 8);
                    const landmarkLineHeight = (landmarkLines * 14 * 1.2) / 72;
                    landmarkPosition = boundPosition + (landmarkLines > 1 ? textHeight * 0.8 : textHeight * 2.1) + landmarkLineHeight
                    addText(slide, "LANDMARKS:", {
                        w: colWidth,
                        h: textHeight,
                        x: detailsSection,
                        y: landmarkPosition,
                        align: "left",
                        color: "76899E",
                        fontFace: "Aptos",
                        fontSize: 8,
                    });

                    addText(slide, mappedLandmarks, {
                        w: colWidth,
                        h: textHeight * landmarkLines,
                        x: detailsSection,
                        y: landmarkPosition + (textHeight * 0.875),
                        align: "left",
                        color: "1E2C3C",
                        fontFace: "Century Gothic",
                        fontSize: 8,
                    });
                }


                landmarkPosition = landmarkLines > 1 ? landmarkPosition * 1.2 : landmarkPosition * 1.13

                if (selectedOptions.rate_generator) {
                    const rates = selectedOptions.rate_generator;
                    const displayOptions: PptxGenJS.TableRow = [];
                    if (selectedOptions.display_options?.material_inclusions) {
                        displayOptions.push({
                            text: "MATERIAL",
                            options: {
                                align: "center" as PptxGenJS.HAlign,
                                fontFace: "Aptos",
                                bold: true,
                                fontSize: 10,
                                fill: { color: "F2F2F2" },
                                color: "1E2C3C",
                            },
                        })
                    }
                    if (selectedOptions.display_options?.installation_inclusions) {
                        displayOptions.push({
                            text: "INSTALLATION",
                            options: {
                                align: "center" as PptxGenJS.HAlign,
                                fontFace: "Aptos",
                                bold: true,
                                fontSize: 10,
                                fill: { color: "F2F2F2" },
                                color: "1E2C3C",
                            },
                        },)
                    }
                    const rateRows = rates.map((rate, index) => {
                        const { discount, type, duration } = rate;
                        // if (discount === 0) return null;
                        const monthlyRate = discount === 0 ? baseRate : applyPriceAdjustment(baseRate, { amount: discount, type: type });
                        const displayRates: PptxGenJS.TableRow = [];
                        if (selectedOptions.display_options?.material_inclusions && Array.isArray(selectedOptions.display_options.material_inclusions)) {
                            displayRates.push({
                                text: `${selectedOptions.display_options.material_inclusions[index].count}x`,
                                options: {
                                    align: "center" as PptxGenJS.HAlign,
                                    fontFace: "Aptos",
                                    fontSize: 10,
                                    fill: { color: "FFFFFF" },
                                    color: "1E2C3C",
                                },
                            })
                        }
                        if (selectedOptions.display_options?.installation_inclusions && Array.isArray(selectedOptions.display_options.installation_inclusions)) {
                            displayRates.push({
                                text: `${selectedOptions.display_options.installation_inclusions[index].count}x`,
                                options: {
                                    align: "center" as PptxGenJS.HAlign,
                                    fontFace: "Aptos",
                                    fontSize: 10,
                                    fill: { color: "FFFFFF" },
                                    color: "1E2C3C",
                                },
                            })
                        }
                        return [
                            {
                                text: `${duration}`,
                                options: {
                                    align: "center" as PptxGenJS.HAlign,
                                    fontFace: "Aptos",
                                    fontSize: 10,
                                    fill: { color: "FFFFFF" },
                                    color: "1E2C3C",
                                },
                            },
                            {
                                text: `${formatAmount(monthlyRate, {
                                    currency: selectedOptions.currency_exchange?.currency ?? "PHP",
                                })} + VAT`,
                                options: {
                                    align: "center" as PptxGenJS.HAlign,
                                    fontFace: "Century Gothic",
                                    fontSize: 9,
                                    fill: { color: "FFFFFF" },
                                    color: "1E2C3C",
                                },
                            },
                            ...displayRates
                        ];

                    })
                    const rows: PptxGenJS.TableRow[] = [
                        [
                            {
                                text: "MONTHS",
                                options: {
                                    align: "center" as PptxGenJS.HAlign,
                                    fontFace: "Aptos",
                                    bold: true,
                                    fontSize: 10,
                                    fill: { color: "F2F2F2" },
                                    color: "1E2C3C",
                                },
                            },
                            {
                                text: "RATE/MONTH",
                                options: {
                                    align: "center" as PptxGenJS.HAlign,
                                    fontFace: "Aptos",
                                    bold: true,
                                    fontSize: 10,
                                    fill: { color: "F2F2F2" },
                                    color: "1E2C3C",
                                },
                            },
                            ...displayOptions,
                        ],
                        ...rateRows /*.filter(row => row !== null)*/,
                    ];
                    slide.addTable(rows, {
                        w: Inches(11.55),
                        h: 1.08,
                        colW: [Inches(2), Inches(3.7), Inches(3), Inches(3)],
                        x: detailsSection + Inches(0.2),
                        y: landmarkPosition + Inches(0.2),
                        rowH: 0.27,
                        border: { color: "F2F2F2", pt: 1 },
                    });
                    landmarkPosition = landmarkPosition + 1.1
                } else {
                    addText(slide, "MONTHLY RATE:", {
                        w: Inches(3),
                        h: textHeight,
                        x: detailsSection,
                        y: landmarkPosition,
                        align: "left",
                        color: "1E2C3C",
                        bold: true,
                        fontFace: "Aptos",
                        fontSize: 9,
                    });
                    addText(slide, `${formatAmount(baseRate)} + VAT`, {
                        w: colWidth - Inches(2.89),
                        h: textHeight,
                        x: detailsSection + Inches(2.65),
                        y: landmarkPosition,
                        align: "left",
                        color: "1E2C3C",
                        bold: true,
                        fontFace: "Century Gothic",
                        fontSize: 12,
                    });
                    if (selectedOptions.display_options?.material_inclusions || selectedOptions.display_options?.installation_inclusions) {
                        let text = `FREE `;
                        if (selectedOptions.display_options.installation_inclusions) {
                            text += `${selectedOptions.display_options.installation_inclusions}x Installation and `
                        }
                        if (selectedOptions.display_options.material_inclusions) {
                            text += `${selectedOptions.display_options.material_inclusions}x Material`
                        }
                        addText(slide, text, {
                            w: colWidth,
                            h: textHeight,
                            x: detailsSection,
                            y: landmarkPosition + textHeight,
                            align: "left",
                            color: "1E2C3C",
                            bold: false,
                            fontFace: "Century Gothic",
                            fontSize: 9,
                        })
                    }
                }
                const mapSize = landmarkLines > 1 || addressLines > 1 ? Inches(7.25) : Inches(7.5)
                slide.addImage({
                    data: site.map,
                    x: detailsSection + Inches(0.2),
                    y: landmarkPosition + (selectedOptions.rate_generator ? textHeight * 1.2 : textHeight * 2),
                    w: mapSize,
                    h: mapSize,
                })
                if (site.ideal_view) {
                    slide.addText("View Google Map", {
                        hyperlink: {
                            url: site.ideal_view ?? "",
                        },
                        w: mapSize,
                        h: Inches(0.68),
                        x: detailsSection + Inches(0.2),
                        y: landmarkPosition + (selectedOptions.rate_generator ? textHeight * 1.2 : textHeight * 2) + mapSize - Inches(0.68),
                        align: "center",
                        color: "25589D",
                        fontFace: "Aptos",
                        fontSize: 11,
                        isTextBox: true,
                        fill: { color: "#F2F2F2" },
                    });
                }
            }

            try {
                const response = await presentation.write({ outputType: "arraybuffer", compression: false })
                downloadPptxFromArrayBuffer(response, title)
                console.log("End:", new Date().getTime() - start)
            } catch (e) {
                console.log(e)
            }
        } catch (e) {
            catchError(e)
        }
    }

    return { applyOptions, print };
}
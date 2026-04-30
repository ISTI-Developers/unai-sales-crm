import { useDeck } from "@/providers/deck.provider"
import { toast } from "./use-toast";
import { catchError } from "@/providers/api";
import PptxGenJS from "pptxgenjs";
import { applyPriceAdjustment, downloadPptxFromArrayBuffer, formatAmount, formatNumber, Inches } from "@/lib/format";
import { capitalize } from "@/lib/utils";
import { format, isBefore, subDays } from "date-fns";
import { DeckSite, displayOptions, regions } from "@/interfaces/deck.interface";
import { getSiteLandmarks } from "./useSites";
import mockup from "@/assets/mockup.png";

export const useGeneratePowerpoint = () => {
    const { title, selectedSites, selectedOptions } = useDeck();
    const start = new Date().getTime();
    const defaultHeight = Inches(0.81);
    const labelHeight = Inches(0.5);
    const width = Inches(36.107);
    const height = Inches(20.311);
    const headerHeight = Inches(2.02);
    const detailsSection = Inches(21.48);
    const details2ndColumnSection = Inches(28.61);
    const contentSection = Inches(2.52);

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
            fontSize: 8.5,
            fontFace: "Arial",
            color: "76899E",
            align: 'left',
            h: defaultHeight,
            ...options,
        })
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
                const rofr = availability === "OPEN" ? "N/A" : format(subDays(new Date(site.availability!), site.is_prime ? 61 : 31), "MMM d, yyy");

                baseRate = applyOptions(site, price, baseRate);

                const productionCost = selectedOptions.display_options?.production_cost ?? displayOptions.base.production_cost;
                const prefix = Number(site.site_code.substring(0, 1)) as keyof typeof regions;
                const rate = productionCost[regions[prefix] as keyof typeof productionCost]

                const dims = site.size
                    .match(/\d+(\.\d+)?/g)
                    ?.map(Number)

                const prodCost = dims?.reduce((acc, n) => acc * n, rate) ?? 0


                const DPI = 96;
                const DEFAULT_WIDTH = 832;
                const DEFAULT_IMAGE_WIDTH = Inches(DEFAULT_WIDTH / DPI * 2.54);
                // const DEFAULT_IMAGE_HEIGHT = Inches(10.6194);

                const HEIGHT = site.height ? site.height * (DEFAULT_WIDTH / (site.width ?? DEFAULT_WIDTH)) : 440;
                const IMAGE_WIDTH = DEFAULT_IMAGE_WIDTH;
                const IMAGE_HEIGHT = Inches(HEIGHT / DPI * 2.54);


                slide.addImage({
                    data: site.url ?? mockup,
                    x: Inches(0.8),
                    // y: ((height - Inches(1.93)) / 4) + Inches(1),
                    y: headerHeight + ((height - headerHeight) / 2) - ((IMAGE_HEIGHT * 0.91) / 2),
                    w: IMAGE_WIDTH * 0.91,
                    h: IMAGE_HEIGHT * 0.91,
                    // sizing: {
                    //     type: "contain",
                    // }
                });

                addText(slide, area, {
                    w: Inches(35.78),
                    h: headerHeight,
                    x: 0,
                    y: 0,
                    fontSize: 18,
                    bold: true,
                    align: "right",
                    color: "FFFFFF",
                });

                addText(slide, "AVAILABILITY:", {
                    w: Inches(2.97),
                    h: labelHeight,
                    x: detailsSection,
                    y: contentSection,
                });

                addText(slide, availability, {
                    w: Inches(4.57),
                    x: Inches(23.93),
                    y: Inches(2.31),
                    color: "d22735",
                    bold: true,
                    fontSize: 12.8,
                });
                addText(slide, "ROFR:", {
                    w: Inches(2.5),
                    x: details2ndColumnSection,
                    y: Inches(2.35),
                });

                addText(slide, rofr, {
                    w: Inches(4.89),
                    x: Inches(30.89),
                    y: Inches(2.3),
                    color: "d22735",
                    bold: true,
                    fontSize: 12.8,
                });
                addText(slide, "SITE CODE:", {
                    w: Inches(3.14),
                    h: labelHeight,
                    x: Inches(21.45),
                    y: Inches(3.07),
                    align: "left",
                    color: "76899E",
                });
                addText(slide, site.site_code, {
                    w: Inches(4.58),
                    h: labelHeight,
                    x: Inches(23.91),
                    y: Inches(3.05),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontSize: 10.7,
                });
                addText(slide, "SIZE (H x W):", {
                    w: Inches(6.58),
                    h: labelHeight,
                    x: details2ndColumnSection,
                    y: Inches(3.05),
                    align: "left",
                    color: "76899E",
                    fontSize: 8.5,
                });
                addText(slide, site.size, {
                    w: Inches(4.37),
                    h: labelHeight,
                    x: Inches(30.88),
                    y: Inches(3.05),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontSize: 10.7,
                });
                addText(slide, "ADDRESS:", {
                    w: Inches(2.25),
                    h: labelHeight,
                    x: Inches(21.45),
                    y: Inches(3.65),
                    align: "left",
                    color: "76899E",
                    fontSize: 8.5,
                });


                addText(slide, site.address, {
                    w: Inches(14.01),
                    h: Inches(0.94),
                    x: Inches(21.45),
                    y: Inches(3.93),
                    align: "left",
                    valign: "top",
                    color: "1E2C3C",
                    bold: true,
                    fontSize: 8.5,
                });
                addText(slide, "FACING:", {
                    w: Inches(13.2),
                    h: labelHeight,
                    x: Inches(21.44),
                    y: Inches(4.92),
                    align: "left",
                    color: "76899E",
                    fontSize: 8.5,
                });

                addText(slide, site.board_facing?.replace("FACING", "").trimStart(), {
                    w: Inches(13.2),
                    h: labelHeight,
                    x: Inches(21.44),
                    y: Inches(5.22),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontSize: 9.6,
                });
                addText(slide, "BOUND:", {
                    w: Inches(13.2),
                    h: labelHeight,
                    x: Inches(21.44),
                    y: Inches(5.81),
                    align: "left",
                    color: "76899E",
                    fontSize: 8.5,
                });

                addText(slide, site.bound?.toUpperCase() ?? "N/A", {
                    w: Inches(13.2),
                    h: labelHeight,
                    x: Inches(21.44),
                    y: Inches(6.11),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontSize: 9.6,
                });

                addText(slide, "TRAFFIC COUNT:", {
                    w: Inches(6.6),
                    h: labelHeight,
                    x: Inches(21.45),
                    y: Inches(6.75),
                    align: "left",
                    color: "76899E",
                    fontSize: 8.5,
                });

                addText(slide, formatNumber(site.traffic_count), {
                    w: Inches(6.6),
                    h: labelHeight,
                    x: Inches(21.47),
                    y: Inches(7.06),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontSize: 10.7,
                });
                addText(slide, "POPULATION:", {
                    w: Inches(6.6),
                    h: labelHeight,
                    x: details2ndColumnSection,
                    y: Inches(6.75),
                    align: "left",
                    color: "76899E",
                    fontSize: 8.5,
                });

                addText(slide, formatNumber(site.vicinity_population), {
                    w: Inches(6.6),
                    h: labelHeight,
                    x: details2ndColumnSection,
                    y: Inches(7.06),
                    align: "left",
                    color: "1E2C3C",
                    bold: true,
                    fontSize: 10.7,
                });

                const mappedLandmarks = landmarks.map(lm => lm.display_name).slice(0, 5).join(" • ").toUpperCase();

                addText(slide, "LANDMARKS:", {
                    w: Inches(13.2),
                    h: labelHeight,
                    x: detailsSection,
                    y: Inches(7.75),
                    align: "left",
                    color: "76899E",
                    fontSize: 8.5,
                });

                addText(slide, mappedLandmarks, {
                    w: Inches(14),
                    h: Inches(1.15),
                    x: detailsSection,
                    y: Inches(7.99),
                    align: "left",
                    valign: "top",
                    color: "1E2C3C",
                    fontSize: 8,
                });

                if (selectedOptions.rate_generator) {
                    const rates = selectedOptions.rate_generator;
                    const displayOptions: PptxGenJS.TableRow = [];
                    if (selectedOptions.display_options?.material_inclusions) {
                        displayOptions.push({
                            text: "MATERIAL",
                            options: {
                                align: "center" as PptxGenJS.HAlign,
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
                        if (selectedOptions.display_options?.material_inclusions) {
                            const material = selectedOptions.display_options?.material_inclusions;
                            const materialValue = material[index].type === "FREE" ? `${material[index].count}x free` : formatAmount(prodCost);
                            displayRates.push({
                                text: materialValue,
                                options: {
                                    align: "center" as PptxGenJS.HAlign,
                                    fontSize: 10,
                                    fill: { color: "FFFFFF" },
                                    color: "1E2C3C",
                                },
                            })
                        }
                        if (selectedOptions.display_options?.installation_inclusions) {
                            const installation = selectedOptions.display_options?.installation_inclusions;
                            displayRates.push({
                                text: installation[index].count === 0 ? '---' : `${installation[index].count}x free`,
                                options: {
                                    align: "center" as PptxGenJS.HAlign,
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
                        w: Inches(13.92),
                        h: Inches(2.74),
                        colW: [Inches(3), Inches(3.92), Inches(3.5), Inches(3.5)],
                        x: Inches(21.7),
                        y: Inches(9.46),
                        rowH: 0.27,
                        border: { color: "F2F2F2", pt: 1 },
                    });
                } else {
                    addText(slide, "MONTHLY RATE:", {
                        w: Inches(4.36),
                        h: labelHeight,
                        x: detailsSection,
                        y: Inches(9.36),
                        align: "left",
                        color: "000000",
                        bold: true,
                        fontSize: 9.6,
                    });
                    const amount = selectedOptions.currency_exchange?.currency !== "PHP" ? formatAmount(baseRate) : formatAmount(baseRate) + " + VAT";
                    addText(slide, amount, {
                        w: Inches(6.63),
                        h: labelHeight,
                        x: detailsSection,
                        y: Inches(9.82),
                        align: "left",
                        color: "d22735",
                        bold: true,
                        fontSize: 14.9,
                    });
                    let text = ``;

                    const material = selectedOptions.display_options?.material_inclusions;
                    const installation = selectedOptions.display_options?.installation_inclusions;

                    if ((material && material[0].type === "FREE" && material[0].count !== 0) || (installation && installation[0].count !== 0)) {
                        text = `w/ free `
                    }
                    if (material && material[0].type === "FREE" && material[0].count !== 0) {
                        text += `${material[0].count}x material`
                    }
                    else {
                        if (selectedOptions.display_options) {
                            addText(slide, "PRODUCTION COST:", {
                                w: Inches(4.36),
                                h: labelHeight,
                                x: details2ndColumnSection,
                                y: Inches(9.36),
                                align: "left",
                                color: "000000",
                                bold: true,
                                fontSize: 9.6,
                            });
                            addText(slide, formatAmount(prodCost), {
                                w: Inches(6.63),
                                h: labelHeight,
                                x: details2ndColumnSection,
                                y: Inches(9.82),
                                align: "left",
                                color: "d22735",
                                bold: true,
                                fontSize: 14.9,
                            });
                        }
                    }
                    if (material && installation && material[0].type === "FREE" && material[0].count !== 0 && installation[0].count !== 0) {
                        text += ` & `
                    }
                    if (installation && installation[0].count !== 0) {
                        text += `${installation[0].count}x installation`
                    }
                    addText(slide, text, {
                        w: Inches(14.23),
                        h: Inches(0.62),
                        x: detailsSection,
                        y: Inches(10.23),
                        align: "left",
                        color: "76899E",
                        bold: false,
                        fontSize: 8.5,
                    })
                }
                slide.addImage({
                    data: site.map,
                    x: Inches(21.68),
                    y: selectedOptions.rate_generator ? Inches(12.84) : Inches(11.02),
                    w: selectedOptions.rate_generator ? Inches(6.97) : Inches(8),
                    h: selectedOptions.rate_generator ? Inches(6.97) : Inches(8),
                })
                if (site.ideal_view) {
                    slide.addText("View Google Map", {
                        hyperlink: {
                            url: site.ideal_view ?? "",
                        },
                        w: selectedOptions.rate_generator ? Inches(6.97) : Inches(8),
                        h: Inches(0.73),
                        x: Inches(21.68),
                        y: selectedOptions.rate_generator ? Inches(19.18) : Inches(18.29),
                        align: "center",
                        color: "25589D",
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
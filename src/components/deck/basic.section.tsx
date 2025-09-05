import Field from "../field";
import { capitalize } from "@/lib/utils";
import { DeckSite, useDeck } from "@/providers/deck.provider";
import { Container } from "./container.deck";
import { useMemo } from "react";
import { applyPriceAdjustment, formatAmount } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const BasicSection = ({ data }: { data: DeckSite | null }) => {
  const fields = [
    "type",
    "site_owner",
    "size",
    "traffic_count",
    "board_facing",
    "bound",
    "vicinity_population",
    "remarks",
    "availability",
    "price",
  ];
  return (
    <Container>
      {data ? (
        <section className="grid grid-cols-2 gap-2 text-xs">
          {fields.map((field) => (
            <Field
              key={field}
              id={field}
              label={field}
              labelClasses="text-xs"
              value={
                field === "price" ? (
                  <PriceField site={data} />
                ) : field === "availability" ? (
                  <AvailabilityField site={data} />
                ) : ['vicinity_population', 'traffic_count'].includes(field) ?
                  Intl.NumberFormat("en-PH", {
                    style: "decimal"
                  }).format(Number(data[field] ?? 0))
                  : (
                    capitalize((data[field] as string) ?? "---")
                  )
              }
            />
          ))}
        </section>
      ) : (
        <>Loading...</>
      )}
    </Container>
  );
};



const PriceField = ({ site }: { site: DeckSite }) => {
  const { options, toAll } = useDeck();

  const updatedPrice = useMemo(() => {
    if (Object.keys(options).length === 0) return Number(site.price);

    let tempPrice = Number(site.price);

    const adjustments = options.price_adjustment;
    const exchange = options.currency_exchange;

    if (adjustments) {
      const globalAdjustment =
        toAll && adjustments.length === 1 ? adjustments[0] : null;
      const siteAdjustment = !toAll
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

    return tempPrice;
  }, [options, site.price, toAll, site.site_code]);

  const ratesPerMonth = useMemo(() => {
    if (!options.rate_generator) return null;
    let tempPrice = updatedPrice;
    return options.rate_generator.map((config) => {
      const { discount, duration, type } = config;
      tempPrice =
        discount === 0
          ? updatedPrice
          : applyPriceAdjustment(tempPrice, {
            amount: discount,
            type: type as "percent" | "flat",
          });
      return {
        duration: duration,
        price: tempPrice,
      };
    });
    return null;
  }, [options.rate_generator, updatedPrice]);

  return (
    <div className="flex">
      {ratesPerMonth ? (
        <Table className="text-[0.65rem] w-full max-w-[200px] border">
          <TableHeader>
            <TableRow>
              <TableHead className="h-6 text-center font-bold">
                Duration
              </TableHead>
              <TableHead className="h-6 text-center font-bold">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ratesPerMonth.map((price, index) => {
              return (
                <TableRow key={index} className="text-center">
                  <TableCell>{price.duration} months</TableCell>
                  <TableCell>
                    {formatAmount(price.price, {
                      currency: options.currency_exchange?.currency ?? "PHP",
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        formatAmount(updatedPrice, {
          currency: options.currency_exchange?.currency ?? "PHP",
        })
      )}
    </div>
  );
};
const AvailabilityField = ({ site }: { site: DeckSite }) => {
  return <div>{site.availability}</div>;
};

export default BasicSection;

import { SiteDetailswithMapping } from "@/interfaces/sites.interface";
import { Container } from "../container";
import Field from "../field";
import { formatAmount } from "@/lib/format";

const BasicSection = ({ data }: { data: SiteDetailswithMapping | null }) => {
  const fields = [
    "type",
    "site_owner",
    "size",
    "traffic_count",
    "board_facing",
    "price",
    "bound",
    "vicinity_population",
    "remarks",
  ];
  return (
    <Container title="Basic Information">
      {data ? (
        <section className="grid grid-rows-5 grid-flow-col gap-2 text-xs">
          {fields.map((field) => {
            const value =
              field === "price"
                ? formatAmount(data[field as string] as string)
                : (data[field] as string) ?? "---";
            return (
              <Field
                key={field}
                id={field}
                label={field}
                labelClasses="text-xs"
                value={value}
              />
            );
          })}
        </section>
      ) : (
        <>Loading...</>
      )}
    </Container>
  );
};

export default BasicSection;

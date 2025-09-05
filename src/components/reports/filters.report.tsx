import { capitalize } from "@/lib/utils";
import { useReports } from "@/providers/reports.provider";
import { Equal, EqualNot } from "lucide-react";
import { Badge } from "../ui/badge";

const SelectedFilters = () => {
  const { filters } = useReports();
  return (
    filters.length > 0 && (
      <div className="text-sm flex gap-1 items-center">
        <h1>Filters: </h1>
        <div className="flex gap-2">
          {filters.map(({ id, column, condition, query }) => {
            return (
              (column.length > 0 || condition.length > 0) && (
                <div
                  key={id}
                  className="flex text-xs gap-1.5 items-center bg-slate-200 p-1.5 px-2 rounded-lg"
                >
                  <p className="font-semibold">{capitalize(column, "_")}</p>
                  {!column.includes("Wk") ? (
                    condition.includes("not") ? (
                      <EqualNot size={12} />
                    ) : (
                      <Equal size={12} />
                    )
                  ) : (
                    <>
                      {condition === "is empty" ? (
                        <OptionBadge option="No Activities" />
                      ) : condition === "is not empty" ? (
                        <OptionBadge option="Has Activtities" />
                      ) : (
                        <OptionBadge option="All Activities" />
                      )}
                    </>
                  )}
                  {query.length > 0 && (
                    <div className="flex gap-1">
                      {typeof query === "string" ? (
                        <OptionBadge option={query} />
                      ) : (
                        query.map((option) => {
                          return (
                            <OptionBadge
                              key={option.id}
                              option={option.label}
                            />
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )
            );
          })}
        </div>
      </div>
    )
  );
};

const OptionBadge = ({ option }: { option: string }) => {
  return <Badge className="px-1.5">{capitalize(option)}</Badge>;
};

export default SelectedFilters;

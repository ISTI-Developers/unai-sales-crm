import React, { useMemo } from "react";
import { Input } from "../ui/input";
import { useClient } from "@/providers/client.provider";
import { List } from "@/interfaces";
import { TableCell } from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const Cell = ({
  index,
  value,
  header,
  onChange,
}: {
  index: number;
  value: string | number;
  header: string;
  onChange: (value: string, header: string, index: number) => void;
}) => {
  const { clientOptions } = useClient();

  const withOptions = ["industry", "status", "source", "type"];

  const options: List[] | [] = useMemo(() => {
    if (!clientOptions) return [];

    const category = clientOptions.filter((option) =>
      option.some((opt) => opt.category === header)
    );

    if (Array.isArray(category)) {
      if (category.length > 0) {
        return category[0]
          .map(({ misc_id, name }) => {
            return {
              id: misc_id,
              label: name,
              value: name,
            };
          })
          .sort((a, b) => a.label.localeCompare(b.label));
      }
    }
  }, [clientOptions, header]);

  return (
    <TableCell className="whitespace-nowrap">
      {withOptions.includes(header) ? (
        <Select
          value={String(value)}
          onValueChange={(value) => {
            onChange(value, header, index);
          }}
        >
          <SelectTrigger className="min-w-[180px] capitalize">
            <SelectValue placeholder={`Select ${header}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => {
              return (
                <SelectItem
                  key={option.id}
                  value={option.value}
                  className="capitalize"
                >
                  {option.value}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type="text"
          value={value}
          className="w-max"
          onChange={(e) => {
            onChange(e.target.value, header, index);
          }}
        />
      )}
    </TableCell>
  );
};

export default Cell;

import { Input } from "../ui/input";
import { TableCell } from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useClientOptionList } from "@/hooks/useClientOptions";

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

  const withOptions = ["industry", "status", "source", "type"];

  const { options } = useClientOptionList(header);

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

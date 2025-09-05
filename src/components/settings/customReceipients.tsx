import { useCompanies } from "@/hooks/useCompanies";
import { MultiComboBox } from "../multicombobox";
import { useMemo } from "react";
import { List } from "@/interfaces";

const CustomReceipients = ({
  value,
  setValue,
}: {
  value: string[];
  setValue: (receipients: string) => void;
}) => {
  const { data, isPending } = useCompanies();

  const options = useMemo<List[]>(() => {
    if (isPending || !data) return [];

    return data.map((item) => {
      return {
        id: String(item.ID),
        label: item.name,
        value: item.name,
      };
    });
  }, [data, isPending]);

  const valueList = useMemo(() => {
    return options.filter((option) => value.some((val) => val === option.id));
  }, [options, value]);

  const onChange = (value: string) => {
    setValue(value);
  };

  return (
    <div>
      <MultiComboBox
        list={options}
        value={valueList}
        title="receipients"
        setValue={onChange}
      />
    </div>
  );
};

export default CustomReceipients;

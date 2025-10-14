import { useSitelandmarks } from "@/hooks/useSites";
import { List } from "@/interfaces";
import { useMemo } from "react";
import { MultiComboBox } from "../multicombobox";
import { capitalize } from "@/lib/utils";

const LandmarkFilter = ({
    value,
    setValue,
}: {
    value: List[];
    setValue: (value: List[]) => void;
}) => {
    const { data, isLoading } = useSitelandmarks();

    const list: List[] = useMemo(() => {
        if (isLoading || !data) return [];

        const types = data.flatMap((lm) => lm.types);
        const interestList = [...new Set(types)];

        return interestList.map((item) => ({
            id: item,
            label: capitalize(item, "_"),
            value: item,
        }));
    }, [data, isLoading]);

    const handleSelect = (id: string) => {
        const exists = value.some((v) => v.id === id);
        let updated: List[];

        if (exists) {
            // remove if already selected
            updated = value.filter((v) => v.id !== id);
        } else {
            // add if not selected
            const selected = list.find((item) => item.id === id);
            updated = selected ? [...value, selected] : value;
        }

        setValue(updated);
    };

    return (
        <MultiComboBox
            list={list}
            title="landmarks"
            value={value}
            setValue={handleSelect}
        />
    );
};

export default LandmarkFilter;

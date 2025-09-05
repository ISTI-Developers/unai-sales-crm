import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useDeck } from "@/providers/deck.provider";

const PriceFilter = () => {
  const { setFilters, filters } = useDeck();

  const handleFromChange = (index: number, value: string) => {
    setFilters((prev) => {
      const updated = [...(prev.price || [])];
      updated[index] = {
        ...updated[index],
        from: Number(value),
      };
      return { ...prev, price: updated };
    });
  };

  const handleToChange = (index: number, value: string) => {
    setFilters((prev) => {
      const updated = [...(prev.price || [])];
      updated[index] = {
        ...updated[index],
        to: Number(value),
      };
      return { ...prev, price: updated };
    });
  };

  const handleRemove = (index: number) => {
    setFilters((prev) => {
      const updated = [...(prev.price || [])];
      updated.splice(index, 1);
      return { ...prev, price: updated };
    });
  };

  const handleAdd = () => {
    setFilters((prev) => ({
      ...prev,
      price: [...(prev.price || []), { from: 0, to: 0 }],
    }));
  };

  return (
    <div className="flex flex-col gap-2">
      {filters.price &&
        filters.price.map((config, index) => (
          <div key={index} className="flex gap-2 text-xs items-center">
            <Input
              id={`min-${index}`}
              type="number"
              min={0}
              value={config.from}
              onChange={(e) => handleFromChange(index, e.target.value)}
              placeholder="From"
              className="bg-white"
            />
            <Input
              id={`max-${index}`}
              type="number"
              min={0}
              value={config.to}
              onChange={(e) => handleToChange(index, e.target.value)}
              placeholder="To"
              className="bg-white"
            />
            {(filters.price?.length ?? 0) > 1 && (
              <Button
                variant="outline"
                className="h-6 p-1 text-red-300"
                onClick={() => handleRemove(index)}
              >
                <Minus size={16} />
              </Button>
            )}
          </div>
        ))}
      <Button variant="outline" size="sm" onClick={handleAdd}>
        <Plus size={16} className="mr-1" />
        Add new
      </Button>
    </div>
  );
};

export default PriceFilter;

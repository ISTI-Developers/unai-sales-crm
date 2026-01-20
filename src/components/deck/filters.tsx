import { Filter } from "lucide-react";
import { Label } from "../ui/label";
import FilterItem from "./filter.item";
import AreaFilter from "./area.filter";
import LandmarkFilter from "./landmark.filter";
import PriceFilter from "./price.filter";
import AvailabilityFilter from "./filters.availability";
const Filters = () => {
  return (
    <div className="p-4 bg-slate-100 h-[calc(100vh-9.75rem)] rounded-lg overflow-y-auto">
      <div className="flex justify-between items-center">
        <Label className="flex gap-2 items-center border-b-2 border-slate-300 w-full pb-2">
          <Filter size={16} />
          <p className="font-semibold">Filters</p>
        </Label>
      </div>
      <div className="flex flex-col gap-2">
        <FilterItem label="area">
          <AreaFilter />
        </FilterItem>
        <FilterItem label="landmarks">
          <LandmarkFilter />
        </FilterItem>
        <FilterItem label="price">
          <PriceFilter />
        </FilterItem>
        <FilterItem label="availability">
          <AvailabilityFilter />
        </FilterItem>
      </div>
    </div>
  );
};

export default Filters;

import { Checkbox } from "../ui/checkbox";
import { useDeck } from "@/providers/deck.provider";
import { Label } from "../ui/label";

const LandmarkVisibilityOptions = () => {
  const { options, setOptions } = useDeck();

  return (
    <div className="flex items-center gap-2 p-1">
      <Checkbox
      id="show"
        checked={options?.landmark_visibility?.show ?? false}
        onCheckedChange={(checked) =>
          setOptions((prev) => {
            return {
              ...prev,
              landmark_visibility: {
                show: !!checked,
              },
            };
          })
        }
      />
      <Label htmlFor="show">Display landmarks on map</Label>
    </div>
  );
};

export default LandmarkVisibilityOptions;

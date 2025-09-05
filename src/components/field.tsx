import { ReactNode } from "react";
import { Label } from "./ui/label";
import { capitalize, cn } from "@/lib/utils";

const Field = ({
  id,
  label,
  value,
  labelClasses,
}: {
  id: string;
  label: string;
  value: ReactNode;
  labelClasses?: string;
}) => {
  return (
    <div className="grid grid-cols-[30%_70%] gap-4 items-center">
      <Label
        htmlFor={id}
        className={cn("capitalize font-semibold", labelClasses)}
      >
        {capitalize(label, "_")}
      </Label>
      {value}
    </div>
  );
};

export default Field;

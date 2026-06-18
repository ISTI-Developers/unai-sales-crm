import { ReactNode } from "react";
import { Label } from "./ui/label";
import { capitalize, cn } from "@/lib/utils";

const Field = ({
  id,
  label,
  value,
  labelClasses,
  icon,
  vertical
}: {
  id: string;
  label: string;
  value: ReactNode;
  labelClasses?: string;
  icon?: ReactNode;
  vertical?: boolean
}) => {
  return (
    <div className={cn("grid grid-cols-[30%_70%] gap-4 items-center", vertical ? 'grid-cols-1 gap-1' : "")}>
      <Label
        htmlFor={id}
        className={cn("uppercase font-semibold flex items-center gap-1", labelClasses)}
      >
        {icon}
        <span>
          {capitalize(label, "_")}
        </span>
      </Label>
      <div>
        {value}
      </div>
    </div>
  );
};

export default Field;

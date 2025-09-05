import { Label } from "./ui/label";

const FormLabel = ({ id, label }: { id: string; label: string }) => {
  return (
    <Label htmlFor={id} className="capitalize">
      {label.replace(/_/g, " ")}
    </Label>
  );
};

export default FormLabel;

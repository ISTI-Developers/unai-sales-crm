import { Label } from "./ui/label";

const FormLabel = ({ ...props }) => {
  return (
    <Label htmlFor={props.id} className="capitalize">
      {props.label.replace(/_/g, " ")}
    </Label>
  );
};

export default FormLabel;

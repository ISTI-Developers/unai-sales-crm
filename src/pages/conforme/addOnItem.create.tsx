import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputNumber from "@/components/ui/number-input";
import { Switch } from "@/components/ui/switch";
import { Cart, GlobalAddOns } from "@/interfaces/requests.interface";
import { Trash2Icon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface AddOnItemProps {
    item: GlobalAddOns;
    index: number;
    setCart: Dispatch<SetStateAction<Cart>>;
}

function AddOnItem({
    index,
    item,
    setCart,
}: AddOnItemProps) {

    const updateField = (
        field: keyof GlobalAddOns,
        value: string | number | boolean
    ) => {
        setCart((prev) => ({
            ...prev,
            add_ons: prev.add_ons.map((addOn, i) =>
                i === index
                    ? {
                        ...addOn,
                        [field]: value,
                        ...(field === "value" || field === "qty"
                            ? {
                                total:
                                    Number(
                                        field === "value"
                                            ? value
                                            : addOn.value
                                    ) *
                                    Number(
                                        field === "qty"
                                            ? value
                                            : addOn.qty
                                    ),
                            }
                            : {}),
                    }
                    : addOn
            ),
        }));
    };

    const remove = () => {
        setCart((prev) => ({
            ...prev,
            add_ons: prev.add_ons.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto_auto] items-center gap-4 rounded-md">
            <Input
                placeholder="Add-on name"
                value={item.name}
                onChange={(e) => updateField("name", e.target.value)}
            />

            <InputNumber
                placeholder="Value"
                value={item.value}
                onChange={(e) =>
                    updateField(
                        "value",
                        Number(e.target.value) || 0
                    )
                }
            />

            <InputNumber
                placeholder="Quantity"
                isMoney={false}
                value={item.qty}
                onChange={(e) =>
                    updateField(
                        "qty",
                        Number(e.target.value) || 0
                    )
                }
            />

            <InputNumber
                placeholder="Total"
                value={item.total}
                disabled
            />
            <Switch
                checked={item.is_free}
                onCheckedChange={(checked) =>
                    updateField("is_free", !!checked)
                }
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="
                    size-8 text-muted-foreground
                    hover:bg-destructive/10
                    hover:text-destructive
                "
                onClick={remove}
            >
                <Trash2Icon className="size-4" />
            </Button>
        </div >
    );
}

export default AddOnItem;
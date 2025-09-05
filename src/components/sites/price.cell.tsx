import { Site } from "@/interfaces/sites.interface";
import { CellContext } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { PenLine } from "lucide-react";
import { useUpdatePrice } from "@/hooks/useSites";
import { useAuth } from "@/providers/auth.provider";
import { useClientAccess } from "@/hooks/useClients";
import { Input } from "../ui/input";
import { formatAmount } from "@/lib/format";

const PriceCell = ({ row, column }: CellContext<Site, unknown>) => {
    const { mutate } = useUpdatePrice();
    const priceValue: string = row.getValue(column.id);
    const [price, setPrice] = useState<string>(priceValue ?? "");
    const [toggle, onToggle] = useState(false);
    const { user } = useAuth();
    const { access } = useClientAccess(19);

    const onSubmit = () => {
        mutate(
            { site_code: row.original.site_code, priceValue: price },
            {
                onSuccess: () => {
                    setPrice(price);
                    onToggle(false);
                },
            }
        );
    };
    const hasAccess = useMemo(() => {
        if (!user || !access) return false;

        return [1, 21].includes(user.ID as number) || access.edit;
    }, [user, access]);
    return (
        <div className="text-[0.65rem] relative group flex flex-col gap-2">
            {!toggle ? (
                <>
                    <p className="text-start">
                        {formatAmount(priceValue !== price ? priceValue ?? 0 : price)}
                    </p>
                    {hasAccess && (
                        <Button
                            onClick={() => onToggle((prev) => !prev)}
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:bg-transparent w-full justify-end"
                            )}
                        >
                            <PenLine size={5} />
                        </Button>
                    )}
                </>
            ) : (
                <>
                    <Input onChange={(e) => setPrice(e.target.value)} value={price} className="text-xs" />
                    <div className="flex gap-2 items-center ml-auto">
                        <Button
                            type="reset"
                            variant="ghost"
                            className="text-xs h-7"
                            onClick={() => {
                                onToggle(false);
                                setPrice(priceValue);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="ghost"
                            onClick={onSubmit}
                            className="w-fit text-xs h-7 bg-emerald-400 hover:bg-emerald-500 text-white hover:text-white flex gap-4 disabled:cursor-not-allowed"
                        // className={cn("flex gap-4 ml-auto", loading && "pl-2.5")}
                        >
                            {/* {loading && <LoaderCircle className="animate-spin" />} */}
                            Save
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PriceCell;

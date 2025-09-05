import { BookingTable } from "@/interfaces/sites.interface";
import { CellContext } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { PenLine } from "lucide-react";
import { useUpdateRemarks } from "@/hooks/useSites";
import { useAuth } from "@/providers/auth.provider";
import { useClientAccess } from "@/hooks/useClients";

const RemarksCell = ({ row, column }: CellContext<BookingTable, unknown>) => {
  const { mutate } = useUpdateRemarks();
  const remarks: string = row.getValue(column.id);
  const [remark, setRemark] = useState<string>(remarks ?? "");
  const [toggle, onToggle] = useState(false);
  const { user } = useAuth();
  const { access } = useClientAccess(19);

  const onSubmit = () => {
    mutate(
      { site_code: row.original.site, remarks: remark },
      {
        onSuccess: () => {
          setRemark(remark);
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
    <div className="min-w-[300px] text-[0.65rem] relative group flex flex-col gap-2">
      {!toggle ? (
        <>
          <p className="text-start">{remarks !== remark ? remarks ?? "---" : remark}</p>
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
          <Textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="text-[0.65rem]"
          />
          <div className="flex gap-2 items-center ml-auto">
            <Button
              type="reset"
              variant="ghost"
              className="text-xs h-7"
              onClick={() => {
                onToggle(false);
                setRemark(remarks);
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

export default RemarksCell;

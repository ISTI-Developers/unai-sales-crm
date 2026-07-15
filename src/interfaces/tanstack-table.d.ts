/* eslint-disable @typescript-eslint/no-unused-vars */
import { RowData } from "@tanstack/react-table";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    hidden?: boolean;
    isCentered?: boolean;
    filterType?: "dropdown" | "date_range" | "price_range";
    allowedOptions?: FilterOption[];
    icon?: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
    isArray?: boolean;
  }
}

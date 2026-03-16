import Search from "../search";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Table } from "@tanstack/react-table";
import { useReports } from "@/providers/reports.provider";
import { ReactNode, useState } from "react";
import { capitalize } from "@/lib/utils";
import { generateWeeks } from "@/data/reports.columns";
import { getISOWeek } from "date-fns";
interface Config<TData> {
    setValue: (value: string) => void;
    table: Table<TData>;
    children: ReactNode
}

function TableConfigurations<TData>({
    setValue,
    table,
    children
}: Config<TData>) {
    const { setVisibleWeeks } = useReports();
    const [dropdownVisible, setDropdownVisibility] = useState(false);
    return (
        <div className="flex gap-4 items-center flex-wrap flex-grow">
            <Search setValue={setValue} />
            {children}
            <DropdownMenu
                open={dropdownVisible}
                onOpenChange={(open) => {
                    if (open) {
                        setDropdownVisibility(true);
                    }
                }}
                defaultOpen
            >
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">Show Weeks</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    onPointerDownOutside={() => {
                        setDropdownVisibility(false);
                    }}
                    align="end"
                    className="max-h-[500px] overflow-y-auto scrollbar-thin"
                >
                    {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) => {
                                        setVisibleWeeks((prev) => {
                                            return {
                                                ...prev,
                                                [column.id as keyof typeof prev]: !!value,
                                            };
                                        });
                                        column.toggleVisibility(!!value);
                                    }}
                                >
                                    {capitalize(column.id, "_")}
                                </DropdownMenuCheckboxItem>
                            );
                        })}
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-1 text-[0.6rem]">
                <p>Current Week:</p>
                <p className="text-[0.6rem] font-semibold">{generateWeeks()[getISOWeek(new Date()) - 1]}</p>
            </div>
        </div>
    );
}

export default TableConfigurations;

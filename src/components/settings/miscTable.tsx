import { ClientOptions } from "@/interfaces/client.interface";
import { ScrollArea } from "../ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tooltip, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { Pen, Trash2 } from "lucide-react";
import { TooltipContentWithArrow } from "../ui/tooltip-arrow";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function MiscTable({ options }: { options: ClientOptions[] }) {
  return (
    <ScrollArea className="rounded">
      <div className="h-[300px]">
        <Table className="w-full bg-white">
          <TableHeader className="border-b">
            <TableRow>
              <TableHead className="sticky top-0 bg-slate-300 text-main-100 shadow-lg text-xs uppercase font-bold z-10">
                Name
              </TableHead>
              <TableHead className="sticky top-0 bg-slate-300 text-main-100 shadow text-xs uppercase font-bold z-10">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.map((option) => {
              return (
                <TableRow key={option.misc_id}>
                  <TableCell className="w-1/2">{option.name}</TableCell>
                  <TableCell className="w-1/2">
                    <div className="flex gap-2">
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={null}
                            onClick={() => {}}
                            className="p-1 h-6 w-6 rounded-full border border-amber-400 hover:bg-amber-400 hover:text-white text-amber-400 transition-all"
                          >
                            <Pen size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContentWithArrow>Edit</TooltipContentWithArrow>
                      </Tooltip>
                      <Popover>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <PopoverTrigger asChild>
                              <Button
                                variant={null}
                                className="p-1 h-6 w-6 rounded-full border border-red-400 hover:bg-red-400 hover:text-white text-red-400 transition-all"
                              >
                                <Trash2 size={18} />
                              </Button>
                            </PopoverTrigger>
                          </TooltipTrigger>
                          <TooltipContentWithArrow>
                            Delete
                          </TooltipContentWithArrow>
                        </Tooltip>
                        <PopoverContent className="max-w-60 mr-4">
                          <div className="text-xs flex flex-col gap-2">
                            <p>
                              Remove this option? Affected clients will have
                              their <strong>{option.category}</strong> set to
                              '---'
                            </p>
                            <div className="flex gap-2 justify-end items-center">
                              <Button type="button" variant="ghost" size="xs">
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="xs"
                                className="w-fit"
                                onClick={() => {}}
                              >
                                Proceed
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
}

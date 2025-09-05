import { useState, useEffect, useMemo, FormEvent, ChangeEvent } from "react";
import { ReportTable, WeekData } from "@/interfaces/reports.interface";
import { capitalize } from "@/lib/utils";
import { Column, ColumnDef, FilterFnOption, Row } from "@tanstack/react-table";
import {
  addHours,
  addWeeks,
  format,
  getISOWeek,
  getISOWeeksInYear,
  isMonday,
  startOfYear,
} from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Paperclip, Pen, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSettings } from "@/providers/settings.provider";
import { Input } from "@/components/ui/input";

import { useUserReportViewAccesses } from "@/hooks/useSettings";
import {
  useDeleteReport,
  useInsertReport,
  useUpdateReport,
} from "@/hooks/useReports";
import { useAuth } from "@/providers/auth.provider";
import { catchError } from "@/providers/api";
import { getFridayFromISOWeek } from "@/lib/format";

interface Cell {
  row: Row<ReportTable>;
  column: Column<ReportTable, unknown>;
}
export const generateWeeks = () => {
  const startDate = startOfYear(new Date());
  const adjustedDate =
    startDate.getDay() > 1
      ? startDate.getDate() - startDate.getDay()
      : startDate;
  const weeks = [];
  let currentMonth = format(adjustedDate, "MMMM");
  let weekOfMonth = 1;

  for (let i = 0; i < getISOWeeksInYear(new Date()); i++) {
    const weekStart = addWeeks(startDate, i);
    const month = format(weekStart, "MMM");

    if (month !== currentMonth) {
      currentMonth = month;
      weekOfMonth = 1;
    }

    weeks.push(`${month} Wk${weekOfMonth}`);
    weekOfMonth++;
  }

  return weeks;
};

const renderColumn = (id: string) => ({
  id,
  accessorKey: id,
  header: id === "account_executive" ? "AE" : capitalize(id, "_"),
  cell: ({ row }: { row: Row<ReportTable> }) => {
    const column: string = row.getValue(id);
    let name = capitalize(column);
    if (id === "account_executive") {
      const item = row.original;
      name = item.ae_code as string;
    }
    return id === "account_executive" ? (
      <Tooltip delayDuration={100}>
        <TooltipTrigger className="uppercase text-xs font-semibold">
          {name}
        </TooltipTrigger>
        <TooltipContent>{capitalize(column)}</TooltipContent>
      </Tooltip>
    ) : (
      <p className="text-center">{name}</p>
    );
  },
  filterFn: "not" as FilterFnOption<ReportTable>,
});

export const useWeekColumns = () => {
  const { user: currentUser } = useAuth();
  const { data: access } = useUserReportViewAccesses(currentUser?.ID as number);
  const weekColumns: ColumnDef<ReportTable>[] = [
    {
      id: "client",
      accessorKey: "client",
      cell: ({ row, column }) => {
        const client: string = row.getValue(column.id);

        const words = client.split(" ");
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="max-w-[10vw] text-xs">
                {words.length > 5
                  ? `${words.slice(0, 5).join(" ")} ...`
                  : client}
              </p>
            </TooltipTrigger>
            {words.length > 5 && (
              <TooltipContent sideOffset={0} side="right">
                {client}
              </TooltipContent>
            )}
          </Tooltip>
        );
      },
    },
    {
      id: "status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status: string = row.getValue("status");
        const statusMap: {
          [key: string]:
          | "default"
          | "secondary"
          | "destructive"
          | "outline"
          | null
          | undefined;
        } = {
          active: "outline",
          hot: "outline",
          pool: "destructive",
          "on/off": "secondary",
          "for elections": "secondary",
        };

        const statusClasses: { [key: string]: string } = {
          active: "bg-green-100 text-green-700 border-green-300",
          hot: "bg-yellow-100 text-yellow-500 border-yellow-400",
          "on/off": "bg-sky-100 text-sky-600 border-sky-400",
          "for elections": "bg-sky-100 text-sky-600 border-sky-400",
        };
        return (
          <Badge
            variant={statusMap[status.toLowerCase()]}
            className={cn(
              statusClasses[status.toLowerCase()],
              "uppercase text-[0.5rem] px-1.5 h-5 rounded-full"
            )}
          >
            {status}
          </Badge>
        );
      },
      filterFn: "not" as FilterFnOption<ReportTable>,
    },
  ];

  if (currentUser) {
    const { role_id } = currentUser.role;
    if ([1, 3].includes(role_id) || access?.report_access === "all") {
      weekColumns.push(
        renderColumn("sales_unit"),
        renderColumn("account_executive")
      );
    } else if (role_id === 4 || access?.report_access === "team") {
      weekColumns.push(renderColumn("account_executive"));
    }
  }

  weekColumns.push(
    ...generateWeeks().map((week) => ({
      id: week,
      accessorKey: week,
      cell: WeekForm,
      filterFn: (
        row: Row<ReportTable>,
        columnId: string,
        filterValue: string[]
      ) => {
        const item: string = row.getValue(columnId);
        return filterValue[0] === "withContent"
          ? item.length !== 0
          : item.length === 0;
      },
    }))
  );

  return weekColumns;
};

const WeekForm = ({ column, row }: Cell) => {
  const { toast } = useToast();
  const { mutate: deleteReport } = useDeleteReport();
  const { weekAccess } = useSettings();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const client = row.original;
  const reportData = client[column.id] as string | WeekData;

  const isOpen = useMemo(() => {
    const weeks = generateWeeks();
    const currentWeekIndex = getISOWeek(new Date());
    const columnWeekIndex = weeks.indexOf(column.id);

    if (weekAccess.find((wk) => wk.week === column.id)) {
      return true;
    }
    if (columnWeekIndex === currentWeekIndex - 1) {
      return true;
    }

    if (columnWeekIndex === currentWeekIndex - 2) {
      const isItMonday = isMonday(new Date());
      const currentTime = new Date().getHours();

      if (isItMonday) {
        return currentTime < 23;
      }

      return false;
    }

    return false;
  }, [column.id, weekAccess]);

  const onDelete = async (reportID: number) => {
    if (reportID) {
      deleteReport(
        { ID: reportID },
        {
          onSuccess: () => {

            setOpen(false);
            toast({
              title: "Deletion Success",
              description: `Your activity has been cleared.`,
              variant: "success",
            });
          },
        }
      );
    }
  };

  const report = useMemo(() => {
    if (typeof reportData === "string") {
      return reportData;
    }
    return reportData.activity;
  }, [reportData]);

  const { name, initial } = useMemo(() => {
    if (typeof reportData === "string") return { name: "", initial: "" };
    return {
      name: reportData.editor,
      initial: reportData.editorCode,
    };
  }, [reportData]);
  return (
    <div className="w-full">
      {open ? (
        <ReportForm
          week={column.id}
          edit={edit}
          setEdit={setEdit}
          client={client}
          setOpen={setOpen}
          reportData={reportData}
        />
      ) : (
        <div
          className={cn(
            "relative group p-2 flex items-center",
            report.length > 0 ? "justify-start" : "justify-center"
          )}
        >
          <p
            className={cn(
              "block indent-0 transition-all",
              report.length === 0 && isOpen
                ? "group-hover:hidden"
                : "whitespace-break-spaces text-xs",
              report.length !== 0 ? "group-hover:pl-12" : ""
            )}
          >
            {report.length > 0 ? report : "---"}
          </p>
          {report.length === 0
            ? isOpen && (
              <Button
                variant={null}
                disabled={!isOpen}
                onClick={() => {
                  setOpen(true);
                }}
                className="hidden group-hover:flex w-full text-[0.6rem] p-1 px-2 h-5 gap-1"
              >
                <Plus size={12} /> Create Report
              </Button>
            )
            : isOpen && (
              <div className="absolute w-full flex items-center justify-center">
                <Tooltip delayDuration={100}>
                  <TooltipTrigger className="opacity-0 group-hover:opacity-80 duration-200 transition-all">
                    <Avatar className="w-10 h-6">
                      <AvatarFallback className="border border-slate-300 uppercase">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent className="capitalize">
                    {name}
                  </TooltipContent>
                </Tooltip>
                <div className="ml-auto flex gap-2 pr-2 h-full">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 overflow-hidden w-full transition-all">
                    {typeof reportData !== "string" && reportData.file && (
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button
                            asChild
                            variant={null}
                            disabled={!isOpen}
                            className="p-1 h-6 w-6 rounded-full border border-gray-400 hover:bg-gray-400 hover:text-white text-gray-400 transition-all z-[2]"
                          >
                            <a
                              href={`${import.meta.env.VITE_SERVER}${reportData.file
                                }`}
                              title="Activity Attachment"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 bg-gray-100 underline ml-2"
                            >
                              <Paperclip size={16} />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="z-[3]">
                          View Attachment
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={null}
                          disabled={!isOpen}
                          onClick={() => {
                            if (!isOpen) return;
                            setEdit(true);
                            setOpen(true);
                          }}
                          className="p-1 h-6 w-6 rounded-full border border-amber-400 bg-gray-100 hover:bg-amber-400 hover:text-white text-amber-400 transition-all z-[2]"
                        >
                          <Pen size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="z-[3]">Edit</TooltipContent>
                    </Tooltip>
                    <Popover>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <Button
                              variant={null}
                              className="p-1 h-6 w-6 rounded-full border border-red-400 bg-gray-100 hover:bg-red-400 hover:text-white text-red-400 transition-all z-[2]"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent className="z-[3]">
                          Delete
                        </TooltipContent>
                      </Tooltip>
                      <PopoverContent className="max-w-60 mr-4">
                        <div className="text-xs flex flex-col gap-2">
                          <p>Are you sure you want to remove this report?</p>
                          <div className="flex gap-2 justify-end items-center">
                            <Button type="button" variant="ghost" size="sm">
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="w-fit"
                              onClick={() => {
                                if (typeof reportData === "object") {
                                  onDelete(reportData.reportID);
                                }
                              }}
                            >
                              Proceed
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
const ReportForm = ({
  week,
  client,
  setOpen,
  edit,
  setEdit,
  reportData,
}: {
  week: string;
  edit: boolean;
  setEdit: (bool: boolean) => void;
  client: ReportTable;
  setOpen: (bool: boolean) => void;
  reportData: string | WeekData;
}) => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { mutate: insertReport } = useInsertReport();
  const { mutate: updateReport } = useUpdateReport();

  const weeks = useMemo(() => generateWeeks(), []);
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    let dateSubmitted = new Date();
    const currentWeek = weeks[getISOWeek(addHours(new Date(), import.meta.env.VITE_TIME_ADJUST)) - 1];

    if (currentWeek !== week) {
      dateSubmitted =
        getFridayFromISOWeek(2025, weeks.indexOf(week) + 1) ?? new Date();
    }
    console.log(dateSubmitted);
    const ID = Number(currentUser.ID);
    const SU = currentUser.sales_unit
      ? currentUser.sales_unit.sales_unit_id
      : 0;

    if (report.trim().length === 0) {
      toast({
        description: `Report should not be empty.`,
        variant: "warning",
      });
      return;
    }
    if (edit) {
      if (typeof reportData === "string") return;
      const reportID = Number(reportData.reportID);
      updateReport(
        {
          report_id: reportID,
          user_id: ID,
          date: new Date().toISOString(),
          report,
          file_path: reportData.file ?? "",
          file: selectedFile,
          file_id: reportData.fileID,
        },
        {
          onSuccess: () => {
            setOpen(false);
            toast({
              description: `Your report has been updated!`,
              variant: "success",
            });
          },
        }
      );
    } else {
      insertReport(
        {
          client_id: client.client_id,
          sales_unit_id: SU,
          user_id: ID,
          date: dateSubmitted.toISOString() ?? new Date().toISOString(),
          report,
          file: selectedFile,
        },
        {
          onSuccess: () => {
            setOpen(false);
            toast({
              description: `Your report has been saved!`,
              variant: "success",
            });
          },
          onError: () => {
            setLoading(false);
          },
        }
      );
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files) throw new Error("File not found");

      const file = e.target.files[0];
      const maxSizeMB = 2;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (file) {
        if (file.size > maxSizeBytes) {
          e.target.value = ""; // Clear the file input
          throw new Error(`File is too large. Max size is ${maxSizeMB}MB.`);
        } else {
          setSelectedFile(file);
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        }
      }
    } catch (error) {
      catchError(error);
    }
  };

  const cantSubmit = useMemo(() => {
    return report.length === 0;
  }, [report]);

  useEffect(() => {
    if (typeof reportData === "string") return;
    setReport(reportData.activity);
    if (reportData.file) {
      setPreviewUrl(`${import.meta.env.VITE_SERVER}${reportData.file}`);
    }
  }, [reportData]);

  return (
    <form
      className="p-4 flex flex-col gap-4 items-end"
      onSubmit={onSubmit}
      encType="multi-part/formdata"
    >
      <Textarea
        value={report}
        onChange={(e) => setReport(e.target.value)}
        placeholder="Enter your activities here..."
      />
      <div className="w-fit mr-auto flex flex-col items-start gap-4">
        {previewUrl && (
          <div className="text-sm text-gray-700">
            Attachment:
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline ml-2"
            >
              {selectedFile ? selectedFile.name : "View"}
            </a>
          </div>
        )}
        <Input
          id="attachment"
          type="file"
          className="w-fit mr-auto"
          accept="image/*,application/pdf"
          onChange={onFileChange}
        />
      </div>
      <div className="flex gap-2 items-center">
        <Button
          type="reset"
          variant="ghost"
          className="text-xs h-7"
          onClick={() => {
            setEdit(false);
            setOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="ghost"
          className="w-fit text-xs h-7 bg-emerald-500 hover:bg-teal-700 text-white hover:text-white flex gap-4 disabled:cursor-not-allowed"
          disabled={loading || cantSubmit}
        // className={cn("flex gap-4 ml-auto", loading && "pl-2.5")}
        >
          {loading && <LoaderCircle className="animate-spin" />}
          Save
        </Button>
      </div>
    </form>
  );
};

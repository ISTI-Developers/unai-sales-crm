import { ComboBox } from '../combobox'
import { ChangeEvent, FormEvent, useMemo, useState } from 'react'
import { List } from '@/interfaces'
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
// import { generateWeeks } from '@/data/reports.columns';
import { useAuth } from '@/providers/auth.provider';
// import { addHours, getISOWeek } from 'date-fns';
// import { getFridayFromISOWeek } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { useInsertReport } from '@/hooks/useReports';
import { catchError } from '@/providers/api';
import { DatePicker } from '../ui/datepicker';

interface CreateReport<TData extends { client_id: string | number; client: string }> {
    data: TData[]
    open: boolean,
    onOpenChange: (open: boolean) => void
}
function CreateReport<TData extends { client_id: string | number; client: string }>({ data, onOpenChange }: CreateReport<TData>) {

    const { user: currentUser } = useAuth();
    // const weeks = useMemo(() => generateWeeks(), []);

    const [date, setDate] = useState<Date>(new Date())
    // const [week, setWeek] = useState<string>(weeks[getISOWeek(addHours(date, import.meta.env.VITE_TIME_ADJUST)) - 1])
    const [client, setClient] = useState<List>();
    const [report, setReport] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { mutate: insertReport } = useInsertReport();

    const options: List[] = useMemo(() => {

        if (!data) return [];

        return data.map(d => {
            return {
                id: String(d.client_id),
                value: d.client,
                label: d.client,
            }
        }).sort((a, b) => a.value.localeCompare(b.value))
    }, [data])

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!currentUser || !client) return;
        setLoading(true);
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

        insertReport(
            {
                client_id: Number(client.id),
                sales_unit_id: SU,
                user_id: ID,
                date: date.toISOString() ?? new Date().toISOString(),
                report,
                file: selectedFile,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
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

    return (
        <div className='flex flex-col gap-4'>
            <header className='px-2 flex items-center justify-between'>
                <span className='font-semibold'>Create Report</span>
                <Button variant={"ghost"} size={"icon"} onClick={() => onOpenChange(false)}>
                    <X />
                </Button>
            </header>
            <main className='px-2'>
                <form className='flex flex-col gap-4' encType='multi-part/formdata' onSubmit={onSubmit}>
                    <ComboBox title="client" list={options} value={client?.value ?? ""} setValue={(id) => setClient(options.find(opt => opt.id === id))} />
                    <DatePicker date={date} onDateChange={(date) => {
                        if (!date) return;
                        setDate(date)
                    }} />
                    <Textarea className='text-sm' placeholder='Enter report here' onChange={(e) => setReport(e.target.value)} value={report} />
                    <div className='flex items-center'>
                        <Input id="attachment"
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={onFileChange}
                            className='w-full max-w-[200px] text-xs' />
                        {previewUrl && (
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline ml-2 text-xs flex items-center"
                            >
                                {selectedFile && `view file`}
                            </a>)}
                    </div>
                    <div className='flex items-center justify-end pb-2 gap-2'>
                        <Button
                            type="reset"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="ghost"
                            type="submit"
                            disabled={!client || !report || loading}
                            className={
                                "bg-main-100 hover:bg-main-700 text-white hover:text-white"
                            }
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default CreateReport
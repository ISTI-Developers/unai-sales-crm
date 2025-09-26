import { ScrollArea } from "../ui/scroll-area";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";

const CompanyAccess = () => {
    return (
        <ScrollArea className="max-h-[400px] rounded-md">
            <div className="shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="sticky top-0 bg-slate-300 text-main-100 shadow-lg text-xs uppercase font-bold z-[2] w-1/2">
                                Company
                            </TableHead>
                            <TableHead className="sticky top-0 bg-slate-300 text-main-100 shadow-lg text-xs uppercase font-bold z-[2] w-1/2">
                                Access
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white">

                    </TableBody>
                </Table>
            </div>
        </ScrollArea>
    )
}

export default CompanyAccess
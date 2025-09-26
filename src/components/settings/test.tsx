import { ColumnDef, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

// 1. Extended type
type Person = {
    id: string;
    name: string;
    age?: number;
    address?: string;
    municipality?: string;
    children?: Person[];
};

// 2. Extended data
const data: Person[] = [
    {
        id: "1",
        name: "Parent 1",
        age: 50,
        address: "123 Main St",
        municipality: "Springfield",
        children: [
            { id: "1.1", name: "Child 1", age: 25, address: "456 Oak Ave", municipality: "Shelbyville" },
            { id: "1.2", name: "Child 2", age: 22, address: "789 Pine Rd", municipality: "Shelbyville" },
        ],
    },
    {
        id: "2",
        name: "Parent 2",
        age: 45,
        address: "999 Elm St",
        municipality: "Riverdale",
        children: [
            { id: "2.1", name: "Child 1", age: 20, address: "111 Cedar Ln", municipality: "Greendale" },
            {
                id: "2.2",
                name: "Child 2",
                age: 18,
                address: "222 Birch Blvd",
                municipality: "Greendale",
                children: [
                    { id: "2.2.1", name: "Grandchild 1", age: 2, address: "333 Willow Ct", municipality: "Greendale" }
                ],
            },
        ],
    },
];

// 3. Extended columns
const columns: ColumnDef<Person>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div style={{ paddingLeft: `${row.depth * 20}px` }} className="flex items-center gap-2">
                {row.getCanExpand() && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={row.getToggleExpandedHandler()}
                    >
                        {row.getIsExpanded() ? "−" : "+"}
                    </Button>
                )}
                {row.original.name}
            </div>
        ),
    },
    {
        accessorKey: "age",
        header: "Age",
        cell: ({ row }) => row.original.age ?? "-",
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => row.original.address ?? "-",
    },
    {
        accessorKey: "municipality",
        header: "Municipality",
        cell: ({ row }) => row.original.municipality ?? "-",
    },
];

function NestedTableTesting() {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.children,
    });

    return (
        <div>
            <header className="font-semibold mb-2">TESTING FOR NESTED TABLES</header>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id}>
                            {hg.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell, index) => (
                                    <TableCell
                                        key={cell.id}
                                        className={index === row.getVisibleCells().length - 1 ? "text-center" : ""}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default NestedTableTesting;

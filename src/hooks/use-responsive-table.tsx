import { useEffect, useState } from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    FilterFn,
    getCoreRowModel,
    getExpandedRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { useLocation } from "react-router-dom";
import { Filter } from "@/interfaces/tanstack-table";

interface UseResponsiveTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    size?: number;
    getSubRows?: (row: TData) => TData[] | undefined;
    globalFilterFn?: FilterFn<TData>;
}

export function useResponsiveTable<TData, TValue>({
    columns,
    data,
    size = 10,
    getSubRows,
    globalFilterFn,
}: UseResponsiveTableProps<TData, TValue>) {
    const location = useLocation();

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const [isEditingFilter, setEditingFilter] = useState<Filter>();

    const [columnVisibility, setColumnVisibility] =
        useState<VisibilityState>(() => {
            const saved = localStorage.getItem(
                `visibility${location.pathname}`
            );

            return saved ? JSON.parse(saved) : {};
        });

    const [paginationState, setPaginationState] =
        useState<PaginationState>({
            pageIndex: 0,
            pageSize: size,
        });

    const table = useReactTable({
        data,
        columns,

        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),

        getSubRows,

        globalFilterFn: globalFilterFn ?? "auto",

        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPaginationState,

        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter,
            pagination: paginationState,
        },
    });

    // Persist column visibility
    useEffect(() => {
        localStorage.setItem(
            `visibility${location.pathname}`,
            JSON.stringify(columnVisibility)
        );
    }, [columnVisibility, location.pathname]);

    // Restore filters
    useEffect(() => {
        const storedFilters = sessionStorage.getItem(
            `filter${location.pathname}`
        );

        if (storedFilters) {
            try {
                setColumnFilters(JSON.parse(storedFilters));
            } catch {
                // Ignore invalid stored filters
            }
        }
    }, [location.pathname]);

    // Persist filters
    useEffect(() => {
        if (columnFilters.length > 0) {
            sessionStorage.setItem(
                `filter${location.pathname}`,
                JSON.stringify(columnFilters)
            );
        }
    }, [columnFilters, location.pathname]);

    return {
        table,

        // State
        sorting,
        columnFilters,
        globalFilter,
        columnVisibility,
        paginationState,
        isEditingFilter,

        // Setters
        setSorting,
        setColumnFilters,
        setGlobalFilter,
        setColumnVisibility,
        setPaginationState,
        setEditingFilter,
    };
}
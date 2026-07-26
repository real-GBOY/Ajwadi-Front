/** @format */

import { MouseEvent, useEffect, useRef, useState } from "react";
import {
   useReactTable,
   getCoreRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   getFilteredRowModel,
   ColumnDef,
   flexRender,
   SortingState,
   ColumnFiltersState,
   RowSelectionState,
   PaginationState,
   Table as TanStackTable,
} from "@tanstack/react-table";
import {
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "./table";
import { useTranslation } from "react-i18next";
import { cn, isEnglishText } from "@/utilities/index";
import { ChevronDown } from "lucide-react";
import Loader from "../Loader";

export interface DataTableProps<TData, TValue> {
   columns: ColumnDef<TData, TValue>[];
   data: TData[];
   pageSize?: number;
   globalFilter?: string;
   onRowSelectionChange?: (selectedRows: TData[]) => void;
   enableRowSelection?: boolean;
   showPagination?: boolean;
   className?: string;
   translationNamespace?: string;
   renderFloatingBar?: (
      selectedCount: number,
      selectedRows: TData[]
   ) => React.ReactNode;
   onRowClick?: (row: TData) => void;
   enableRowHover?: boolean;
   scrollContainerClassName?: string;
   resetSelectionSignal?: number;
   manualPagination?: boolean;
   pageCount?: number;
   pagination?: {
      pageIndex: number;
      pageSize: number;
   };
   onPaginationChange?: (updater: any) => void;
   isLoading?: boolean;
}

interface DataTablePaginationProps<TData> {
   table: TanStackTable<TData>;
   translationNamespace?: string;
}

function DataTablePagination<TData>({
   table,
   translationNamespace: _translationNamespace = "common",
}: DataTablePaginationProps<TData>) {
   const { t } = useTranslation();
   const currentPage = table.getState().pagination.pageIndex + 1;
   const totalPagesRaw = table.getPageCount();
   const totalPages = totalPagesRaw > 0 ? totalPagesRaw : 1;
   const pageSizeOptions = [10, 20, 50, 100];
   const [isPageSizeDropdownOpen, setIsPageSizeDropdownOpen] = useState(false);
   const pageSizeButtonRef = useRef<HTMLButtonElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Close dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent | Event) => {
         const target = event.target as Node;
         if (
            dropdownRef.current &&
            !dropdownRef.current.contains(target) &&
            pageSizeButtonRef.current &&
            !pageSizeButtonRef.current.contains(target)
         ) {
            setIsPageSizeDropdownOpen(false);
         }
      };

      if (isPageSizeDropdownOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [isPageSizeDropdownOpen]);

   const pageSizeLabel = `${table.getState().pagination.pageSize} ${
      t("pagination.perPage", "لكل صفحة")
   }`;

   const rowsPerPageControl = (
      <div className="relative">
         <span className="sr-only">{t("pagination.rowsPerPage", "عدد الصفوف لكل صفحة")}</span>
         <button
            type="button"
            ref={pageSizeButtonRef}
            onClick={() => setIsPageSizeDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 px-2.5 py-1 text-[11px] md:text-sm text-text-sub border border-border rounded-lg bg-background hover:bg-bg-weak transition-colors w-full sm:w-auto justify-between">
            <span>{pageSizeLabel}</span>
            <ChevronDown size={14} className="fill-current" />
         </button>

         {isPageSizeDropdownOpen && (
            <div
               ref={dropdownRef}
               className="absolute bottom-full mb-1 left-0 bg-background border border-border rounded-lg shadow-lg z-50 min-w-[120px]">
               {pageSizeOptions.map((pageSize) => (
                  <button
                     key={pageSize}
                     onClick={() => {
                        table.setPageSize(pageSize);
                        setIsPageSizeDropdownOpen(false);
                     }}
                     className="w-full text-right px-3 py-2 text-sm text-text-strong hover:bg-bg-weak transition-colors first:rounded-t-lg last:rounded-b-lg">
                     {pageSize} {t("pagination.perPage", "لكل صفحة")}
                  </button>
               ))}
            </div>
         )}
      </div>
   );

   const pager = (
      <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
         <button
            type="button"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-xs md:text-sm text-text-sub hover:bg-bg-weak rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors rtl:rotate-180">
            «
         </button>
         <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 text-xs md:text-sm text-text-sub hover:bg-bg-weak rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors rtl:rotate-180">
            ‹
         </button>

         {Array.from({ length: totalPages }, (_, i) => i).map((pageIndex) => {
            if (
               pageIndex === 0 ||
               pageIndex === totalPages - 1 ||
               (pageIndex >= currentPage - 2 && pageIndex <= currentPage)
            ) {
               return (
                  <button
                     type="button"
                     key={pageIndex}
                     onClick={() => table.setPageIndex(pageIndex)}
                     className={`px-3 py-1 text-xs md:text-sm rounded ${
                        pageIndex === currentPage - 1
                           ? "bg-primary text-text-main"
                           : "text-text-sub hover:bg-bg-weak"
                     }`}>
                     {pageIndex + 1}
                  </button>
               );
            } else if (
               pageIndex === currentPage - 3 ||
               pageIndex === currentPage + 1
            ) {
               return (
                  <span
                     key={pageIndex}
                     className="px-2 text-text-sub text-xs md:text-sm">
                     ...
                  </span>
               );
            }
            return null;
         })}

         <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 text-xs md:text-sm text-text-sub hover:bg-bg-weak rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors rtl:rotate-180">
            ›
         </button>
         <button
            type="button"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 text-xs md:text-sm text-text-sub hover:bg-bg-weak rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors rtl:rotate-180">
            »
         </button>
      </div>
   );

   return (
      <div className="flex flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4 border border-border border-t-0 rounded-b-lg">
         <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-sub md:hidden">
            <span>
               {t("pagination.page", "صفحة")} {currentPage} {t("pagination.of", "من")}{" "}
               {totalPages}
            </span>
            <div className="flex items-center gap-2">{pager}</div>
            <div className="flex items-center gap-2">{rowsPerPageControl}</div>
         </div>

         <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="text-sm text-text-sub md:justify-self-start">
               {t("pagination.page", "صفحة")} {currentPage} {t("pagination.of", "من")}{" "}
               {totalPages}
            </div>
            {pager}
            <div className="flex flex-wrap items-center gap-2 md:justify-self-end md:justify-end">
               {rowsPerPageControl}
            </div>
         </div>
      </div>
   );
}

export function DataTable<TData, TValue>({
   columns,
   data,
   pageSize = 10,
   globalFilter = "",
   onRowSelectionChange,
   enableRowSelection = false,
   showPagination = true,
   className,
   translationNamespace = "common",
   renderFloatingBar,
   onRowClick,
   enableRowHover = false,
   scrollContainerClassName,
   resetSelectionSignal,
   manualPagination,
   pageCount,
   pagination,
   onPaginationChange,
   isLoading = false,
}: DataTableProps<TData, TValue>) {
   const { t } = useTranslation();
   const [sorting, setSorting] = useState<SortingState>([]);
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
   const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

   // Manage pagination state internally when not provided externally
   const [internalPagination, setInternalPagination] = useState<PaginationState>({
      pageIndex: 0,
      pageSize,
   });

   useEffect(() => {
      if (resetSelectionSignal !== undefined) {
         setRowSelection({});
      }
   }, [resetSelectionSignal]);

   // Update internal pagination pageSize when prop changes
   useEffect(() => {
      if (!pagination) {
         setInternalPagination((prev) => ({
            ...prev,
            pageSize,
         }));
      }
   }, [pageSize, pagination]);

   // Use external pagination if provided, otherwise use internal state
   const paginationState = pagination || internalPagination;
   const handlePaginationChange = onPaginationChange || setInternalPagination;

   const table = useReactTable({
      data,
      columns,
      state: {
         sorting: manualPagination ? [] : sorting,
         columnFilters: manualPagination ? [] : columnFilters,
         rowSelection,
         globalFilter: manualPagination ? "" : globalFilter,
         pagination: paginationState,
      },
      manualPagination,
      pageCount,
      onPaginationChange: handlePaginationChange,
      enableRowSelection,
      onRowSelectionChange: (updater) => {
         setRowSelection(updater);
         if (onRowSelectionChange) {
            const newSelection =
               typeof updater === "function" ? updater(rowSelection) : updater;
            const selectedRows = Object.keys(newSelection)
               .filter((key) => newSelection[key])
               .map((key) => data[parseInt(key)]);
            onRowSelectionChange(selectedRows);
         }
      },
      onSortingChange: manualPagination ? undefined : setSorting,
      onColumnFiltersChange: manualPagination ? undefined : setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      ...(manualPagination
         ? {
            // When using manual pagination, disable client-side filtering and sorting
            // Server handles all filtering, sorting, and pagination
         }
         : {
            getSortedRowModel: getSortedRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            globalFilterFn: "includesString",
         }),
      autoResetPageIndex: false,
      initialState: {
         pagination: {
            pageSize,
         },
      },
   });

   const handleRowClick = (
      event: MouseEvent<HTMLTableRowElement>,
      rowData: TData
   ) => {
      const target = event.target as HTMLElement | null;

      // Avoid triggering row actions when interacting with buttons/inputs/links inside the row
      if (
         target?.closest(
            "button, a, input, textarea, select, option, [data-row-click-ignore]"
         )
      ) {
         return;
      }

      if (onRowClick) {
         onRowClick(rowData);
         return;
      }

      // No preview handler, try to open the row action menu if it exists
      const menuTrigger =
         event.currentTarget.querySelector<HTMLElement>(
            "[data-row-menu-trigger]"
         );

      if (menuTrigger) {
         menuTrigger.click();
         menuTrigger.focus?.();
      }
   };

   return (
      <div className={cn("flex flex-col min-w-0", className)}>
         <div className="relative border border-border rounded-t-lg overflow-hidden min-w-0">
            <div
               className={cn(
                  "overflow-auto overflow-x-auto overscroll-x-contain",
                  scrollContainerClassName ?? "max-h-[50vh] sm:max-h-[62vh]"
               )}>
               <table className="w-full caption-bottom text-xs sm:text-sm table-fixed">
                  <TableHeader className="bg-bg-weak sticky top-0 z-10">
                     {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                           key={headerGroup.id}
                           className="border-b border-border">
                           {headerGroup.headers.map((header) => (
                              <TableHead
                                 key={header.id}
                                 className={cn(
                                    "py-2 px-3 sm:px-4 text-start text-xs sm:text-sm font-normal text-text-strong bg-bg-weak whitespace-nowrap",
                                    header.column.id === "select" && "ps-3! pe-3!",
                                    header.column.id === "name" && "pe-3! px-0!",
                                    (header.column.columnDef.meta as { className?: string } | undefined)?.className
                                 )}
                                 style={{ width: header.getSize() }}>
                                 {header.isPlaceholder ? null : (
                                    <div className="truncate min-w-0">
                                       {flexRender(
                                          header.column.columnDef.header,
                                          header.getContext()
                                       )}
                                    </div>
                                 )}
                              </TableHead>
                           ))}
                        </TableRow>
                     ))}
                  </TableHeader>
                  <TableBody className="bg-background">
                     {isLoading ? (
                        <TableRow>
                           <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center">
                              <div className="flex justify-center items-center py-8">
                                 <Loader label={t("loading.general", "جاري التحميل...")} />
                              </div>
                           </TableCell>
                        </TableRow>
                     ) : table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                           <TableRow
                              key={row.id}
                              data-state={row.getIsSelected() && "selected"}
                              className={cn(
                                 "border-b border-border last:border-b-0",
                                 (onRowClick || enableRowHover) &&
                                    "cursor-pointer hover:bg-bg-weak transition-colors"
                              )}
                              onClick={(event) =>
                                 handleRowClick(event, row.original)
                              }>
                              {row.getVisibleCells().map((cell) => {
                                 const cellValue = cell.getValue();
                                 const isEnglish = isEnglishText(
                                    cellValue as string | number | null | undefined
                                 );
                                 return (
                                    <TableCell
                                       key={cell.id}
                                       className={cn(
                                          "px-3 py-2 sm:px-4 sm:py-2.5 text-start text-xs sm:text-sm",
                                          cell.column.id === "select" && "ps-3! pe-3!",
                                          cell.column.id === "name" && "pe-3! px-0!",
                                          isEnglish && "font-english",
                                          (cell.column.columnDef.meta as { className?: string } | undefined)?.className
                                       )}
                                       style={{ width: cell.column.getSize() }}>
                                       {flexRender(
                                          cell.column.columnDef.cell,
                                          cell.getContext()
                                       )}
                                    </TableCell>
                                 );
                              })}
                           </TableRow>
                        ))
                     ) : (
                        <TableRow>
                           <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center text-text-sub text-xs sm:text-sm">
                              {t("table.noResults", "لا توجد نتائج")}
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </table>
            </div>
            {renderFloatingBar &&
               renderFloatingBar(
                  Object.keys(rowSelection).filter(
                     (key) => rowSelection[key]
                  ).length,
                  Object.keys(rowSelection)
                     .filter((key) => rowSelection[key])
                     .map((key) => data[parseInt(key)])
               )}
         </div>
         {showPagination && (
            <DataTablePagination
               table={table}
               translationNamespace={translationNamespace}
            />
         )}
      </div>
   );
}

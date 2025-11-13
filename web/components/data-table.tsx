"use client"

import * as React from "react"
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	GripVertical,
	Columns,
	Plus,
} from "lucide-react"
import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	Row,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Create a separate component for the drag handle
function DragHandle<TData extends { id: number | string }>({ id }: { id: number | string }) {
	const { attributes, listeners } = useSortable({
		id,
	})

	return (
		<Button
			{...attributes}
			{...listeners}
			variant="ghost"
			size="icon"
			className="text-muted-foreground size-7 hover:bg-transparent"
		>
			<GripVertical className="text-muted-foreground size-3" />
			<span className="sr-only">Drag to reorder</span>
		</Button>
	)
}

function DraggableRow<TData>({
	row,
	getRowId,
}: {
	row: Row<TData>
	getRowId: (row: TData) => string | number
}) {
	const rowId = getRowId(row.original)
	const { transform, transition, setNodeRef, isDragging } = useSortable({
		id: rowId,
	})

	return (
		<TableRow
			data-state={row.getIsSelected() && "selected"}
			data-dragging={isDragging}
			ref={setNodeRef}
			className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
			style={{
				transform: CSS.Transform.toString(transform),
				transition: transition,
			}}
		>
			{row.getVisibleCells().map((cell) => (
				<TableCell key={cell.id}>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</TableCell>
			))}
		</TableRow>
	)
}

export interface DataTableProps<TData> {
	data: TData[]
	columns: ColumnDef<TData>[]
	getRowId?: (row: TData) => string | number
	enableDrag?: boolean
	enableSelection?: boolean
	onDataChange?: (data: TData[]) => void
	tabs?: Array<{
		value: string
		label: string
		badge?: number
		content?: React.ReactNode
	}>
	defaultTab?: string
	pageSize?: number
	pageSizeOptions?: number[]
	showAddButton?: boolean
	addButtonLabel?: string
	onAddClick?: () => void
	emptyMessage?: string
}

export function DataTable<TData>({
	data: initialData,
	columns: userColumns,
	getRowId = (row: TData) => (row as { id: number | string }).id,
	enableDrag = false,
	enableSelection = true,
	onDataChange,
	tabs,
	defaultTab,
	pageSize = 10,
	pageSizeOptions = [10, 20, 30, 40, 50],
	showAddButton = false,
	addButtonLabel = "Add Section",
	onAddClick,
	emptyMessage = "No results.",
}: DataTableProps<TData>) {
	const [data, setData] = React.useState(() => initialData)
	const [rowSelection, setRowSelection] = React.useState({})
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize,
	})
	const sortableId = React.useId()
	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {})
	)

	// Update data when initialData changes
	React.useEffect(() => {
		setData(initialData)
	}, [initialData])

	const dataIds = React.useMemo<UniqueIdentifier[]>(
		() => data?.map((row) => getRowId(row)) || [],
		[data, getRowId]
	)

	// Build columns with optional drag and selection columns
	const columns = React.useMemo<ColumnDef<TData>[]>(() => {
		const cols: ColumnDef<TData>[] = []

		if (enableDrag) {
			cols.push({
				id: "drag",
				header: () => null,
				cell: ({ row }) => <DragHandle id={getRowId(row.original)} />,
				enableSorting: false,
				enableHiding: false,
			})
		}

		if (enableSelection) {
			cols.push({
				id: "select",
				header: ({ table }) => (
					<div className="flex items-center justify-center">
						<Checkbox
							checked={
								table.getIsAllPageRowsSelected() ||
								(table.getIsSomePageRowsSelected() && "indeterminate")
							}
							onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
							aria-label="Select all"
						/>
					</div>
				),
				cell: ({ row }) => (
					<div className="flex items-center justify-center">
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							aria-label="Select row"
						/>
					</div>
				),
				enableSorting: false,
				enableHiding: false,
			})
		}

		return [...cols, ...userColumns]
	}, [enableDrag, enableSelection, userColumns, getRowId])

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: (row) => String(getRowId(row)),
		enableRowSelection: enableSelection,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	})

	function handleDragEnd(event: DragEndEvent) {
		if (!enableDrag) return

		const { active, over } = event
		if (active && over && active.id !== over.id) {
			setData((currentData) => {
				const oldIndex = dataIds.indexOf(active.id)
				const newIndex = dataIds.indexOf(over.id)
				const newData = arrayMove(currentData, oldIndex, newIndex)
				onDataChange?.(newData)
				return newData
			})
		}
	}

	const tableContent = (
		<div className="overflow-hidden rounded-lg border">
			{enableDrag ? (
				<DndContext
					collisionDetection={closestCenter}
					modifiers={[restrictToVerticalAxis]}
					onDragEnd={handleDragEnd}
					sensors={sensors}
					id={sortableId}
				>
					<Table>
						<TableHeader className="bg-muted sticky top-0 z-10">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} colSpan={header.colSpan}>
												{header.isPlaceholder
													? null
													: flexRender(header.column.columnDef.header, header.getContext())}
											</TableHead>
										)
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody className="**:data-[slot=table-cell]:first:w-8">
							{table.getRowModel().rows?.length ? (
								<SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
									{table.getRowModel().rows.map((row) => (
										<DraggableRow key={row.id} row={row} getRowId={getRowId} />
									))}
								</SortableContext>
							) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										{emptyMessage}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</DndContext>
			) : (
				<Table>
					<TableHeader className="bg-muted sticky top-0 z-10">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody className="**:data-[slot=table-cell]:first:w-8">
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									{emptyMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			)}
		</div>
	)

	const paginationContent = (
		<div className="flex items-center justify-between px-4">
			{enableSelection && (
				<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>
			)}
			<div
				className={`flex w-full items-center gap-8 ${enableSelection ? "lg:w-fit" : "lg:w-full"}`}
			>
				<div className="hidden items-center gap-2 lg:flex">
					<Label htmlFor="rows-per-page" className="text-sm font-medium">
						Rows per page
					</Label>
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value))
						}}
					>
						<SelectTrigger size="sm" className="w-20" id="rows-per-page">
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side="top">
							{pageSizeOptions.map((size) => (
								<SelectItem key={size} value={`${size}`}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex w-fit items-center justify-center text-sm font-medium">
					Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
				</div>
				<div className="ml-auto flex items-center gap-2 lg:ml-0">
					<Button
						variant="outline"
						className="hidden h-8 w-8 p-0 lg:flex"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to first page</span>
						<ChevronsLeft />
					</Button>
					<Button
						variant="outline"
						className="size-8"
						size="icon"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<span className="sr-only">Go to previous page</span>
						<ChevronLeft />
					</Button>
					<Button
						variant="outline"
						className="size-8"
						size="icon"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to next page</span>
						<ChevronRight />
					</Button>
					<Button
						variant="outline"
						className="hidden size-8 lg:flex"
						size="icon"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}
					>
						<span className="sr-only">Go to last page</span>
						<ChevronsRight />
					</Button>
				</div>
			</div>
		</div>
	)

	if (tabs && tabs.length > 0) {
		return (
			<Tabs
				defaultValue={defaultTab || tabs[0]?.value}
				className="w-full flex-col justify-start gap-6"
			>
				<div className="flex items-center justify-between px-4 lg:px-6">
					<Label htmlFor="view-selector" className="sr-only">
						View
					</Label>
					<Select defaultValue={defaultTab || tabs[0]?.value}>
						<SelectTrigger className="flex w-fit @4xl/main:hidden" size="sm" id="view-selector">
							<SelectValue placeholder="Select a view" />
						</SelectTrigger>
						<SelectContent>
							{tabs.map((tab) => (
								<SelectItem key={tab.value} value={tab.value}>
									{tab.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
						{tabs.map((tab) => (
							<TabsTrigger key={tab.value} value={tab.value}>
								{tab.label}
								{tab.badge !== undefined && <Badge variant="secondary">{tab.badge}</Badge>}
							</TabsTrigger>
						))}
					</TabsList>
					<div className="flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									<Columns />
									<span className="hidden lg:inline">Customize Columns</span>
									<span className="lg:hidden">Columns</span>
									<ChevronDown />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56">
								{table
									.getAllColumns()
									.filter(
										(column) => typeof column.accessorFn !== "undefined" && column.getCanHide()
									)
									.map((column) => {
										return (
											<DropdownMenuCheckboxItem
												key={column.id}
												className="capitalize"
												checked={column.getIsVisible()}
												onCheckedChange={(value) => column.toggleVisibility(!!value)}
											>
												{column.id}
											</DropdownMenuCheckboxItem>
										)
									})}
							</DropdownMenuContent>
						</DropdownMenu>
						{showAddButton && (
							<Button variant="outline" size="sm" onClick={onAddClick}>
								<Plus />
								<span className="hidden lg:inline">{addButtonLabel}</span>
							</Button>
						)}
					</div>
				</div>
				{tabs.map((tab) => (
					<TabsContent
						key={tab.value}
						value={tab.value}
						className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
					>
						{tab.value === (defaultTab || tabs[0]?.value) ? (
							<>
								{tableContent}
								{paginationContent}
							</>
						) : (
							tab.content || (
								<div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
							)
						)}
					</TabsContent>
				))}
			</Tabs>
		)
	}

	return (
		<div className="w-full flex-col justify-start gap-6">
			<div className="flex items-center justify-end px-4 lg:px-6">
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<Columns />
								<span className="hidden lg:inline">Customize Columns</span>
								<span className="lg:hidden">Columns</span>
								<ChevronDown />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							{table
								.getAllColumns()
								.filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) => column.toggleVisibility(!!value)}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									)
								})}
						</DropdownMenuContent>
					</DropdownMenu>
					{showAddButton && (
						<Button variant="outline" size="sm" onClick={onAddClick}>
							<Plus />
							<span className="hidden lg:inline">{addButtonLabel}</span>
						</Button>
					)}
				</div>
			</div>
			<div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
				{tableContent}
				{paginationContent}
			</div>
		</div>
	)
}

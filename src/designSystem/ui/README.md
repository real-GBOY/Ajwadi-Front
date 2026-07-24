# DataTable Component

جدول قابل لإعادة الاستخدام مبني على TanStack Table (React Table).

## الاستخدام الأساسي

```typescript
import { DataTable } from '@/designSystem/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

interface MyData {
   id: number;
   name: string;
   email: string;
}

const columns: ColumnDef<MyData>[] = [
   {
      accessorKey: 'id',
      header: 'ID',
   },
   {
      accessorKey: 'name',
      header: 'الاسم',
   },
   {
      accessorKey: 'email',
      header: 'البريد الإلكتروني',
   },
];

function MyComponent() {
   const data: MyData[] = [
      { id: 1, name: 'أحمد', email: 'ahmed@example.com' },
      { id: 2, name: 'محمد', email: 'mohammed@example.com' },
   ];

   return (
      <DataTable
         columns={columns}
         data={data}
         pageSize={10}
      />
   );
}
```

## Props

### DataTableProps<TData, TValue>

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData, TValue>[]` | required | تعريف الأعمدة |
| `data` | `TData[]` | required | البيانات |
| `pageSize` | `number` | `10` | عدد الصفوف في الصفحة |
| `globalFilter` | `string` | `""` | فلتر عام للبحث |
| `onRowSelectionChange` | `(selectedRows: TData[]) => void` | - | callback عند تغيير الاختيار |
| `enableRowSelection` | `boolean` | `false` | تفعيل اختيار الصفوف |
| `showPagination` | `boolean` | `true` | إظهار Pagination |
| `className` | `string` | - | CSS classes إضافية |
| `translationNamespace` | `string` | `"common"` | namespace للترجمة |
| `renderFloatingBar` | `(selectedCount, selectedRows) => ReactNode` | - | Floating action bar |
| `onRowClick` | `(row: TData) => void` | - | callback عند النقر على الصف |
| `enableRowHover` | `boolean` | `false` | تفعيل hover effect |
| `scrollContainerClassName` | `string` | - | CSS classes لـ scroll container |
| `resetSelectionSignal` | `number` | - | إعادة تعيين الاختيار عند التغيير |
| `manualPagination` | `boolean` | `false` | Pagination يدوي |
| `pageCount` | `number` | - | عدد الصفحات (لـ manual pagination) |
| `pagination` | `{ pageIndex, pageSize }` | - | Pagination state خارجي |
| `onPaginationChange` | `(updater) => void` | - | callback عند تغيير Pagination |
| `isLoading` | `boolean` | `false` | حالة التحميل |

## أمثلة متقدمة

### مع Row Selection

```typescript
const [selectedRows, setSelectedRows] = useState<MyData[]>([]);

<DataTable
   columns={columns}
   data={data}
   enableRowSelection={true}
   onRowSelectionChange={setSelectedRows}
   renderFloatingBar={(count, rows) => (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg">
         تم اختيار {count} صف
      </div>
   )}
/>
```

### مع Manual Pagination

```typescript
const [pagination, setPagination] = useState({
   pageIndex: 0,
   pageSize: 10,
});

const fetchData = async () => {
   const result = await api.get('/data', {
      params: {
         page: pagination.pageIndex + 1,
         limit: pagination.pageSize,
      },
   });
   setData(result.data);
   setPageCount(result.totalPages);
};

<DataTable
   columns={columns}
   data={data}
   manualPagination={true}
   pageCount={pageCount}
   pagination={pagination}
   onPaginationChange={setPagination}
/>
```

### مع Custom Cell Rendering

```typescript
const columns: ColumnDef<MyData>[] = [
   {
      accessorKey: 'status',
      header: 'الحالة',
      cell: ({ row }) => {
         const status = row.getValue('status') as string;
         return (
            <span className={`px-2 py-1 rounded ${
               status === 'نشط' ? 'bg-green-100' : 'bg-gray-100'
            }`}>
               {status}
            </span>
         );
      },
   },
];
```

### مع Row Click Handler

```typescript
<DataTable
   columns={columns}
   data={data}
   onRowClick={(row) => {
      navigate(`/details/${row.id}`);
   }}
   enableRowHover={true}
/>
```

## Table Components

يمكنك أيضاً استخدام مكونات Table الأساسية مباشرة:

```typescript
import {
   Table,
   TableHeader,
   TableBody,
   TableRow,
   TableHead,
   TableCell,
} from '@/designSystem/ui/table';

<Table>
   <TableHeader>
      <TableRow>
         <TableHead>الاسم</TableHead>
         <TableHead>البريد</TableHead>
      </TableRow>
   </TableHeader>
   <TableBody>
      <TableRow>
         <TableCell>أحمد</TableCell>
         <TableCell>ahmed@example.com</TableCell>
      </TableRow>
   </TableBody>
</Table>
```

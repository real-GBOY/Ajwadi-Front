import { useMemo, useState, useEffect, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../designSystem/ui/data-table';
import { Modal } from '../designSystem/ui/modal';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  useListEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from '../hooks/employees/useEmployees';
import { useDebounce } from '../hooks/useDebounce';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../services/employeeService';
import SearchInput from '../designSystem/SearchInput';
import EmployeeForm from '../components/forms/EmployeeForm';

export default function EmployeesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchQuery]);

  const {
    data: employeesData,
    isLoading,
    refetch,
  } = useListEmployees(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchQuery || undefined,
    },
    {
      enabled: true,
    }
  );

  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const data = employeesData?.data || [];
  const pageCount = employeesData?.pagination?.totalPages || 0;

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(async (employee: Employee) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        await deleteEmployeeMutation.mutateAsync(employee.id);
        refetch();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  }, [deleteEmployeeMutation, refetch]);

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSubmit = async (formData: CreateEmployeeRequest | UpdateEmployeeRequest) => {
    try {
      if (selectedEmployee) {
        await updateEmployeeMutation.mutateAsync({
          id: selectedEmployee.id,
          payload: formData as UpdateEmployeeRequest,
        });
      } else {
        await createEmployeeMutation.mutateAsync(formData as CreateEmployeeRequest);
      }
      refetch();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving employee:', error);
      throw error;
    }
  };

  const columns: ColumnDef<Employee>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'اسم الموظف',
        size: 180,
      },
      {
        accessorKey: 'email',
        header: 'البريد الإلكتروني',
        size: 220,
        cell: ({ row }) => (
          <span className="font-english">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'رقم الجوال',
        size: 160,
        cell: ({ row }) => (
          <span className="font-english">{row.original.phone || '-'}</span>
        ),
      },
      {
        accessorKey: 'address',
        header: 'العنوان',
        size: 200,
        cell: ({ row }) => (
          <span className="text-sm text-text-sub">{row.original.address || '-'}</span>
        ),
      },
      {
        accessorKey: 'Role',
        header: 'الدور',
        size: 150,
        cell: ({ row }) => {
          const role = row.original.Role;
          return role ? (
            <span className="text-sm text-text-strong">{role.name}</span>
          ) : (
            <span className="text-text-soft">-</span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        size: 120,
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          const statusMap: Record<string, { label: string; className: string }> = {
            active: { label: 'نشط', className: 'bg-green-100 text-green-800' },
            inactive: { label: 'غير نشط', className: 'bg-gray-100 text-gray-800' },
            suspended: { label: 'معلق', className: 'bg-red-100 text-red-800' },
          };
          const statusInfo = statusMap[status] || { label: status || '-', className: 'bg-gray-100 text-gray-800' };
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'تاريخ الإنشاء',
        size: 180,
        cell: ({ row }) => {
          const date = row.getValue('createdAt') as string;
          if (!date) return <span className="text-text-soft">-</span>;
          try {
            const d = new Date(date);
            return (
              <span>
                {d.toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            );
          } catch {
            return <span>{date}</span>;
          }
        },
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        size: 100,
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <div className="flex items-center gap-2" data-row-click-ignore>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(employee);
                }}
                className="p-1.5 text-text-sub hover:text-primary hover:bg-primary/10 rounded transition-colors"
                title="تعديل">
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(employee);
                }}
                className="p-1.5 text-text-sub hover:text-danger hover:bg-danger/10 rounded transition-colors"
                title="حذف">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [handleDelete]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-strong">
          {t('employees.title', 'الموظفون')}
        </h1>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full sm:w-auto shrink-0">
          <Plus className="w-5 h-5 shrink-0" />
          <span>إضافة موظف</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-border">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ابحث عن موظف..."
            className="w-full max-w-md"
          />
        </div>
        <div className="overflow-x-auto min-w-0">
          <DataTable
            columns={columns}
            data={data}
            pageSize={pagination.pageSize}
            showPagination={true}
            isLoading={isLoading}
            enableRowHover={true}
            pagination={pagination}
            onPaginationChange={setPagination}
            manualPagination={true}
            pageCount={pageCount}
            scrollContainerClassName="max-h-[50vh] sm:max-h-[62vh] min-w-[640px]"
          />
        </div>
      </div>

      {/* Modal - uses more width on mobile for form */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedEmployee ? 'تعديل موظف' : 'إضافة موظف جديد'}
        size="md"
        className="max-w-[95vw] sm:max-w-lg">
        <EmployeeForm
          employee={selectedEmployee}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
        />
      </Modal>
    </div>
  );
}


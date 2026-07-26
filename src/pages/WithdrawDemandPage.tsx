/** @format */

import { useMemo, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../designSystem/ui/data-table';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import SearchInput from '../designSystem/SearchInput';
import { useListWithdrawals, useUpdateWithdrawalStatus } from '../hooks/withdrawals/useWithdrawals';
import { useDebounce } from '../hooks/useDebounce';
import type { Withdrawal, WithdrawalStatus } from '../services/withdrawalService';
import Loader from '../designSystem/Loader';
import SuccessModal from '../designSystem/SuccessModal';

export default function WithdrawDemandPage() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | WithdrawalStatus>('all');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [statusFilter, debouncedSearchQuery]);

  const {
    data: withdrawalsData,
    isLoading,
    refetch,
  } = useListWithdrawals(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      status: statusFilter,
    },
    {
      enabled: true,
    }
  );

  const updateStatusMutation = useUpdateWithdrawalStatus();

  const withdrawals = withdrawalsData?.data || [];
  const pageCount = withdrawalsData?.pagination?.pages || 0;

  const filteredWithdrawals = useMemo(() => {
    if (!debouncedSearchQuery) return withdrawals;
    const q = debouncedSearchQuery.toLowerCase();
    return withdrawals.filter(
      (w) =>
        w.id.toLowerCase().includes(q) ||
        w.userId.toLowerCase().includes(q) ||
        String(w.amount).includes(q)
    );
  }, [withdrawals, debouncedSearchQuery]);

  const getStatusBadge = (status: WithdrawalStatus) => {
    const configMap: Record<
      WithdrawalStatus,
      { icon: typeof Clock; className: string; label: string }
    > = {
      pending: {
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: t('status.processing', 'قيد المعالجة'),
      },
      completed: {
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200',
        label: t('status.completed', 'مكتمل'),
      },
      failed: {
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200',
        label: t('status.failed', 'فشل'),
      },
    };

    const config = configMap[status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.className}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const handleStatusChange = async (withdrawal: Withdrawal, status: WithdrawalStatus) => {
    if (!window.confirm(t('withdrawals.confirmChange', 'هل أنت متأكد من تغيير حالة طلب السحب؟'))) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: withdrawal.id,
        status,
      });
      refetch();
      setSuccessMessage(t('withdrawals.updateSuccess', 'تم تحديث حالة طلب السحب بنجاح'));
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
    }
  };

  const columns: ColumnDef<Withdrawal>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('withdrawals.reqId', 'معرّف الطلب'),
        size: 220,
        cell: ({ row }) => {
          const id = row.getValue('id') as string;
          return (
            <span className="font-mono text-xs text-text-sub">
              {id.slice(0, 8)}...
            </span>
          );
        },
      },
      {
        accessorKey: 'userId',
        header: t('finance.userId', 'معرّف المستخدم'),
        size: 220,
        cell: ({ row }) => {
          const userId = row.getValue('userId') as string;
          return (
            <span className="font-mono text-xs text-text-sub">
              {userId.slice(0, 8)}...
            </span>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: t('labels.amount', 'المبلغ'),
        size: 140,
        cell: ({ row }) => {
          const rawAmount = row.getValue('amount') as number | string;
          const num = Number(rawAmount);
          const display =
            !Number.isFinite(num) ? String(rawAmount ?? '-') : num.toFixed(2);
          return (
            <span className="font-semibold text-text-strong">
              {display} SAR
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: t('labels.status', 'الحالة'),
        size: 140,
        cell: ({ row }) => {
          const status = row.getValue('status') as WithdrawalStatus;
          return getStatusBadge(status);
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('labels.createdAt', 'تاريخ الإنشاء'),
        size: 180,
        cell: ({ row }) => {
          const date = row.getValue('createdAt') as string;
          if (!date) return <span className="text-text-soft">-</span>;
          try {
            const d = new Date(date);
            return (
              <span className="text-sm text-text-sub">
                {d.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
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
        header: t('labels.actions', 'الإجراءات'),
        size: 180,
        cell: ({ row }) => {
          const withdrawal = row.original;
          const isPending = withdrawal.status === 'pending';

          return (
            <div className="flex items-center gap-2" data-row-click-ignore>
              <button
                disabled={!isPending || updateStatusMutation.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(withdrawal, 'completed');
                }}
                className="px-2 py-1 text-xs rounded-lg border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('withdrawals.markCompleted', 'تعيين كمكتمل')}
              </button>
              <button
                disabled={!isPending || updateStatusMutation.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(withdrawal, 'failed');
                }}
                className="px-2 py-1 text-xs rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('withdrawals.markFailed', 'تعيين كفاشل')}
              </button>
            </div>
          );
        },
      },
    ],
    [updateStatusMutation.isPending, i18n.language]
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-text-strong">
          {t('sidebar.withdrawDemand')}
        </h1>
        <div className="flex items-center gap-2 text-sm text-text-sub">
          <span>{t('withdrawals.totalRequests', 'إجمالي الطلبات')}: {filteredWithdrawals.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border">
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('withdrawals.searchPlaceholder', 'ابحث عن طلب سحب...')}
              className="max-w-md"
            />

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-text-strong">
                {t('labels.status', 'الحالة')}:
              </label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | WithdrawalStatus)
                }
                className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">{t('status.all', 'الكل')}</option>
                <option value="pending">{t('status.processing', 'قيد المعالجة')}</option>
                <option value="completed">{t('status.completed', 'مكتمل')}</option>
                <option value="failed">{t('status.failed', 'فشل')}</option>
              </select>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredWithdrawals}
          pageSize={pagination.pageSize}
          showPagination={true}
          isLoading={isLoading}
          enableRowHover={true}
          globalFilter={searchQuery}
          pagination={pagination}
          onPaginationChange={setPagination}
          manualPagination={true}
          pageCount={pageCount}
        />
      </div>

      {/* Success Modal (PATCH actions) */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message={successMessage}
        details={t('actions.successDetails', 'تم تنفيذ العملية بنجاح.')}
      />
    </div>
  );
}


/** @format */

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../designSystem/ui/data-table';
import { useTranslation } from 'react-i18next';
import { ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import SearchInput from '../designSystem/SearchInput';
import { useGetAllTransactions } from '../hooks/wallet/useWallet';
import { useDebounce } from '../hooks/useDebounce';
import type { Transaction } from '../services/walletService';
import Loader from '../designSystem/Loader';

export default function TransactionsPage() {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'TOP_UP' | 'CONTRACT'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'COMPLETED' | 'FAILED'>('all');

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data: transactions = [],
    isLoading,
  } = useGetAllTransactions({
    enabled: true,
  });

  // Filter transactions based on search, type, and status
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Filter by search query (search in ID, userId, amount)
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          (t.userId && t.userId.toLowerCase().includes(query)) ||
          String(t.amount).includes(query)
      );
    }

    return filtered;
  }, [transactions, typeFilter, statusFilter, debouncedSearchQuery]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: t('status.pending', 'قيد الانتظار'),
      },
      COMPLETED: {
        icon: CheckCircle,
        className: 'bg-green-100 text-green-800 border-green-200',
        label: t('status.completed', 'مكتمل'),
      },
      FAILED: {
        icon: XCircle,
        className: 'bg-red-100 text-red-800 border-red-200',
        label: t('status.failed', 'فشل'),
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      TOP_UP: {
        icon: ArrowUpCircle,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        label: t('finance.topUp', 'إيداع'),
      },
      CONTRACT: {
        icon: ArrowDownCircle,
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        label: t('labels.contract', 'عقد'),
      },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.TOP_UP;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const columns: ColumnDef<Transaction>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('finance.txId', 'معرف المعاملة'),
        size: 200,
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
        header: t('finance.userId', 'معرف المستخدم'),
        size: 200,
        cell: ({ row }) => {
          const userId = row.getValue('userId') as string | undefined;
          return userId ? (
            <span className="font-mono text-xs text-text-sub">
              {userId.slice(0, 8)}...
            </span>
          ) : (
            <span className="text-text-soft">-</span>
          );
        },
      },
      {
        accessorKey: 'type',
        header: t('labels.type', 'النوع'),
        size: 120,
        cell: ({ row }) => {
          const type = row.getValue('type') as string;
          return getTypeBadge(type);
        },
      },
      {
        accessorKey: 'amount',
        header: t('labels.amount', 'المبلغ'),
        size: 150,
        cell: ({ row }) => {
          const amount = row.getValue('amount') as number | string;
          const currency = row.original.currency || 'SAR';
          return (
            <span className="font-semibold text-text-strong">
              {typeof amount === 'number' ? amount.toFixed(2) : amount} {currency}
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: t('labels.status', 'الحالة'),
        size: 120,
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
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
        accessorKey: 'updatedAt',
        header: t('labels.updatedAt', 'تاريخ التحديث'),
        size: 180,
        cell: ({ row }) => {
          const date = row.original.updatedAt;
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
    ],
    [i18n.language]
  );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-text-strong">
          {t('sidebar.transactions')}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-sub">
            {t('finance.totalTransactions', 'إجمالي المعاملات')}: {filteredTransactions.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border">
        {/* Filters */}
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('finance.searchTx', 'ابحث عن معاملة...')}
              className="max-w-md"
            />

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-text-strong">{t('labels.type', 'النوع')}:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="all">{t('status.all', 'الكل')}</option>
                <option value="TOP_UP">{t('finance.topUp', 'إيداع')}</option>
                <option value="CONTRACT">{t('labels.contract', 'عقد')}</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-text-strong">{t('labels.status', 'الحالة')}:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="all">{t('status.all', 'الكل')}</option>
                <option value="PENDING">{t('status.pending', 'قيد الانتظار')}</option>
                <option value="COMPLETED">{t('status.completed', 'مكتمل')}</option>
                <option value="FAILED">{t('status.failed', 'فشل')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredTransactions}
          pageSize={10}
          showPagination={true}
          isLoading={isLoading}
          enableRowHover={true}
          globalFilter={searchQuery}
        />
      </div>
    </div>
  );
}

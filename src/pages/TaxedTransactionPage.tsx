/** @format */

import { useMemo, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../designSystem/ui/data-table';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchInput from '../designSystem/SearchInput';
import { useGetTaxableTransactions } from '../hooks/wallet/useWallet';
import { useDebounce } from '../hooks/useDebounce';
import type { Transaction } from '../services/walletService';
import Loader from '../designSystem/Loader';

function formatAmount(raw: number | string, currency = 'SAR'): string {
  const num = Number(raw);
  return Number.isFinite(num) ? `${num.toFixed(2)} ${currency}` : `${raw ?? '-'} ${currency}`;
}

function formatDateShort(dateStr: string, lang = 'ar'): string {
  try {
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function TaxedTransactionPage() {
  const { t, i18n } = useTranslation();
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
    data: transactionsData,
    isLoading,
  } = useGetTaxableTransactions(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    },
    { enabled: true }
  );

  const transactions = transactionsData?.data || [];
  const pageCount = transactionsData?.pagination?.total_pages || 0;

  const filteredTransactions = useMemo(() => {
    if (!debouncedSearchQuery) return transactions;
    const query = debouncedSearchQuery.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.id.toLowerCase().includes(query) ||
        (tx.userId && tx.userId.toLowerCase().includes(query)) ||
        (tx.contractId && tx.contractId.toLowerCase().includes(query)) ||
        String(tx.amount).includes(query) ||
        (tx.description && tx.description.toLowerCase().includes(query))
    );
  }, [transactions, debouncedSearchQuery]);

  const columns: ColumnDef<Transaction>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('finance.txId', 'المعاملة'),
        size: 90,
        cell: ({ row }) => (
          <span className="font-mono text-[11px] sm:text-xs text-text-sub">
            #{String(row.original.id).slice(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: t('labels.amount', 'المبلغ'),
        size: 100,
        cell: ({ row }) => (
          <span className="font-semibold text-text-strong text-xs sm:text-sm">
            {formatAmount(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: t('labels.type', 'النوع'),
        size: 90,
        cell: ({ row }) => {
          const typeStr =
            row.original.type === 'ESCROW_RELEASE'
              ? t('finance.escrowRelease', 'إطلاق الضمان')
              : row.original.type === 'TOP_UP'
              ? t('finance.topUp', 'إيداع')
              : row.original.type === 'CONTRACT'
              ? t('labels.contract', 'عقد')
              : row.original.type;
          return (
            <span className="text-[11px] sm:text-sm text-text-sub">
              {typeStr}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('labels.date', 'التاريخ'),
        size: 100,
        cell: ({ row }) => {
          const date = row.original.createdAt;
          if (!date) return <span className="text-text-soft">-</span>;
          return (
            <span className="text-[11px] sm:text-sm text-text-sub whitespace-nowrap">
              {formatDateShort(date, i18n.language)}
            </span>
          );
        },
      },
    ],
    [i18n.language]
  );

  const currentPage = pagination.pageIndex + 1;

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex justify-center items-center min-h-[200px]">
        <Loader label={t('loading.general', 'جاري التحميل...')} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
      {/* Header - mobile first: stack then row */}
      <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">
        <div className="flex items-start gap-3 min-w-0">
          <Receipt className="w-7 h-7 sm:w-8 sm:h-8 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-semibold text-text-strong">
              {t('sidebar.taxedTransaction')}
            </h1>
            <p className="text-xs sm:text-sm text-text-sub mt-1">
              {t('finance.taxedSubtitle', 'المعاملات المكتملة الخاضعة للضريبة')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs sm:text-sm text-text-sub">
            {t('finance.totalTransactions', 'إجمالي المعاملات')}: {filteredTransactions.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {/* Filters */}
        <div className="p-3 sm:p-4 border-b border-border space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('finance.searchTx', 'ابحث عن معاملة...')}
              className="w-full sm:max-w-md"
            />
            <div className="flex items-center gap-2 px-3 py-2 sm:py-1.5 bg-green-50 border border-green-200 rounded-lg text-center sm:text-start">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-green-800">
                {t('finance.allTaxedCompleted', 'جميع المعاملات مكتملة وقابلة للضريبة')}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile: card list */}
        <div className="md:hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-6 text-center text-text-sub text-sm">
              {t('table.noResults', 'لا توجد نتائج')}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filteredTransactions.map((tx) => (
                <li key={tx.id} className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-text-strong text-sm">
                        {formatAmount(tx.amount, tx.currency)}
                      </span>
                      <span className="text-[11px] text-text-sub font-mono">
                        #{String(tx.id).slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-sub">
                      <span>
                        {tx.type === 'ESCROW_RELEASE'
                          ? t('finance.escrowRelease', 'إطلاق الضمان')
                          : tx.type === 'TOP_UP'
                          ? t('finance.topUp', 'إيداع')
                          : tx.type === 'CONTRACT'
                          ? t('labels.contract', 'عقد')
                          : TYPE_LABELS[tx.type] || tx.type}
                      </span>
                      <span className="whitespace-nowrap">
                        {tx.createdAt ? formatDateShort(tx.createdAt, i18n.language) : '-'}
                      </span>
                    </div>
                    {tx.description && (
                      <p className="text-xs text-text-soft line-clamp-2 mt-0.5">
                        {tx.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-3 py-3 px-3 border-t border-border">
              <span className="text-xs text-text-sub">
                {t('pagination.page', 'صفحة')} {currentPage} {t('pagination.of', 'من')} {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))}
                disabled={pagination.pageIndex === 0}
                className="p-2 rounded-lg text-text-sub hover:bg-bg-weak disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 rtl:rotate-180 ltr:rotate-0" />
              </button>
              <button
                type="button"
                onClick={() => setPagination((p) => ({ ...p, pageIndex: Math.min(pageCount - 1, p.pageIndex + 1) }))}
                disabled={pagination.pageIndex >= pageCount - 1}
                className="p-2 rounded-lg text-text-sub hover:bg-bg-weak disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 rtl:rotate-180 ltr:rotate-0" />
              </button>
            </div>
          )}
        </div>

        {/* Tablet/Desktop: table (mobile-first compact columns) */}
        <div className="hidden md:block overflow-x-auto min-w-0">
          <DataTable
            columns={columns}
            data={filteredTransactions}
            pageSize={pagination.pageSize}
            showPagination={true}
            isLoading={false}
            enableRowHover={true}
            pagination={pagination}
            onPaginationChange={setPagination}
            manualPagination={true}
            pageCount={pageCount}
            scrollContainerClassName="max-h-[50vh] sm:max-h-[62vh]"
          />
        </div>
      </div>
    </div>
  );
}

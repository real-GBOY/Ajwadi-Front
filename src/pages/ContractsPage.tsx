import { useState, useEffect } from 'react';
import SearchInput from '../designSystem/SearchInput';
import { useListContracts } from '../hooks/contracts/useContracts';
import Loader from '../designSystem/Loader';
import ContractCard from '../components/ContractCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ContractsPage() {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const {
    data: contractsData,
    isLoading,
  } = useListContracts(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'DESC',
    },
    {
      enabled: true,
    }
  );

  const data = contractsData?.data || [];
  const pageCount = contractsData?.pagination?.totalPages || 0;
  const totalItems = contractsData?.pagination?.totalItems || 0;

  const handlePreviousPage = () => {
    if (pagination.pageIndex > 0) {
      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.pageIndex < pageCount - 1) {
      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-strong">{t('sidebar.contracts', 'العقود')}</h1>
        <p className="text-sm text-text-sub mt-1">{t('pages.contracts.subtitle', 'عرض وإدارة عقود المشاريع')}</p>
      </header>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-sub whitespace-nowrap">{t('actions.sortBy', 'ترتيب حسب')}:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="createdAt">{t('labels.createdAt', 'تاريخ الإنشاء')}</option>
              <option value="value">{t('labels.amount', 'القيمة')}</option>
              <option value="duration">{t('labels.duration', 'المدة')}</option>
              <option value="status">{t('labels.status', 'الحالة')}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-sub whitespace-nowrap">{t('actions.sortOrder', 'الاتجاه')}:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC')}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="DESC">{t('actions.descending', 'تنازلي')}</option>
              <option value="ASC">{t('actions.ascending', 'تصاعدي')}</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader label={t('loading.general', 'جاري التحميل...')} />
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {data.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-text-sub">
                  {t('pagination.showing', 'عرض')} {pagination.pageIndex * pagination.pageSize + 1} -{' '}
                  {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)} {t('pagination.of', 'من')} {totalItems}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={pagination.pageIndex === 0}
                    className="p-2 rounded-lg border border-border bg-background hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="w-5 h-5 text-text-sub rtl:rotate-0 ltr:rotate-180" />
                  </button>
                  <span className="text-sm text-text-strong px-3">
                    {t('pagination.page', 'صفحة')} {pagination.pageIndex + 1} {t('pagination.of', 'من')} {pageCount}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.pageIndex >= pageCount - 1}
                    className="p-2 rounded-lg border border-border bg-background hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-5 h-5 text-text-sub rtl:rotate-0 ltr:rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 px-6 text-center">
            <p className="text-text-sub text-sm">{t('table.noResults', 'لا توجد عقود')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

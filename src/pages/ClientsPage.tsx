import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useListUsers } from '../hooks/users/useUsers';
import { useDebounce } from '../hooks/useDebounce';
import type { User } from '../services/userService';
import SearchInput from '../designSystem/SearchInput';
import UserCard from '../components/UserCard';
import Loader from '../designSystem/Loader';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ClientsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchQuery]);

  const {
    data: usersData,
    isLoading,
  } = useListUsers(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchQuery || undefined,
      mode: 'client', // Filter by client mode
    },
    {
      enabled: true,
    }
  );

  const data = usersData?.data || [];
  const pageCount = usersData?.pagination?.totalPages || 0;
  const totalItems = usersData?.pagination?.total || 0;

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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-text-strong">
          {t('sidebar.clients', 'العملاء')}
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ابحث عن عميل..."
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {data.map((user: User) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    viewPath={`/users/clients/${user.id}`}
                  />
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-between">
                <div className="text-sm text-text-sub">
                  عرض {pagination.pageIndex * pagination.pageSize + 1} -{' '}
                  {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)} من{' '}
                  {totalItems}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={pagination.pageIndex === 0}
                    className="p-2 rounded-lg border border-border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-text-strong px-3">
                    {pagination.pageIndex + 1} / {pageCount}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.pageIndex >= pageCount - 1}
                    className="p-2 rounded-lg border border-border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-text-sub">لا توجد عملاء</p>
          </div>
        )}
      </div>
    </div>
  );
}

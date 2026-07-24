import { useState, useEffect } from 'react';
import {
  useListComplaints,
  useGetComplaintsCount,
  useMarkComplaintAsRead,
  useResolveComplaint,
  usePinComplaint,
  useUnpinComplaint,
} from '../hooks/complaints/useComplaints';
import Loader from '../designSystem/Loader';
import ComplaintCard from '../components/ComplaintCard';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function ProjectsComplainPage() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | ''>('');
  const [readFilter, setReadFilter] = useState<boolean | ''>('');
  const [pinnedFilter, setPinnedFilter] = useState<boolean | ''>('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });

  // Reset to first page when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [statusFilter, readFilter, pinnedFilter]);

  const {
    data: complaintsData,
    isLoading,
  } = useListComplaints(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      status: statusFilter || undefined,
      read: readFilter !== '' ? (readFilter as boolean) : undefined,
      pinned: pinnedFilter !== '' ? (pinnedFilter as boolean) : undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    },
    {
      enabled: true,
    }
  );

  const { data: countData } = useGetComplaintsCount({
    status: statusFilter || undefined,
    read: readFilter !== '' ? (readFilter as boolean) : undefined,
    pinned: pinnedFilter !== '' ? (pinnedFilter as boolean) : undefined,
  });

  const markAsRead = useMarkComplaintAsRead();
  const resolve = useResolveComplaint();
  const pin = usePinComplaint();
  const unpin = useUnpinComplaint();

  const data = complaintsData?.data || [];
  const pageCount = complaintsData?.pagination?.totalPages || 0;
  const totalItems = complaintsData?.pagination?.totalItems || countData?.data?.count || 0;

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
        <div>
          <h1 className="text-3xl font-semibold text-text-strong mb-2">شكاوى المشاريع</h1>
          <p className="text-sm text-text-sub">
            إجمالي الشكاوى: <span className="font-semibold text-text-strong">{totalItems}</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border">
        {/* Filters */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-sub" />
              <label className="text-sm text-text-sub whitespace-nowrap">الحالة:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'pending' | 'resolved' | '')}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">الكل</option>
                <option value="pending">قيد المراجعة</option>
                <option value="resolved">محلول</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-text-sub whitespace-nowrap">مقروء:</label>
              <select
                value={readFilter === '' ? '' : readFilter ? 'true' : 'false'}
                onChange={(e) =>
                  setReadFilter(e.target.value === '' ? '' : e.target.value === 'true')
                }
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">الكل</option>
                <option value="true">مقروء</option>
                <option value="false">غير مقروء</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-text-sub whitespace-nowrap">مثبت:</label>
              <select
                value={pinnedFilter === '' ? '' : pinnedFilter ? 'true' : 'false'}
                onChange={(e) =>
                  setPinnedFilter(e.target.value === '' ? '' : e.target.value === 'true')
                }
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="">الكل</option>
                <option value="true">مثبت</option>
                <option value="false">غير مثبت</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((complaint) => (
                  <ComplaintCard key={complaint.id} complaint={complaint} />
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
                    className="p-2 rounded-lg border border-border bg-background hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronRight className="w-5 h-5 text-text-sub" />
                  </button>
                  <span className="text-sm text-text-strong px-3">
                    صفحة {pagination.pageIndex + 1} من {pageCount}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.pageIndex >= pageCount - 1}
                    className="p-2 rounded-lg border border-border bg-background hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ChevronLeft className="w-5 h-5 text-text-sub" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-text-sub">لا توجد شكاوى</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import SearchInput from '../designSystem/SearchInput';
import { useListProjects } from '../hooks/projects/useProjects';
import { useDebounce } from '../hooks/useDebounce';
import Loader from '../designSystem/Loader';
import ProjectCard from '../components/ProjectCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });

  // Debounce search query for server-side search
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Reset to first page when search or status filter changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearchQuery, statusFilter]);

  const {
    data: projectsData,
    isLoading,
  } = useListProjects(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchQuery || undefined,
      status: statusFilter || undefined,
    },
    {
      enabled: true,
    }
  );

  const data = projectsData?.data || [];
  const pageCount = projectsData?.pagination?.totalPages || 0;
  const totalItems = projectsData?.pagination?.total || 0;

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
    <div className="p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text-strong">المشاريع</h1>
        <p className="text-sm text-text-sub mt-1">تصفح وإدارة المشاريع</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        {/* Filters - responsive */}
        <div className="p-4 sm:p-5 border-b border-gray-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="ابحث عن مشروع..."
                className="w-full max-w-md"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-sm text-text-sub whitespace-nowrap">الحالة:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50 text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow">
                <option value="">الكل</option>
                <option value="openforbids">مفتوح للعروض</option>
                <option value="closedforbids">مغلق للعروض</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
                <option value="closed">مغلق</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <Loader label="جاري التحميل..." />
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {data.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>

            {pageCount > 1 && (
              <div className="px-4 sm:px-5 py-4 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-text-sub order-2 sm:order-1">
                  عرض {pagination.pageIndex * pagination.pageSize + 1} –{' '}
                  {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalItems)} من {totalItems}
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={pagination.pageIndex === 0}
                    className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                    <ChevronRight className="w-5 h-5 text-text-sub" />
                  </button>
                  <span className="text-sm font-medium text-text-strong px-3 min-w-[6rem] text-center">
                    صفحة {pagination.pageIndex + 1} من {pageCount}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.pageIndex >= pageCount - 1}
                    className="p-2.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                    <ChevronLeft className="w-5 h-5 text-text-sub" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 px-6 text-center">
            <p className="text-text-sub text-sm">لا توجد مشاريع</p>
            <p className="text-text-soft text-xs mt-1">غيّر البحث أو الحالة للمحاولة مرة أخرى</p>
          </div>
        )}
      </div>
    </div>
  );
}

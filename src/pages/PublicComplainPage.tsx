/** @format */

import { useEffect, useMemo, useState } from 'react';
import { useListReports, useUpdateReport } from '@/hooks/reports/useReports';
import type { Report, ReportStatus } from '@/services/reportService';
import Loader from '@/designSystem/Loader';
import { ChevronLeft, ChevronRight, Filter, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function PublicComplainPage() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 12,
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [statusFilter, search]);

  const {
    data: reportsData,
    isLoading,
  } = useListReports(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      status: statusFilter,
      projectId: 'null', // only general reports (no project)
    },
    {
      enabled: true,
    }
  );

  const updateReport = useUpdateReport();

  const reports: Report[] = reportsData?.data || [];
  const pageCount = reportsData?.pagination?.pages || 0;
  const totalItems = reportsData?.pagination?.total || reports.length || 0;

  const filteredReports = useMemo(() => {
    if (!search) return reports;
    const q = search.toLowerCase();
    return reports.filter((r) => {
      return (
        r.id.toLowerCase().includes(q) ||
        r.userId.toLowerCase().includes(q) ||
        (r.details || '').toLowerCase().includes(q) ||
        (r.reasons || []).join(',').toLowerCase().includes(q)
      );
    });
  }, [reports, search]);

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

  const getStatusBadge = (status: ReportStatus) => {
    const config: Record<ReportStatus, { label: string; className: string; Icon: any }> = {
      open: {
        label: 'مفتوحة',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        Icon: Clock,
      },
      reviewed: {
        label: 'قيد المراجعة',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        Icon: AlertCircle,
      },
      resolved: {
        label: 'محلولة',
        className: 'bg-green-100 text-green-800 border-green-200',
        Icon: CheckCircle,
      },
    };

    const { label, className, Icon } = config[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${className}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  const handleStatusChange = async (report: Report, status: ReportStatus) => {
    if (!window.confirm('هل أنت متأكد من تغيير حالة الشكوى؟')) return;
    try {
      await updateReport.mutateAsync({
        id: report.id,
        payload: { status },
      });
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-text-strong mb-2">شكاوى عامة</h1>
          <p className="text-sm text-text-sub">
            إجمالي الشكاوى: <span className="font-semibold text-text-strong">{totalItems}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الشكاوى..."
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[220px]"
          />
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
                onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">الكل</option>
                <option value="open">مفتوحة</option>
                <option value="reviewed">قيد المراجعة</option>
                <option value="resolved">محلولة</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : filteredReports.length > 0 ? (
          <>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-lg border border-border p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text-strong mb-1">
                          شكوى عامة #{report.id.slice(0, 8)}
                        </h3>
                        <p className="text-xs text-text-sub font-english">
                          User: {report.userId.slice(0, 8)}
                        </p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>

                    {report.reasons && report.reasons.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-text-sub mb-1">الأسباب:</p>
                        <div className="flex flex-wrap gap-1">
                          {report.reasons.map((reason) => (
                            <span
                              key={reason}
                              className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-text-sub"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.details && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-text-sub line-clamp-3">{report.details}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-text-sub">
                        {new Date(report.createdAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={updateReport.isPending}
                          onClick={() => handleStatusChange(report, 'reviewed')}
                          className="px-2 py-1 text-xs rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          تعليم كـ قيد المراجعة
                        </button>
                        <button
                          disabled={updateReport.isPending}
                          onClick={() => handleStatusChange(report, 'resolved')}
                          className="px-2 py-1 text-xs rounded-lg border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          تعليم كمحلولة
                        </button>
                      </div>
                    </div>
                  </div>
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
                    className="p-2 rounded-lg border border-border bg-background hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-text-sub" />
                  </button>
                  <span className="text-sm text-text-strong px-3">
                    صفحة {pagination.pageIndex + 1} من {pageCount}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.pageIndex >= pageCount - 1}
                    className="p-2 rounded-lg border border-border bg-background hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-text-sub" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-text-sub">لا توجد شكاوى عامة</p>
          </div>
        )}
      </div>
    </div>
  );
}


/** @format */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useListVerificationDemands } from '@/hooks/demands/useDemands';
import { Eye, User, Phone, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VerificationDemand } from '@/services/demandService';
import SearchInput from '@/designSystem/SearchInput';
import { useDebounce } from '@/hooks/useDebounce';

export default function IdentityPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const limit = 12;

  const { data: verificationData, isLoading: isLoadingVerification } = useListVerificationDemands({
    page,
    limit,
    search: debouncedSearch || undefined,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleViewUser = (userId: string, mode: 'freelancer' | 'client') => {
    if (mode === 'freelancer') {
      navigate(`/users/freelancers/${userId}`);
    } else {
      navigate(`/users/clients/${userId}`);
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الهوية</h1>
        <p className="text-gray-600">إدارة طلبات التحقق للمستخدمين</p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1); // Reset to first page on search
          }}
          placeholder="البحث بالاسم..."
        />
      </div>

      {/* Verification Demands Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">المستخدمون قيد المراجعة</h2>
          <span className="text-sm text-gray-500">
            {verificationData?.pagination.totalItems || 0} طلب
          </span>
        </div>

        {isLoadingVerification ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-20 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : verificationData?.data && verificationData.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {verificationData.data.map((demand: VerificationDemand) => (
                <div
                  key={demand.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {demand.profilePictureFile?.url ? (
                      <img
                        src={demand.profilePictureFile.url}
                        alt={demand.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">
                          {getInitials(demand.name)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{demand.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {demand.phone}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">النوع:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          demand.mode === 'freelancer'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {demand.mode === 'freelancer' ? 'مستقل' : 'عميل'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">التاريخ:</span>
                      <span className="text-xs text-gray-700">{formatDate(demand.createdAt)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewUser(demand.id, demand.mode)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>عرض التفاصيل</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {verificationData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!verificationData.pagination.hasPreviousPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  السابق
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  صفحة {verificationData.pagination.currentPage} من{' '}
                  {verificationData.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!verificationData.pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد طلبات تحقق</p>
          </div>
        )}
      </div>
    </div>
  );
}

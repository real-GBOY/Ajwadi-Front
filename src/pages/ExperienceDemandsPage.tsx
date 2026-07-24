/** @format */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useListExperienceDemands,
  useApproveExperienceDemand,
  useRejectExperienceDemand,
  useGetExperienceDemandsCount,
} from '@/hooks/experienceDemands/useExperienceDemands';
import { Eye, FileText, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ExperienceDemand } from '@/services/experienceDemandService';
import SearchInput from '@/designSystem/SearchInput';
import { useDebounce } from '@/hooks/useDebounce';
import { generateAndUploadCertificate } from '@/services/certificateService';
import CertificateModal, { type CertificateData } from '@/components/CertificateModal';
import SuccessModal from '@/designSystem/SuccessModal';

export default function ExperienceDemandsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');
  const [underReviewFilter, setUnderReviewFilter] = useState<'all' | 'true' | 'false'>('all');
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [currentDemandId, setCurrentDemandId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const limit = 12;

  const { data: experienceData, isLoading: isLoadingExperience } = useListExperienceDemands({
    page,
    limit,
    isUnderReview: underReviewFilter === 'all' ? undefined : underReviewFilter === 'true',
    reviewStatus:
      reviewStatusFilter === 'all' ? undefined : (reviewStatusFilter as 'pending' | 'approved' | 'rejected'),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: underReviewCount } = useGetExperienceDemandsCount({
    isUnderReview: true,
  });

  const approveMutation = useApproveExperienceDemand();
  const rejectMutation = useRejectExperienceDemand();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (demand: ExperienceDemand) => {
    if (demand.isUnderReview) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          قيد المراجعة
        </span>
      );
    }

    switch (demand.reviewStatus) {
      case 'approved':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            معتمد
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            مرفوض
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            معلق
          </span>
        );
    }
  };

  const handleApprove = async (demand: ExperienceDemand) => {
    if (demand.user?.name) {
      // Open certificate modal first with detailed information
      setCertificateData({
        userName: demand.user.name,
        issueDate: new Date().toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        certificateNumber: `EXP-${demand.id.substring(0, 8).toUpperCase()}`,
        description: 'تم منح هذه الشهادة تقديراً للخبرة والمهارات المتميزة في مجال العمل الحر',
        achievements: [
          'إثبات الخبرة المهنية في المجال المطلوب',
          'الالتزام بمعايير الجودة والاحترافية',
          'المساهمة الفعالة في تطوير المشاريع',
        ],
        organizationName: 'أجودي',
      });
      setCurrentDemandId(demand.id);
      setIsCertificateModalOpen(true);
    } else {
      alert('لا يمكن إنشاء الشهادة: اسم المستخدم غير متوفر');
    }
  };

  const handleCertificatePrint = async () => {
    if (!certificateData || !currentDemandId) return;

    try {
      setIsGenerating(true);
      
      // Wait a bit for the DOM to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate and upload certificate
      await generateAndUploadCertificate({
        userName: certificateData.userName,
        experienceName: certificateData.description || 'Experience Certificate',
        experienceDemandId: currentDemandId,
        sealImage: certificateData.sealImage,
        signatureImage: certificateData.signatureImage,
        issueDate: certificateData.issueDate,
        organizationName: certificateData.organizationName || 'أجودي',
        signerName: 'مدير المنصة', // Default signer name
      });

      // Approve the demand
      await approveMutation.mutateAsync({ id: currentDemandId, payload: {} });

      // Close modal and show success
      setIsCertificateModalOpen(false);
      setCertificateData(null);
      setCurrentDemandId(null);
      setSuccessMessage('تم إنشاء الشهادة والموافقة على الطلب بنجاح');
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      alert('فشل في إنشاء الشهادة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('يرجى إدخال سبب الرفض:');
    if (reason) {
      try {
        await rejectMutation.mutateAsync({ id, payload: { reviewNote: reason } });
        setSuccessMessage('تم رفض طلب الخبرة بنجاح');
        setSuccessModalOpen(true);
      } catch (error) {
        console.error('Failed to reject:', error);
      }
    }
  };

  const handleViewUser = (userId: string) => {
    navigate(`/users/freelancers/${userId}`);
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">طلبات الخبرة</h1>
        <p className="text-gray-600">إدارة طلبات إثبات الخبرة للمستخدمين</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="max-w-md flex-1 min-w-[200px]">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="البحث بالاسم..."
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">حالة المراجعة:</label>
          <select
            value={reviewStatusFilter}
            onChange={(e) => {
              setReviewStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">الكل</option>
            <option value="pending">معلق</option>
            <option value="approved">معتمد</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">قيد المراجعة:</label>
          <select
            value={underReviewFilter}
            onChange={(e) => {
              setUnderReviewFilter(e.target.value as 'all' | 'true' | 'false');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">الكل</option>
            <option value="true">نعم</option>
            <option value="false">لا</option>
          </select>
        </div>
      </div>

      {/* Experience Demands Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">طلبات الخبرة</h2>
          <div className="flex items-center gap-4">
            {underReviewCount !== undefined && (
              <span className="text-sm text-gray-500">
                قيد المراجعة: <span className="font-semibold">{underReviewCount}</span>
              </span>
            )}
            <span className="text-sm text-gray-500">
              {experienceData?.pagination.totalItems || 0} طلب
            </span>
          </div>
        </div>

        {isLoadingExperience ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-20 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : experienceData?.data && experienceData.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {experienceData.data.map((demand: ExperienceDemand) => (
                <div
                  key={demand.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {demand.user?.profilePicture ? (
                      <img
                        src={demand.user.profilePicture}
                        alt={demand.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {demand.user?.name || 'مستخدم غير معروف'}
                      </h3>
                      <p className="text-sm text-gray-500">{demand.user?.phone || ''}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">الحالة:</span>
                      {getStatusBadge(demand)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">التاريخ:</span>
                      <span className="text-xs text-gray-700">{formatDate(demand.createdAt)}</span>
                    </div>
                    {demand.exFile && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FileText className="w-3 h-3" />
                        <span className="truncate">{demand.exFile.fileName}</span>
                      </div>
                    )}
                  </div>

                  {demand.exFile?.url && (
                    <div className="mb-3">
                      <a
                        href={demand.exFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={demand.exFile.url}
                          alt="شهادة الخبرة"
                          className="w-full h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
                        />
                      </a>
                    </div>
                  )}

                  {demand.reviewNote && (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <strong>ملاحظة:</strong> {demand.reviewNote}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    {demand.user && (
                      <button
                        onClick={() => handleViewUser(demand.userId)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>عرض المستخدم</span>
                      </button>
                    )}
                    {demand.isUnderReview && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(demand)}
                          disabled={approveMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>موافقة</span>
                        </button>
                        <button
                          onClick={() => handleReject(demand.id)}
                          disabled={rejectMutation.isPending}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>رفض</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {experienceData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!experienceData.pagination.hasPreviousPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  السابق
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  صفحة {experienceData.pagination.currentPage} من{' '}
                  {experienceData.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!experienceData.pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد طلبات خبرة</p>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {certificateData && (
        <CertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => {
            setIsCertificateModalOpen(false);
            setCertificateData(null);
            setCurrentDemandId(null);
          }}
          data={certificateData}
          onPrint={handleCertificatePrint}
          isGenerating={isGenerating}
        />
      )}

      {/* Success Modal (PATCH actions) */}
      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message={successMessage}
        details="تم تنفيذ العملية بنجاح."
      />
    </div>
  );
}

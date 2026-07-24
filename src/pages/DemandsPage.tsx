/** @format */

import { useState } from 'react';
import {
  useListTagAttachmentDemands,
  useAcceptTagAttachment,
  useRejectTagAttachment,
} from '@/hooks/demands/useDemands';
import { Eye, Tag, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TagAttachmentDemand } from '@/services/demandService';
import SuccessModal from '@/designSystem/SuccessModal';

export default function DemandsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 12;
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { data: tagAttachmentData, isLoading: isLoadingTagAttachments } = useListTagAttachmentDemands({
    page,
    limit,
  });

  const acceptMutation = useAcceptTagAttachment();
  const rejectMutation = useRejectTagAttachment();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAccept = async (demand: TagAttachmentDemand) => {
    try {
      await acceptMutation.mutateAsync(demand.id);
      setSuccessMessage(`تم قبول طلب مرفق العلامة "${demand.tagData?.name || 'غير معروف'}" بنجاح`);
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Error accepting tag attachment:', error);
      alert('حدث خطأ أثناء قبول الطلب');
    }
  };

  const handleReject = async (demand: TagAttachmentDemand) => {
    const rejectionReason = prompt('يرجى إدخال سبب الرفض:');
    if (!rejectionReason || rejectionReason.trim() === '') {
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: demand.id,
        rejectionReason: rejectionReason.trim(),
      });
      setSuccessMessage(`تم رفض طلب مرفق العلامة "${demand.tagData?.name || 'غير معروف'}" بنجاح`);
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Error rejecting tag attachment:', error);
      alert('حدث خطأ أثناء رفض الطلب');
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الطلبات</h1>
        <p className="text-gray-600">إدارة طلبات مرفقات العلامات</p>
      </div>

      {/* Tag Attachment Demands Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">طلبات مرفقات العلامات</h2>
          <span className="text-sm text-gray-500">
            {tagAttachmentData?.pagination.totalItems || 0} طلب
          </span>
        </div>

        {isLoadingTagAttachments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-20 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : tagAttachmentData?.data && tagAttachmentData.data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tagAttachmentData.data.map((demand: TagAttachmentDemand) => (
                <div
                  key={demand.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {demand.tagData?.badgeUrl ? (
                      <img
                        src={demand.tagData.badgeUrl}
                        alt={demand.tagData.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Tag className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {demand.tagData?.name || 'علامة غير معروفة'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {demand.userData?.name || 'مستخدم غير معروف'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">الحالة:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          demand.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : demand.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {demand.status === 'pending'
                          ? 'قيد المراجعة'
                          : demand.status === 'accepted'
                          ? 'مقبول'
                          : 'مرفوض'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">التاريخ:</span>
                      <span className="text-xs text-gray-700">{formatDate(demand.createdAt)}</span>
                    </div>
                  </div>

                  {demand.fileUrl && (
                    <div className="mb-3">
                      <img
                        src={demand.fileUrl}
                        alt="مرفق"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {demand.status === 'pending' && (
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => handleAccept(demand)}
                        disabled={acceptMutation.isPending || rejectMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>قبول</span>
                      </button>
                      <button
                        onClick={() => handleReject(demand)}
                        disabled={acceptMutation.isPending || rejectMutation.isPending}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (demand.userData) {
                        navigate(`/users/freelancers/${demand.userId}`);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>عرض التفاصيل</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {tagAttachmentData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!tagAttachmentData.pagination.hasPreviousPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  السابق
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  صفحة {tagAttachmentData.pagination.currentPage} من{' '}
                  {tagAttachmentData.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!tagAttachmentData.pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد طلبات مرفقات علامات</p>
          </div>
        )}
      </div>

      <SuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message={successMessage}
      />
    </div>
  );
}

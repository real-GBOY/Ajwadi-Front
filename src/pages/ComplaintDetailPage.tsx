import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetComplaintById,
  useMarkComplaintAsRead,
  useMarkComplaintAsUnread,
  useResolveComplaint,
  usePinComplaint,
  useUnpinComplaint,
  useUpdateComplaint,
  useDeleteComplaint,
} from '../hooks/complaints/useComplaints';
import {
  ArrowLeft,
  Pin,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Users,
  Calendar,
  Eye,
  EyeOff,
  Trash2,
  MessageCircle,
} from 'lucide-react';
import Loader from '../designSystem/Loader';
import ComplaintChat from '../components/ComplaintChat';

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: complaintData, isLoading } = useGetComplaintById(id || null);
  const complaint = complaintData?.data;

  const markAsRead = useMarkComplaintAsRead();
  const markAsUnread = useMarkComplaintAsUnread();
  const resolve = useResolveComplaint();
  const pin = usePinComplaint();
  const unpin = useUnpinComplaint();
  const update = useUpdateComplaint();
  const deleteComplaint = useDeleteComplaint();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleMarkAsRead = () => {
    if (id && !complaint?.read) {
      markAsRead.mutate(id);
    }
  };

  const handleMarkAsUnread = () => {
    if (id && complaint?.read) {
      markAsUnread.mutate(id);
    }
  };

  const handleResolve = () => {
    if (id && complaint?.status === 'pending') {
      resolve.mutate(id);
    }
  };

  const handlePin = () => {
    if (id && !complaint?.pinned) {
      pin.mutate(id);
    }
  };

  const handleUnpin = () => {
    if (id && complaint?.pinned) {
      unpin.mutate(id);
    }
  };

  const handleDelete = async () => {
    if (id && window.confirm('هل أنت متأكد من حذف هذه الشكوى؟')) {
      setIsDeleting(true);
      try {
        await deleteComplaint.mutateAsync(id);
        navigate('/complain/projects');
      } catch (error) {
        console.error('Error deleting complaint:', error);
        setIsDeleting(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'resolved') {
      return (
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
          style={{
            backgroundColor: 'var(--c-badge-success-bg)',
            color: 'var(--c-badge-success-text)',
            borderColor: 'var(--c-badge-success-border)',
          }}>
          <CheckCircle className="w-3 h-3 mr-1" />
          محلول
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
        style={{
          backgroundColor: 'var(--c-badge-warning-bg)',
          color: 'var(--c-badge-warning-text)',
          borderColor: 'var(--c-badge-warning-border)',
        }}>
        <Clock className="w-3 h-3 mr-1" />
        قيد المراجعة
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate('/complain/projects')}
          className="flex items-center gap-2 text-text-sub hover:text-text-strong mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>العودة إلى الشكاوى</span>
        </button>
        <div className="bg-white rounded-lg border border-border p-12 text-center">
          <p className="text-text-sub">الشكوى غير موجودة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/complain/projects')}
        className="flex items-center gap-2 text-text-sub hover:text-text-strong mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>العودة إلى الشكاوى</span>
      </button>

      {/* Complaint Header */}
      <div className="bg-white rounded-lg border border-border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {complaint.pinned && (
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Pin className="w-5 h-5 text-primary fill-primary" />
                </div>
              )}
              {!complaint.read && (
                <div className="w-3 h-3 bg-primary rounded-full"></div>
              )}
              <h1 className="text-2xl font-semibold text-text-strong">
                شكوى #{complaint.id.slice(0, 8)}
              </h1>
              {getStatusBadge(complaint.status)}
            </div>
            {complaint.resonsummary && (
              <p className="text-base text-text-strong mb-2">{complaint.resonsummary}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-border">
          <button
            onClick={() => setShowChat(!showChat)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{
              backgroundColor: 'var(--c-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--c-primary-dark)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--c-primary)';
            }}>
            <MessageCircle className="w-4 h-4" />
            <span>{showChat ? 'إخفاء المحادثة' : 'بدء محادثة حول الشكوى'}</span>
          </button>

          {complaint.read ? (
            <button
              onClick={handleMarkAsUnread}
              disabled={markAsUnread.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-gray-50 transition-colors disabled:opacity-50">
              <EyeOff className="w-4 h-4" />
              <span>وضع علامة غير مقروء</span>
            </button>
          ) : (
            <button
              onClick={handleMarkAsRead}
              disabled={markAsRead.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--c-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--c-primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--c-primary)';
              }}>
              <Eye className="w-4 h-4" />
              <span>وضع علامة مقروء</span>
            </button>
          )}

          {complaint.pinned ? (
            <button
              onClick={handleUnpin}
              disabled={unpin.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-gray-50 transition-colors disabled:opacity-50">
              <Pin className="w-4 h-4" />
              <span>إلغاء التثبيت</span>
            </button>
          ) : (
            <button
              onClick={handlePin}
              disabled={pin.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-gray-50 transition-colors disabled:opacity-50">
              <Pin className="w-4 h-4" />
              <span>تثبيت</span>
            </button>
          )}

          {complaint.status === 'pending' && (
            <button
              onClick={handleResolve}
              disabled={resolve.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--c-success)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}>
              <CheckCircle className="w-4 h-4" />
              <span>حل الشكوى</span>
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={isDeleting || deleteComplaint.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ml-auto"
            style={{
              backgroundColor: 'var(--c-error)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}>
            <Trash2 className="w-4 h-4" />
            <span>حذف</span>
          </button>
        </div>
      </div>

      {/* Complaint Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reason */}
          {complaint.reason && (
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-text-strong">سبب الشكوى</h2>
              </div>
              <p className="text-sm text-text-strong leading-relaxed whitespace-pre-wrap">
                {complaint.reason}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-text-strong mb-4">معلومات الوقت</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium mb-0.5">تاريخ الإنشاء</p>
                  <p className="text-sm font-semibold text-text-strong">
                    {new Date(complaint.createdAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-medium mb-0.5">آخر تحديث</p>
                    <p className="text-sm font-semibold text-text-strong">
                      {new Date(complaint.updatedAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {complaint.readAt && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Eye className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium mb-0.5">تاريخ القراءة</p>
                    <p className="text-sm font-semibold text-text-strong">
                      {new Date(complaint.readAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {complaint.pinnedAt && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Pin className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 font-medium mb-0.5">تاريخ التثبيت</p>
                    <p className="text-sm font-semibold text-text-strong">
                      {new Date(complaint.pinnedAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          {complaint.user && (
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-text-strong">المشتكي</h2>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">
                    {complaint.user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-strong truncate">
                    {complaint.user.name}
                  </p>
                  {complaint.user.phone && (
                    <p className="text-xs text-text-sub font-english">{complaint.user.phone}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate(`/users/clients/${complaint.userId}`)}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-gray-50 transition-colors">
                عرض الملف الشخصي
              </button>
            </div>
          )}

          {/* Freelancer Info */}
          {complaint.freelancer && (
            <div className="bg-white rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-text-strong">المستقل</h2>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-lg">
                    {complaint.freelancer.name?.charAt(0).toUpperCase() || 'F'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-strong truncate">
                    {complaint.freelancer.name}
                  </p>
                  {complaint.freelancer.phone && (
                    <p className="text-xs text-text-sub font-english">{complaint.freelancer.phone}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate(`/users/freelancers/${complaint.freelancerId}`)}
                className="w-full px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-gray-50 transition-colors">
                عرض الملف الشخصي
              </button>
            </div>
          )}

          {/* Complaint ID */}
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-text-strong">معرف الشكوى</h2>
            </div>
            <p className="text-sm font-english text-text-sub font-mono break-all">
              {complaint.id}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      {complaint && showChat && (
        <div className="mb-6">
          <ComplaintChat complaint={complaint} />
        </div>
      )}
    </div>
  );
}

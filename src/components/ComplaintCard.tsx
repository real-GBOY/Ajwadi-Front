import { useNavigate } from 'react-router-dom';
import { Complaint } from '../services/complaintService';
import { Eye, Pin, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
}

export default function ComplaintCard({ complaint }: ComplaintCardProps) {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    if (status === 'resolved') {
      return (
        <span
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border"
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
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border"
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

  return (
    <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {complaint.pinned && (
              <Pin className="w-4 h-4 text-primary fill-primary" />
            )}
            {!complaint.read && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
            <h3 className="text-lg font-semibold text-text-strong">
              شكوى #{complaint.id.slice(0, 8)}
            </h3>
          </div>
          {complaint.resonsummary && (
            <p className="text-sm text-text-sub mb-2">{complaint.resonsummary}</p>
          )}
        </div>
        {getStatusBadge(complaint.status)}
      </div>

      {/* User and Freelancer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {complaint.user && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-sm">
                {complaint.user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-600 font-medium mb-0.5">المشتكي</p>
              <p className="text-sm font-semibold text-text-strong truncate">
                {complaint.user.name}
              </p>
              {complaint.user.phone && (
                <p className="text-xs text-text-sub font-english">{complaint.user.phone}</p>
              )}
            </div>
          </div>
        )}

        {complaint.freelancer && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-bold text-sm">
                {complaint.freelancer.name?.charAt(0).toUpperCase() || 'F'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-purple-600 font-medium mb-0.5">المستقل</p>
              <p className="text-sm font-semibold text-text-strong truncate">
                {complaint.freelancer.name}
              </p>
              {complaint.freelancer.phone && (
                <p className="text-xs text-text-sub font-english">{complaint.freelancer.phone}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reason Preview */}
      {complaint.reason && (
        <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-text-strong line-clamp-2">{complaint.reason}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-text-sub">
          <span>
            {new Date(complaint.createdAt).toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {complaint.readAt && (
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              مقروء
            </span>
          )}
        </div>
        <button
          onClick={() => navigate(`/complain/projects/${complaint.id}`)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--c-primary)',
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--c-primary-dark)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--c-primary)';
          }}>
          <Eye className="w-4 h-4" />
          <span>عرض التفاصيل</span>
        </button>
      </div>
    </div>
  );
}

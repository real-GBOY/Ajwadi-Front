import { useNavigate } from 'react-router-dom';
import type { User } from '../services/userService';
import { Eye, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserCardProps {
  user: User;
  viewPath: string;
  showJobTitle?: boolean;
  showSpecification?: boolean;
  showRating?: boolean;
  showAvailability?: boolean;
}

export default function UserCard({
  user,
  viewPath,
  showJobTitle = false,
  showSpecification = false,
  showRating = false,
  showAvailability = false,
}: UserCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const profilePictureUrl = user.profilePictureData?.url;
  const name = user.name || '-';
  const initials = name.charAt(0).toUpperCase();

  const handleView = () => {
    navigate(viewPath);
  };

  return (
    <div
      className="bg-white border border-border rounded-lg p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer h-full flex flex-col"
      onClick={handleView}>
      {/* Header with Avatar and View Button */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="relative w-12 h-12 flex-shrink-0">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt={name}
                className="w-12 h-12 rounded-full object-cover border-2 border-border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold text-base ${
                profilePictureUrl ? 'hidden' : 'flex'
              }`}
              style={{ display: profilePictureUrl ? 'none' : 'flex' }}>
              {initials}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-text-strong mb-0.5 break-words leading-tight">{name}</h3>
            {showJobTitle && user.jobTitle && (
              <p className="text-sm text-text-sub break-words leading-tight">{user.jobTitle}</p>
            )}
            {showSpecification && user.specification && (
              <p className="text-sm text-text-sub break-words leading-tight">{user.specification.name}</p>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleView();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
          title={t('actions.view', 'عرض')}>
          <Eye className="w-3.5 h-3.5" />
          <span>{t('actions.view', 'عرض')}</span>
        </button>
      </div>

      {/* Phone Number */}
      {user.phone && (
        <div className="mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-sub whitespace-nowrap">{t('labels.phone', 'رقم الجوال')}:</span>
            <span className="text-xs font-english text-text-strong truncate">{user.phone}</span>
          </div>
          {showRating && user.avgRating && user.avgRating !== '0.00' && user.avgRating !== 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-text-sub">{t('labels.rating', 'التقييم')}:</span>
              <span className="text-xs font-medium text-text-strong">
                {typeof user.avgRating === 'string'
                  ? parseFloat(user.avgRating).toFixed(1)
                  : user.avgRating.toFixed(1)}{' '}
                ({user.totalReviews || 0})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-4 flex-1">
        {user.mode === 'client' ? (
          <>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                user.isVerifiedAsClient
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}>
              {user.isVerifiedAsClient ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 me-1" /> {t('status.verified', 'محقق')}
                </>
              ) : (
                t('status.unverified', 'غير محقق')
              )}
            </span>
          </>
        ) : (
          <>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                user.isVerifiedAsFreelancer
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}>
              {user.isVerifiedAsFreelancer ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 me-1" /> {t('status.verified', 'محقق')}
                </>
              ) : (
                t('status.unverified', 'غير محقق')
              )}
            </span>
            {showAvailability && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                  user.available
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}>
                {user.available ? t('status.available', 'متاح') : t('status.unavailable', 'غير متاح')}
              </span>
            )}
          </>
        )}
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
            user.isSuspended
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
          {user.isSuspended ? t('status.suspended', 'معلق') : t('status.active', 'نشط')}
        </span>
      </div>

      {/* Creation Date */}
      {user.createdAt && (
        <div className="pt-3 border-t border-border mt-auto">
          <p className="text-xs text-text-sub">
            {t('labels.createdAt', 'تاريخ الإنشاء')}:{' '}
            <span className="font-medium text-text-strong">
              {new Date(user.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
